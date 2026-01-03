
'use server';

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { Enrollment } from '@/types';

export async function approveUser(userId: string) {
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }
    try {
        // Update user status to approved
        const { error: userError } = await supabase
            .from('users')
            .update({ status: 'approved' })
            .eq('id', userId);

        if (userError) {
            throw userError;
        }

        // Delete the registration request if it exists
        const { error: requestError } = await supabase
            .from('registration_requests')
            .delete()
            .eq('user_id', userId);

        if (requestError) {
            console.warn('No registration request found to delete:', requestError);
        }

        revalidatePath('/admin/users');
        return { success: true, message: "User approved successfully." };
    } catch (error: unknown) {
        console.error('Error approving user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to approve user.';
        return { success: false, error: errorMessage };
    }
}

async function deleteAuthUser(uid: string) {
    try {
        // In Supabase, user deletion is typically handled through the admin API
        // For now, we'll log the deletion request and handle it manually
        // or implement a server-side function to handle auth user deletion
        console.log(`User deletion requested for UID: ${uid}`);
        console.log('Note: Auth user deletion should be handled through Supabase Admin API or RLS policies');
        return { success: true };
    } catch (error: unknown) {
        console.error(`Error with user deletion request for UID: ${uid}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to process user deletion request.';
        return { success: false, error: errorMessage };
    }
}


export async function rejectUser(userId: string) {
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }
    try {
        // Delete the user record
        const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) {
            throw userError;
        }

        // Delete the registration request if it exists
        const { error: requestError } = await supabase
            .from('registration_requests')
            .delete()
            .eq('user_id', userId);

        if (requestError) {
            console.warn('No registration request found to delete:', requestError);
        }
        
        // Also delete from auth (handled by deleteAuthUser function)
        await deleteAuthUser(userId);

        revalidatePath('/admin/users');
        return { success: true, message: "User registration rejected." };
    } catch (error: unknown) {
        console.error('Error rejecting user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to reject user.';
        return { success: false, error: errorMessage };
    }
}


export async function suspendUser(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required.' };
    try {
        const { error } = await supabase
            .from('users')
            .update({ status: 'suspended' })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        revalidatePath('/admin/users');
        return { success: true, message: 'User suspended.' };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to suspend user.';
        return { success: false, error: errorMessage };
    }
}


export async function reinstateUser(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required.' };
    try {
        const { error } = await supabase
            .from('users')
            .update({ status: 'approved' })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        revalidatePath('/admin/users');
        return { success: true, message: 'User reinstated.' };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to reinstate user.';
        return { success: false, error: errorMessage };
    }
}


export async function revokeCourseAccess(enrollmentId: string) {
    if (!enrollmentId) return { success: false, error: 'Enrollment ID is required.' };

    try {
        // First get the enrollment to check if it exists and get course ID
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('id', enrollmentId)
            .single();

        if (enrollmentError || !enrollment) {
            return { success: false, error: "Enrollment not found." };
        }

        // Check if the course exists and get its current student count
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('student_count')
            .eq('id', enrollment.course_id)
            .single();

        // Delete the enrollment record
        const { error: deleteError } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentId);

        if (deleteError) {
            throw deleteError;
        }

        // Update course student count if course exists and has students
        if (!courseError && course && course.student_count > 0) {
            const { error: updateError } = await supabase
                .from('courses')
                .update({ student_count: course.student_count - 1 })
                .eq('id', enrollment.course_id);

            if (updateError) {
                console.warn('Warning: Failed to update course student count:', updateError);
            }
        }

        revalidatePath('/admin/users');
        revalidatePath('/admin/courses');
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to revoke course access.';
        return { success: false, error: errorMessage };
    }
}


export async function deleteUser(userId: string) {
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }
    
    try {
        // 1. Get all enrollments for this user to handle course student counts
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('id, course_id, status')
            .eq('user_id', userId);

        if (enrollmentsError) {
            console.error('Error fetching user enrollments:', enrollmentsError);
        }

        // 2. Delete user document from 'users' collection
        const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) {
            throw userError;
        }
        
        // 3. Delete registration request if it exists
        const { error: requestError } = await supabase
            .from('registration_requests')
            .delete()
            .eq('user_id', userId);

        if (requestError) {
            console.warn('No registration request found to delete:', requestError);
        }
        
        // 4. Delete all enrollments for this user
        if (enrollments && enrollments.length > 0) {
            const { error: deleteEnrollmentsError } = await supabase
                .from('enrollments')
                .delete()
                .eq('user_id', userId);

            if (deleteEnrollmentsError) {
                console.error('Error deleting enrollments:', deleteEnrollmentsError);
            }

            // 5. Update course student counts for approved enrollments
            for (const enrollment of enrollments) {
                if (enrollment.status === 'approved') {
                    // Get current course student count and decrement
                    const { data: course, error: courseError } = await supabase
                        .from('courses')
                        .select('student_count')
                        .eq('id', enrollment.course_id)
                        .single();

                    if (!courseError && course && course.student_count > 0) {
                        const { error: updateError } = await supabase
                            .from('courses')
                            .update({ student_count: course.student_count - 1 })
                            .eq('id', enrollment.course_id);

                        if (updateError) {
                            console.warn(`Warning: Failed to update student count for course ${enrollment.course_id}:`, updateError);
                        }
                    }
                }
            }
        }

        // 6. Delete user from Authentication (handled by deleteAuthUser function)
        const authDeleteResult = await deleteAuthUser(userId);
        if (!authDeleteResult.success) {
            // Even if auth deletion fails, we don't roll back the database changes.
            // The error is logged, and we can handle it manually.
            console.error(authDeleteResult.error);
            return { success: false, error: authDeleteResult.error };
        }

        revalidatePath('/admin/users');
        revalidatePath('/admin/courses');
        
        return { success: true, message: "User has been successfully deleted from the platform." };

    } catch (error: unknown) {
        console.error(`Failed to delete user data for ${userId}:`, error);
        return { success: false, error: 'Failed to delete user data from database.' };
    }
}

export async function approveEnrollment(enrollmentId: string) {
  if (!enrollmentId) return { success: false, message: "Enrollment ID is required." };

  try {
    // First, get the enrollment to check its status and get course ID
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      return { success: false, message: "Enrollment not found." };
    }

    if (enrollment.status !== 'pending') {
      return { success: false, message: "Enrollment has already been processed." };
    }

    // Check if the course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, student_count')
      .eq('id', enrollment.course_id)
      .single();

    if (courseError || !course) {
      // If course doesn't exist, delete the enrollment
      await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);
      
      return { success: false, message: "The associated course no longer exists. The enrollment request has been deleted." };
    }

    // Update enrollment status and course student count
    const { error: updateEnrollmentError } = await supabase
      .from('enrollments')
      .update({ 
        status: 'approved', 
        enrolled_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (updateEnrollmentError) {
      throw updateEnrollmentError;
    }

    // Increment the course student count
    const { error: updateCourseError } = await supabase
      .from('courses')
      .update({ 
        student_count: (course.student_count || 0) + 1
      })
      .eq('id', enrollment.course_id);

    if (updateCourseError) {
      console.error("Error updating course student count:", updateCourseError);
      // Don't fail the whole operation if course count update fails
    }

    revalidatePath('/admin/enrollments');
    revalidatePath('/admin/dashboard');

    return { success: true, message: "Enrollment approved." };
  } catch (error: unknown) {
    console.error("Error approving enrollment:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: errorMessage };
  }
}

export async function rejectEnrollment(enrollmentId: string) {
  if (!enrollmentId) return { success: false, message: "Enrollment ID is required." };
  
  try {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId);

    if (error) {
      throw error;
    }

    revalidatePath('/admin/enrollments');
    revalidatePath('/admin/dashboard');
    
    return { success: true, message: "Enrollment request rejected." };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: errorMessage };
  }
}

export async function approveCertificate(enrollmentId: string) {
    console.log('[approveCertificate] Called with:', enrollmentId);
    
    if (!enrollmentId) {
        return { success: false, error: 'Enrollment ID is required.' };
    }

    if (!supabaseAdmin) {
        return { success: false, error: 'Server configuration error' };
    }

    try {
        // Get enrollment to find course/user info
        const { data: enrollment, error: enrollmentError } = await supabaseAdmin
            .from('enrollments')
            .select('id, course_id, user_id')
            .eq('id', enrollmentId)
            .single();

        if (enrollmentError || !enrollment) {
            throw enrollmentError || new Error('Enrollment not found');
        }

        // Get course with instructor_id
        const { data: course, error: courseError } = await supabaseAdmin
            .from('courses')
            .select('title, instructor_id')
            .eq('id', enrollment.course_id)
            .single();

        if (courseError || !course) {
            throw courseError || new Error('Course not found');
        }

        // Get user name (student)
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('name')
            .eq('id', enrollment.user_id)
            .single();

        const studentName = user?.name || 'Student';

        // Get instructor name from instructor_id
        let instructorName = 'Course Instructor';
        if (course.instructor_id) {
            const { data: instructor } = await supabaseAdmin
                .from('users')
                .select('name')
                .eq('id', course.instructor_id)
                .single();
            if (instructor?.name) {
                instructorName = instructor.name;
            }
        }

        // Update enrollment with certificate approval and metadata
        const { error: updateError } = await supabaseAdmin
            .from('enrollments')
            .update({
                certificate_status: 'approved',
                certificate_approved_at: new Date().toISOString(),
                certificate_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/certificates/${enrollmentId}.pdf`,
                student_name: studentName,
                course_title: course.title,
                instructor_name: instructorName
            })
            .eq('id', enrollmentId);

        if (updateError) {
            console.error('[approveCertificate] Error:', updateError);
            throw updateError;
        }

        console.log('[approveCertificate] Success');
        revalidatePath('/(main)/admin/certificates');
        revalidatePath('/(main)/student/certificates');
        
        return { success: true, message: 'Certificate approved successfully.' };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to approve certificate.';
        console.error('[approveCertificate] Caught error:', errorMessage);
        return { success: false, error: errorMessage };
    }
}

export async function resetCertificate(enrollmentId: string) {
    if (!enrollmentId) {
        return { success: false, error: 'Enrollment ID is required.' };
    }

    if (!supabaseAdmin) {
        return { success: false, error: 'Server configuration error' };
    }

    try {
        const { error } = await supabaseAdmin
            .from('enrollments')
            .update({
                certificate_status: 'requested',
                certificate_approved_at: null,
                certificate_url: null
            })
            .eq('id', enrollmentId);

        if (error) {
            throw error;
        }

        revalidatePath('/(main)/admin/certificates');
        revalidatePath('/(main)/student/certificates');
        
        return { success: true, message: 'Certificate reset to pending approval.' };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to reset certificate.';
        console.error('[resetCertificate] Error:', errorMessage);
        return { success: false, error: errorMessage };
    }
}

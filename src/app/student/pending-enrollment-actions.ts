'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import type { Enrollment } from '@/types';

/**
 * CREATE PENDING ENROLLMENT - For all new enrollments (free or paid)
 * All enrollments start with status='pending' and require admin approval
 */
export async function createPendingEnrollment(
  courseId: string,
  userId: string,
  paymentInfo?: {
    paymentId?: string;
    orderId?: string;
    amount?: number;
    paymentStatus: 'paid' | 'free';
    couponCode?: string;
  }
): Promise<{ success: boolean; error?: string; enrollment?: Enrollment }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    if (!courseId || !userId) {
      return { success: false, error: 'Missing course or user ID' };
    }

    // Check if user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabaseAdmin
      .from('enrollments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return { 
        success: false, 
        error: `Already enrolled in this course (status: ${existingEnrollment.status})`
      };
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, title, instructor_id, price, type')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return { success: false, error: 'Course not found' };
    }

    // Get student details
    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single();

    if (studentError || !student) {
      return { success: false, error: 'Student not found' };
    }

    // Get instructor name
    const { data: instructor } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', course.instructor_id)
      .single();

    // Create enrollment with PENDING status
    const enrollmentData = {
      user_id: userId,
      course_id: courseId,
      instructor_id: course.instructor_id,
      student_name: student.name,
      course_title: course.title,
      course_price: course.price || 0,
      instructor_name: instructor?.name || 'Unknown',
      progress: 0,
      completed_lessons: [],
      status: 'pending', // ⭐ ALL enrollments start as pending
      enrolled_at: new Date().toISOString(),
      coupon_code: paymentInfo?.couponCode || null,
      payment_status: paymentInfo?.paymentStatus || 'free',
      payment_id: paymentInfo?.paymentId || null,
      order_id: paymentInfo?.orderId || null,
      amount: paymentInfo?.amount || null,
      purchase_date: paymentInfo?.paymentId ? new Date().toISOString() : null,
      certificate_status: 'not_eligible'
    };

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert([enrollmentData])
      .select()
      .single();

    if (enrollmentError || !enrollment) {
      console.error('Error creating enrollment:', enrollmentError);
      return { success: false, error: 'Failed to create enrollment' };
    }

    console.log(`✅ Enrollment created with status='pending': ${enrollment.id}`);
    console.log(`📧 Admin will need to approve this enrollment for: ${student.name}`);

    // Revalidate paths
    revalidatePath('/student/dashboard');
    revalidatePath('/admin/enrollments');

    return { 
      success: true, 
      enrollment: {
        id: enrollment.id,
        userId: enrollment.user_id,
        courseId: enrollment.course_id,
        instructorId: enrollment.instructor_id,
        status: enrollment.status,
        progress: enrollment.progress,
        completedLessons: enrollment.completed_lessons,
        enrolledAt: enrollment.enrolled_at,
        couponCode: enrollment.coupon_code,
        purchaseDate: enrollment.purchase_date,
        completed: false,
        certificateStatus: enrollment.certificate_status,
        averageScore: enrollment.average_score,
        paymentId: enrollment.payment_id,
        orderId: enrollment.order_id
      }
    };
  } catch (error) {
    console.error('Error in createPendingEnrollment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unexpected error' 
    };
  }
}

/**
 * ADMIN: Approve enrollment (changes status from pending to approved)
 */
export async function approveEnrollmentAdmin(enrollmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (fetchError || !enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    if (enrollment.status !== 'pending') {
      return { success: false, error: `Cannot approve - enrollment already ${enrollment.status}` };
    }

    // Update enrollment status
    const { error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update({ 
        status: 'approved',
        enrolled_at: enrollment.enrolled_at || new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (updateError) {
      return { success: false, error: 'Failed to approve enrollment' };
    }

    // Increment course student count
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('student_count')
      .eq('id', enrollment.course_id)
      .single();

    if (course) {
      await supabaseAdmin
        .from('courses')
        .update({ student_count: (course.student_count || 0) + 1 })
        .eq('id', enrollment.course_id);
    }

    console.log(`✅ Enrollment approved: ${enrollmentId}`);

    // Revalidate paths
    revalidatePath('/admin/enrollments');
    revalidatePath('/student/dashboard');
    revalidatePath('/instructor/reports');

    return { success: true };
  } catch (error) {
    console.error('Error in approveEnrollmentAdmin:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * ADMIN: Reject enrollment (changes status from pending to rejected)
 */
export async function rejectEnrollmentAdmin(enrollmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (fetchError || !enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    if (enrollment.status !== 'pending') {
      return { success: false, error: `Cannot reject - enrollment already ${enrollment.status}` };
    }

    // Delete the enrollment (or mark as rejected)
    const { error: deleteError } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId);

    if (deleteError) {
      return { success: false, error: 'Failed to reject enrollment' };
    }

    console.log(`❌ Enrollment rejected and deleted: ${enrollmentId}`);

    // Revalidate paths
    revalidatePath('/admin/enrollments');

    return { success: true };
  } catch (error) {
    console.error('Error in rejectEnrollmentAdmin:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

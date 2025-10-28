'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import type { Enrollment } from '@/types';

export async function enrollInFreeCourse(
  courseId: string, 
  userId: string, 
  couponCode?: string
): Promise<{ success: boolean; error?: string; enrollment?: Enrollment }> {
  console.log('🚀 enrollInFreeCourse called with:', { courseId, userId, couponCode });
  
  if (!courseId || !userId) {
    console.error('❌ Missing required parameters:', { courseId, userId });
    return { success: false, error: 'Missing course or user information.' };
  }

  try {
    if (!supabaseAdmin) {
      console.error('Supabase Admin client not available');
      return { success: false, error: 'Service configuration error.' };
    }

    console.log('🔄 Checking existing enrollment for user:', userId, 'course:', courseId);
    
    // Check if user is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing enrollment:', checkError);
      return { success: false, error: 'Failed to check enrollment status.' };
    }

    if (existingEnrollment) {
      return { success: false, error: 'You are already enrolled in this course.' };
    }

    console.log('✅ No existing enrollment found, proceeding...');
    
    // Get course details for enrollment data
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('instructor_id, title, price, student_count')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Error fetching course details:', courseError);
      return { success: false, error: 'Course not found.' };
    }

    console.log('✅ Course details fetched:', { title: course.title, price: course.price });

    // Get user (student) details
    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    if (studentError) {
      console.error('Error fetching student details:', studentError);
      return { success: false, error: 'Student not found.' };
    }

    console.log('✅ Student details fetched:', { name: student.name });

    // Get instructor details
    const { data: instructor, error: instructorError } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', course.instructor_id)
      .single();

    if (instructorError) {
      console.error('Error fetching instructor details:', instructorError);
      return { success: false, error: 'Instructor not found.' };
    }

    console.log('✅ Instructor details fetched:', { name: instructor.name });

    // Create enrollment record
    const enrollmentData = {
      user_id: userId,
      course_id: courseId,
      instructor_id: course.instructor_id,
      student_name: student.name,
      course_title: course.title,
      course_price: course.price,
      instructor_name: instructor.name,
      status: 'approved', // Free courses are auto-approved
      progress: 0,
      completed_lessons: [],
      enrolled_at: new Date().toISOString(),
      coupon_code: couponCode || null,
      payment_status: 'free',
      purchase_date: new Date().toISOString()
    };

    console.log('🔄 Creating enrollment with data:', enrollmentData);
    
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (enrollmentError) {
      console.error('❌ Error creating enrollment:', enrollmentError);
      console.error('❌ Enrollment data that failed:', enrollmentData);
      return { success: false, error: `Failed to enroll in course: ${enrollmentError.message}` };
    }

    console.log('✅ Enrollment created successfully:', enrollment.id);
    
    // Update course student count
    const { error: updateError } = await supabaseAdmin
      .from('courses')
      .update({ 
        student_count: course.student_count ? course.student_count + 1 : 1 
      })
      .eq('id', courseId);

    if (updateError) {
      console.warn('Failed to update student count:', updateError);
    }

    // Revalidate relevant paths
    revalidatePath('/student/dashboard');
    revalidatePath('/courses');
    revalidatePath(`/courses/${courseId}`);

    // Convert to camelCase for consistency
    const enrollmentResult: Enrollment = {
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
      completed: enrollment.completed || false,
      certificateStatus: enrollment.certificate_status,
      averageScore: enrollment.average_score,
      paymentId: enrollment.payment_id,
      orderId: enrollment.order_id
    };

    console.log('✅ Free course enrollment completed successfully!');
    return { success: true, enrollment: enrollmentResult };
  } catch (error) {
    console.error('❌ Error in enrollInFreeCourse:', error);
    return { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function enrollInPaidCourses(
  items: Array<{
    courseId: string;
    title: string;
    price: number;
    instructorId: string;
  }>,
  userId: string,
  paymentId: string,
  orderId: string,
  couponCode?: string
): Promise<{ success: boolean; error?: string; enrollments?: Enrollment[] }> {
  if (!items || items.length === 0 || !userId || !paymentId) {
    return { success: false, error: 'Missing required enrollment information.' };
  }

  try {
    if (!supabaseAdmin) {
      console.error('Supabase Admin client not available');
      return { success: false, error: 'Service configuration error.' };
    }

    console.log('🔄 Processing paid enrollment for courses:', items.map(i => i.courseId));
    
    // Check for existing enrollments
    const courseIds = items.map(item => item.courseId);
    const { data: existingEnrollments, error: checkError } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .in('course_id', courseIds);

    if (checkError) {
      console.error('Error checking existing enrollments:', checkError);
      return { success: false, error: 'Failed to check enrollment status.' };
    }

    const existingCourseIds = existingEnrollments?.map((e: any) => e.course_id) || [];
    const alreadyEnrolledCourses = items.filter(item => existingCourseIds.includes(item.courseId));

    if (alreadyEnrolledCourses.length > 0) {
      return { 
        success: false, 
        error: `You are already enrolled in: ${alreadyEnrolledCourses.map(c => c.title).join(', ')}` 
      };
    }

    // Get student details
    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    if (studentError) {
      console.error('Error fetching student details:', studentError);
      return { success: false, error: 'Student not found.' };
    }

    // Get instructor details for all courses
    const uniqueInstructorIds = items.map(item => item.instructorId).filter((id, index, arr) => arr.indexOf(id) === index);
    const { data: instructors, error: instructorError } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .in('id', uniqueInstructorIds);

    if (instructorError) {
      console.error('Error fetching instructor details:', instructorError);
      return { success: false, error: 'Instructor details not found.' };
    }

    const instructorMap = instructors?.reduce((acc: any, instructor: any) => {
      acc[instructor.id] = instructor.name;
      return acc;
    }, {}) || {};

    // Create enrollment records
    const enrollmentData = items.map(item => ({
      user_id: userId,
      course_id: item.courseId,
      instructor_id: item.instructorId,
      student_name: student.name,
      course_title: item.title,
      course_price: item.price,
      instructor_name: instructorMap[item.instructorId] || 'Unknown',
      status: 'approved', // Paid courses are auto-approved
      progress: 0,
      completed_lessons: [],
      enrolled_at: new Date().toISOString(),
      coupon_code: couponCode || null,
      payment_status: 'paid',
      payment_id: paymentId,
      order_id: orderId,
      purchase_date: new Date().toISOString()
    }));

    console.log('🔄 Creating paid enrollments with data:', enrollmentData);
    
    const { data: enrollments, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert(enrollmentData)
      .select();

    if (enrollmentError) {
      console.error('Error creating enrollments:', enrollmentError);
      return { success: false, error: 'Failed to enroll in courses.' };
    }

    // Update student counts for all courses
    for (const courseId of courseIds) {
      // Get current student count
      const { data: courseData, error: fetchError } = await supabaseAdmin
        .from('courses')
        .select('student_count')
        .eq('id', courseId)
        .single();

      if (!fetchError && courseData) {
        const { error: updateError } = await supabaseAdmin
          .from('courses')
          .update({ 
            student_count: (courseData.student_count || 0) + 1
          })
          .eq('id', courseId);

        if (updateError) {
          console.warn(`Failed to update student count for course ${courseId}:`, updateError);
        }
      }
    }

    // Revalidate relevant paths
    revalidatePath('/student/dashboard');
    revalidatePath('/courses');
    courseIds.forEach(courseId => {
      revalidatePath(`/courses/${courseId}`);
    });

    // Convert to camelCase for consistency
    console.log('✅ Paid enrollments created successfully:', enrollments?.length);
    
    const enrollmentResults: Enrollment[] = enrollments?.map((enrollment: any) => ({
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
      completed: enrollment.completed || false,
      certificateStatus: enrollment.certificate_status,
      averageScore: enrollment.average_score,
      paymentId: enrollment.payment_id,
      orderId: enrollment.order_id
    })) || [];

    return { success: true, enrollments: enrollmentResults };
  } catch (error) {
    console.error('Error in enrollInPaidCourses:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
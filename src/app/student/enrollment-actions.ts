'use server';

import { createClient } from '@supabase/supabase-js';
import { createPendingEnrollment } from './pending-enrollment-actions';

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

interface EnrollmentResult {
  success: boolean;
  message?: string;
  error?: string;
  enrollmentId?: string;
}

/**
 * Enroll a student in a free course
 * Creates a pending enrollment that requires admin approval
 */
export async function enrollInFreeCourse(
  courseId: string,
  userId: string,
  couponCode?: string
): Promise<EnrollmentResult> {
  try {
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin not configured');
      return { success: false, error: 'Server configuration error' };
    }

    if (!courseId || !userId) {
      return { success: false, error: 'Missing required fields: courseId or userId' };
    }

    console.log('📝 Creating pending enrollment for free course:', courseId, 'User:', userId);

    // Use the shared pending enrollment function
    const result = await createPendingEnrollment(courseId, userId, {
      paymentStatus: 'free',
      couponCode: couponCode
    });

    if (result.success) {
      console.log('✅ Pending enrollment created successfully:', result.enrollment?.id);
      return {
        success: true,
        message: 'Enrollment pending admin approval',
        enrollmentId: result.enrollment?.id
      };
    } else {
      console.error('❌ Failed to create pending enrollment:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to create enrollment'
      };
    }

  } catch (error) {
    console.error('❌ Error in enrollInFreeCourse:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Enroll a student in a paid course after successful payment
 * Creates a pending enrollment that requires admin approval
 */
export async function enrollInPaidCourses(
  courseIds: string[],
  userId: string,
  paymentId: string,
  orderId: string
): Promise<EnrollmentResult> {
  try {
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin not configured');
      return { success: false, error: 'Server configuration error' };
    }

    if (!courseIds || courseIds.length === 0 || !userId || !paymentId || !orderId) {
      return { success: false, error: 'Missing required fields' };
    }

    console.log('💳 Processing paid course enrollment for:', courseIds, 'User:', userId, 'Payment:', paymentId);

    // Get payment details to include course price info
    const { data: paymentData } = await supabaseAdmin
      .from('payments')
      .select('amount, created_at')
      .eq('razorpay_payment_id', paymentId)
      .single();

    let successCount = 0;
    let failedCourses: string[] = [];
    let lastEnrollmentId = '';

    // Enroll in each course
    for (const courseId of courseIds) {
      try {
        console.log('🔄 Enrolling in paid course:', courseId);

        // Get course details for price info
        const { data: course } = await supabaseAdmin
          .from('courses')
          .select('title, price')
          .eq('id', courseId)
          .single();

        const result = await createPendingEnrollment(courseId, userId, {
          paymentStatus: 'paid',
          paymentId: paymentId,
          orderId: orderId,
          amount: course?.price || paymentData?.amount || 0
        });

        if (result.success) {
          console.log('✅ Pending paid enrollment created:', courseId);
          successCount++;
          lastEnrollmentId = result.enrollment?.id || '';
        } else {
          console.error('❌ Failed to enroll in paid course:', courseId, result.error);
          failedCourses.push(courseId);
        }
      } catch (courseError) {
        console.error('❌ Error processing paid course:', courseId, courseError);
        failedCourses.push(courseId);
      }
    }

    if (successCount === courseIds.length) {
      console.log('✅ All paid course enrollments processed successfully');
      return {
        success: true,
        message: `Enrolled in ${successCount} course(s) pending admin approval`,
        enrollmentId: lastEnrollmentId
      };
    } else if (successCount > 0) {
      console.warn(`⚠️ Partial enrollment: ${successCount}/${courseIds.length} successful`);
      return {
        success: true,
        message: `Enrolled in ${successCount}/${courseIds.length} courses pending admin approval. Failed: ${failedCourses.join(', ')}`,
        enrollmentId: lastEnrollmentId
      };
    } else {
      console.error('❌ All paid course enrollments failed');
      return {
        success: false,
        error: `Failed to enroll in courses: ${failedCourses.join(', ')}`
      };
    }

  } catch (error) {
    console.error('❌ Error in enrollInPaidCourses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

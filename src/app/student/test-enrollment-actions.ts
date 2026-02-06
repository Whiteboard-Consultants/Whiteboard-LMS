'use server';

import { createClient } from '@supabase/supabase-js';
import type { Enrollment } from '@/types';

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
  data?: Enrollment;
  error?: string;
}

/**
 * Enroll a student in a test (purchase/access a test)
 * Creates an enrollment record for tracking test access and purchases
 */
export async function enrollInTest(
  testId: string,
  userId: string,
  paymentInfo?: {
    paymentId?: string;
    orderId?: string;
    amount?: number;
  }
): Promise<EnrollmentResult> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    // First, get test details
    const { data: testData, error: testError } = await supabaseAdmin
      .from('tests')
      .select('id, title, instructor_id, price, is_free')
      .eq('id', testId)
      .single();

    if (testError || !testData) {
      return { success: false, error: 'Test not found' };
    }

    // Check if student already has access to this test
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('test_id', testId)
      .eq('user_id', userId)
      .single();

    if (existingEnrollment) {
      return { success: false, error: 'You already have access to this test' };
    }

    // Get student info
    const { data: studentData } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    // Create enrollment record
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: userId,
        test_id: testId,
        instructor_id: testData.instructor_id,
        is_test_purchase: true,
        status: 'approved', // Tests are immediately available
        payment_id: paymentInfo?.paymentId,
        order_id: paymentInfo?.orderId,
        amount: paymentInfo?.amount || testData.price || 0,
        purchase_date: new Date().toISOString(),
        // Student info
        student_name: studentData?.name || 'Unknown',
        // Test info (denormalized for easy access)
        course_title: testData.title
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error('Error creating test enrollment:', enrollmentError);
      return { success: false, error: enrollmentError.message };
    }

    return {
      success: true,
      data: {
        id: enrollment.id,
        userId: enrollment.user_id,
        testId: enrollment.test_id,
        studentName: enrollment.student_name,
        instructorId: enrollment.instructor_id,
        courseTitle: enrollment.course_title,
        progress: 0,
        completed: false,
        enrolledAt: enrollment.enrolled_at,
        status: enrollment.status as 'pending' | 'approved',
        paymentId: enrollment.payment_id,
        orderId: enrollment.order_id,
        amount: enrollment.amount,
        purchaseDate: enrollment.purchase_date,
        isTestPurchase: true
      }
    };
  } catch (error: any) {
    console.error('Error in enrollInTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if a user has access to a specific test
 */
export async function hasTestAccess(
  testId: string,
  userId: string
): Promise<{ success: boolean; hasAccess: boolean; enrollment?: Enrollment }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, hasAccess: false };
    }

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('test_id', testId)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single();

    if (error || !data) {
      return { success: true, hasAccess: false };
    }

    return {
      success: true,
      hasAccess: true,
      enrollment: {
        id: data.id,
        userId: data.user_id,
        testId: data.test_id,
        studentName: data.student_name,
        instructorId: data.instructor_id,
        courseTitle: data.course_title,
        progress: data.progress || 0,
        completed: data.completed || false,
        enrolledAt: data.enrolled_at,
        status: data.status as 'pending' | 'approved',
        isTestPurchase: data.is_test_purchase
      }
    };
  } catch (error: any) {
    console.error('Error in hasTestAccess:', error);
    return { success: false, hasAccess: false };
  }
}

/**
 * Get all test enrollments for a user
 */
export async function getUserTestEnrollments(
  userId: string
): Promise<{ success: boolean; data?: Enrollment[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_test_purchase', true)
      .order('purchased_date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const formattedData = (data || []).map((enrollment: any) => ({
      id: enrollment.id,
      userId: enrollment.user_id,
      testId: enrollment.test_id,
      studentName: enrollment.student_name,
      instructorId: enrollment.instructor_id,
      courseTitle: enrollment.course_title,
      progress: enrollment.progress || 0,
      completed: enrollment.completed || false,
      enrolledAt: enrollment.enrolled_at,
      status: enrollment.status as 'pending' | 'approved',
      isTestPurchase: true
    }));

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Error in getUserTestEnrollments:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a test attempt record (track when a student takes a test)
 */
export async function createTestAttempt(
  testId: string,
  userId: string,
  enrollmentId?: string
): Promise<{ success: boolean; data?: { id: string; startTime: string }; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('test_attempts')
      .insert({
        test_id: testId,
        user_id: userId,
        enrollment_id: enrollmentId,
        status: 'in-progress'
      })
      .select('id, start_time')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        startTime: data.start_time
      }
    };
  } catch (error: any) {
    console.error('Error in createTestAttempt:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Complete a test attempt with results
 */
export async function completeTestAttempt(
  attemptId: string,
  results: {
    score?: number;
    totalMarks?: number;
    correctAnswers?: number;
    incorrectAnswers?: number;
    unattempted?: number;
    timeSpent?: number;
    answers?: Record<string, any>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const { error } = await supabaseAdmin
      .from('test_attempts')
      .update({
        status: 'completed',
        submitted_at: new Date().toISOString(),
        score: results.score,
        total_marks: results.totalMarks,
        correct_answers: results.correctAnswers,
        incorrect_answers: results.incorrectAnswers,
        unattempted: results.unattempted,
        time_spent: results.timeSpent,
        answers: results.answers
      })
      .eq('id', attemptId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in completeTestAttempt:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get test attempts for a user on a specific test
 */
export async function getTestAttempts(
  testId: string,
  userId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('test_attempts')
      .select('*')
      .eq('test_id', testId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error in getTestAttempts:', error);
    return { success: false, error: error.message };
  }
}

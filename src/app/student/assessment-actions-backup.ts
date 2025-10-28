'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

interface SubmitTestParams {
  testId: string;
  userId: string;
  answers: number[];
  answerDetails: Array<{
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export async function submitTest({
  testId,
  userId,
  answers,
  answerDetails
}: SubmitTestParams) {
  if (!testId || !userId || !answers) {
    return { success: false, error: 'Missing required parameters.' };
  }

  try {
    // Calculate score
    const correctAnswers = answerDetails.filter(detail => detail.isCorrect).length;
    const totalQuestions = answerDetails.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Get test and course information
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select(`
        *,
        courses (
          id,
          title,
          has_certificate,
          instructor_id
        )
      `)
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error('Error fetching test:', testError);
      return { success: false, error: 'Test not found.' };
    }

    // Get enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', test.course_id)
      .single();

    if (enrollmentError || !enrollment) {
      console.error('Error fetching enrollment:', enrollmentError);
      return { success: false, error: 'Enrollment not found.' };
    }

    // Create test attempt record
    const attemptData = {
      id: crypto.randomUUID(),
      user_id: userId,
      test_id: testId,
      course_id: test.course_id,
      enrollment_id: enrollment.id,
      answers: answers,
      answer_details: answerDetails,
      score: correctAnswers,
      total_questions: totalQuestions,
      percentage: percentage,
      passed: percentage >= 80, // Using the new 80% threshold
      submitted_at: new Date().toISOString(),
      time_taken: null // Can be calculated if needed
    };

    const { data: testAttempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert(attemptData)
      .select()
      .single();

    if (attemptError) {
      console.error('Error creating test attempt:', attemptError);
      return { success: false, error: 'Failed to save test attempt.' };
    }

    // Update enrollment with test results and course completion
    const enrollmentUpdate: any = {
      average_score: percentage
    };

    // If this is a final assessment, update course completion
    if (test.is_final_assessment) {
      enrollmentUpdate.progress = 100;
      enrollmentUpdate.completed = true;

      // Set certificate eligibility based on new 80% threshold
      if (test.courses?.has_certificate) {
        enrollmentUpdate.certificate_status = percentage >= 80 ? 'eligible' : 'not_eligible';
      }
    }

    const { error: updateError } = await supabase
      .from('enrollments')
      .update(enrollmentUpdate)
      .eq('id', enrollment.id);

    if (updateError) {
      console.error('Error updating enrollment:', updateError);
      return { success: false, error: 'Failed to update enrollment.' };
    }

    // Update course statistics if needed
    if (test.is_final_assessment && percentage >= 80) {
      // Increment course completion count
      const { error: courseUpdateError } = await supabase
        .from('courses')
        .update({
          completed_count: (test.courses?.completed_count || 0) + 1
        })
        .eq('id', test.course_id);

      if (courseUpdateError) {
        console.error('Error updating course stats:', courseUpdateError);
        // Don't fail the entire operation for this
      }
    }

    // Revalidate relevant paths
    revalidatePath('/student/dashboard');
    revalidatePath('/student/certificates');
    revalidatePath(`/student/course/${test.course_id}`);

    return { 
      success: true, 
      attemptId: testAttempt.id,
      percentage,
      passed: percentage >= 80,
      certificateEligible: test.courses?.has_certificate && percentage >= 80
    };

  } catch (error) {
    console.error('Error submitting test:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit test.' 
    };
  }
}

export async function getTestAttempt(attemptId: string) {
  if (!attemptId) {
    return { success: false, error: 'Attempt ID is required.' };
  }

  try {
    const { data: attempt, error } = await supabase
      .from('test_attempts')
      .select(`
        *,
        tests (
          id,
          title,
          description,
          is_final_assessment
        ),
        courses (
          id,
          title,
          has_certificate
        ),
        users (
          id,
          name,
          email
        )
      `)
      .eq('id', attemptId)
      .single();

    if (error) {
      console.error('Error fetching test attempt:', error);
      return { success: false, error: 'Test attempt not found.' };
    }

    return { success: true, data: attempt };

  } catch (error) {
    console.error('Error getting test attempt:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get test attempt.' 
    };
  }
}

export async function getUserTestAttempts(userId: string, courseId?: string) {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }

  try {
    let query = supabase
      .from('test_attempts')
      .select(`
        *,
        tests (
          id,
          title,
          is_final_assessment
        ),
        courses (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: attempts, error } = await query;

    if (error) {
      console.error('Error fetching test attempts:', error);
      return { success: false, error: 'Failed to fetch test attempts.' };
    }

    return { success: true, data: attempts || [] };

  } catch (error) {
    console.error('Error getting user test attempts:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get test attempts.' 
    };
  }
}

export async function retakeTest(testId: string, userId: string) {
  if (!testId || !userId) {
    return { success: false, error: 'Test ID and User ID are required.' };
  }

  try {
    // Check if retakes are allowed for this test
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, title, max_attempts, is_final_assessment')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      return { success: false, error: 'Test not found.' };
    }

    // Count existing attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('test_attempts')
      .select('id')
      .eq('test_id', testId)
      .eq('user_id', userId);

    if (attemptsError) {
      console.error('Error checking attempts:', attemptsError);
      return { success: false, error: 'Failed to check attempt history.' };
    }

    const attemptCount = attempts?.length || 0;
    
    if (test.max_attempts && attemptCount >= test.max_attempts) {
      return { 
        success: false, 
        error: `Maximum attempts (${test.max_attempts}) reached for this test.` 
      };
    }

    return { 
      success: true, 
      message: 'Retake allowed',
      attemptsUsed: attemptCount,
      maxAttempts: test.max_attempts || null
    };

  } catch (error) {
    console.error('Error checking retake eligibility:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check retake eligibility.' 
    };
  }
}

export async function getTestAttemptForResults(attemptId: string) {
  if (!attemptId) {
    console.error("Test attempt ID is required.");
    return null;
  }

  try {
    const { data: attempt, error } = await supabase
      .from('test_attempts')
      .select(`
        *,
        tests (
          id,
          title,
          course_title
        )
      `)
      .eq('id', attemptId)
      .single();

    if (error || !attempt) {
      console.error('Test attempt not found:', error);
      return null;
    }

    // Get test questions to reconstruct the quiz format
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', attempt.test_id)
      .order('order_number');

    if (questionsError || !questions) {
      console.error('Test questions not found:', questionsError);
      return null;
    }

    // Transform the data to match the QuizAttemptData interface
    const transformedAttempt = {
      id: attempt.id,
      user_id: attempt.user_id,
      lesson_id: attempt.test_id, // Using test_id as lesson_id for compatibility
      course_id: attempt.test_id, // Using test_id as course_id for compatibility
      enrollment_id: attempt.enrollment_id,
      answers: attempt.answers || [],
      questions: questions.map((q, index) => ({
        id: q.id,
        questionText: q.question_text,
        options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []),
        correctAnswerIndex: parseInt(q.correct_answer) || 0,
        explanation: q.explanation || ''
      })),
      score: attempt.correct_answers || 0,
      total_questions: questions.length,
      submitted_at: attempt.submitted_at,
      test_title: attempt.tests?.title || 'Test Results',
      course_title: attempt.tests?.course_title || ''
    };

    return transformedAttempt;

  } catch (error) {
    console.error("Error fetching test attempt:", error);
    return null;
  }
}


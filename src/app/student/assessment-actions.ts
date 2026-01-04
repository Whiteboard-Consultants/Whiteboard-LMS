'use server';

import { createClient } from '@supabase/supabase-js';

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

/**
 * Submit a test/quiz attempt for evaluation
 */
export async function submitTest(params: {
  testId: string;
  userId: string;
  answers: number[];
  answerDetails: any[];
}) {
  try {
    if (!supabaseAdmin) {
      console.error('❌ No supabaseAdmin client');
      return { success: false, error: 'Server configuration error' };
    }

    const { testId, userId, answers, answerDetails } = params;

    console.log('📝 Submitting test:', { testId, userId, answerCount: answers.length });

    // Get test details - test ID should be UUID or numeric
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError) {
      console.error('❌ Error fetching test:', testError.message, testError.code);
      return { success: false, error: `Test not found: ${testError.message}` };
    }

    if (!test) {
      console.error('❌ Test record not found for ID:', testId);
      return { success: false, error: 'Test not found' };
    }

    console.log('✅ Test loaded:', { id: test.id, title: test.title, courseId: test.course_id });

    // Get enrollment for this user and course
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', test.course_id)
      .single();

    if (enrollmentError) {
      console.error('❌ Error fetching enrollment:', enrollmentError.message);
      return { success: false, error: `Enrollment not found: ${enrollmentError.message}` };
    }

    if (!enrollment) {
      console.error('❌ No enrollment found for user', userId, 'in course', test.course_id);
      return { success: false, error: 'No enrollment found for this course' };
    }

    console.log('✅ Enrollment found:', enrollment.id);

    // Get test questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_number');

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError.message);
      return { success: false, error: 'Could not load questions' };
    }

    console.log('✅ Questions loaded:', questions?.length || 0);

    // Calculate score
    const correctAnswers = answers.filter((answer, index) => {
      const question = questions?.[index];
      const correct = answer === question?.correct_answer;
      if (index < 3) { // Log first 3 for debugging
        console.log(`  Q${index}: answer=${answer}, correct=${question?.correct_answer}, match=${correct}`);
      }
      return correct;
    }).length;

    const totalQuestions = questions?.length || 0;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = percentage >= (test.passing_score || 80);

    console.log('✅ Test scoring:', {
      correctAnswers,
      totalQuestions,
      percentage,
      passed,
      passingScore: test.passing_score || 80
    });

    // Create test attempt record
    const { data: attemptData, error: attemptError } = await supabaseAdmin
      .from('test_attempts')
      .insert({
        test_id: testId,
        user_id: userId,
        course_id: test.course_id,
        enrollment_id: enrollment.id,
        score: correctAnswers,
        total_questions: totalQuestions,
        percentage: percentage,
        passed: passed,
        answers: answers,
        answer_details: answerDetails,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (attemptError) {
      console.error('❌ Error creating test attempt:', attemptError.message, attemptError.code);
      return { success: false, error: `Failed to save attempt: ${attemptError.message}` };
    }

    if (!attemptData) {
      console.error('❌ No attempt data returned after insert');
      return { success: false, error: 'Failed to save test attempt' };
    }

    console.log('✅ Test attempt created:', { id: attemptData.id, percentage, passed });

    return {
      success: true,
      message: 'Test submitted successfully',
      attemptId: attemptData.id,
      percentage,
      passed
    };
  } catch (error) {
    console.error('❌ Exception in submitTest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit test'
    };
  }
}

/**
 * Get a test attempt by ID
 */
export async function getTestAttempt(attemptId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    // TODO: Implement test attempt retrieval
    console.log('📖 Getting test attempt:', attemptId);

    return {
      success: false,
      error: 'Test attempt not found'
    };
  } catch (error) {
    console.error('❌ Error getting test attempt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get test attempt'
    };
  }
}

/**
 * Get a test attempt with results for display
 */
export async function getTestAttemptForResults(attemptId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    // TODO: Implement test results retrieval with score calculation
    console.log('📊 Getting test results for attempt:', attemptId);

    return {
      success: false,
      error: 'Test results not found'
    };
  } catch (error) {
    console.error('❌ Error getting test results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get test results'
    };
  }
}

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
      // correct_answer is stored as string index ('0', '1', etc), need to parse as integer
      const correctAnswerIndex = parseInt(question?.correct_answer as string, 10);
      const correct = answer === correctAnswerIndex;
      if (index < 3) { // Log first 3 for debugging
        console.log(`  Q${index}: answer=${answer}, correct=${question?.correct_answer}, correctIndex=${correctAnswerIndex}, match=${correct}`);
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
      console.error('❌ Server configuration error: supabaseAdmin is not initialized');
      return null;
    }

    console.log('📖 Getting test attempt:', attemptId);

    // Fetch the test attempt - don't use .single() to avoid PGRST116 error
    const { data: attempts, error: attemptError } = await supabaseAdmin
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId);

    if (attemptError) {
      console.error('❌ Error fetching test attempt:', attemptError.message, attemptError.code);
      return null;
    }

    if (!attempts || attempts.length === 0) {
      console.error('❌ Test attempt not found with ID:', attemptId);
      return null;
    }

    const attempt = attempts[0];

    console.log('✅ Test attempt found:', {
      id: attempt.id,
      test_id: attempt.test_id,
      score: attempt.score,
      percentage: attempt.percentage
    });

    return attempt;
  } catch (error) {
    console.error('❌ Error getting test attempt:', error);
    return null;
  }
}

/**
 * Get a test attempt with results for display
 */
export async function getTestAttemptForResults(attemptId: string) {
  try {
    if (!supabaseAdmin) {
      console.error('❌ Server configuration error: supabaseAdmin is not initialized');
      return { success: false, error: 'Server configuration error' };
    }

    console.log('📊 Getting test results for attempt:', attemptId);

    // Fetch the test attempt - don't use .single() to avoid PGRST116 error
    const { data: attempts, error: attemptError } = await supabaseAdmin
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId);

    if (attemptError) {
      console.error('❌ Error fetching test attempt:', attemptError.message, attemptError.code);
      return {
        success: false,
        error: `Error fetching attempt: ${attemptError.message}`
      };
    }

    if (!attempts || attempts.length === 0) {
      console.error('❌ Test attempt not found with ID:', attemptId);
      return {
        success: false,
        error: 'Test attempt not found'
      };
    }

    const attempt = attempts[0];

    console.log('✅ Test attempt found:', {
      id: attempt.id,
      test_id: attempt.test_id,
      score: attempt.score,
      percentage: attempt.percentage
    });

    // Fetch the test details
    const { data: tests, error: testError } = await supabaseAdmin
      .from('tests')
      .select('id, title, course_id, description, duration, passing_score')
      .eq('id', attempt.test_id);

    if (testError) {
      console.error('❌ Error fetching test details:', testError.message);
      return {
        success: false,
        error: `Error fetching test: ${testError.message}`
      };
    }

    if (!tests || tests.length === 0) {
      console.error('❌ Test details not found for test_id:', attempt.test_id);
      return {
        success: false,
        error: 'Test details not found'
      };
    }

    const test = tests[0];

    // Fetch the course details
    const { data: courses, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, title')
      .eq('id', test.course_id);

    const course = courses && courses.length > 0 ? courses[0] : null;

    if (courseError) {
      console.warn('⚠️ Course fetch error (non-fatal):', courseError.message);
    }

    // Fetch test questions with answers
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('test_questions')
      .select('id, question_text, options, correct_answer, order_number')
      .eq('test_id', attempt.test_id)
      .order('order_number', { ascending: true });

    if (questionsError) {
      console.error('❌ Failed to fetch questions:', questionsError.message);
      return {
        success: false,
        error: 'Failed to fetch questions'
      };
    }

    // Format questions with user answers and correctness
    const formattedQuestions = (questions || []).map((q, index) => {
      const userAnswer = attempt.answers?.[index];
      const userAnswerDetail = attempt.answer_details?.[index];
      const options = q.options || [];
      
      // Parse options if string
      const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      
      // correct_answer is stored as a string index ('0', '1', etc.), not the option text
      const correctAnswerIndex = parseInt(q.correct_answer as string, 10);
      const correctAnswerText = parsedOptions[correctAnswerIndex] || '';
      
      return {
        id: q.id,
        questionText: q.question_text,
        options: parsedOptions,
        correctAnswerIndex,
        correctAnswerText,
        userAnswerIndex: userAnswer ?? -1,
        userAnswer: userAnswer !== undefined ? parsedOptions[userAnswer] : null,
        correct: userAnswer === correctAnswerIndex,
        explanation: userAnswerDetail?.explanation || null
      };
    });

    // Recalculate score based on actual answers vs correct answers
    const calculatedScore = formattedQuestions.filter(q => q.correct).length;
    const calculatedPercentage = formattedQuestions.length > 0 
      ? Math.round((calculatedScore / formattedQuestions.length) * 100)
      : 0;
    const calculatedPassed = calculatedPercentage >= (test.passing_score || 60);

    console.log('✅ Test results compiled:', {
      databaseScore: attempt.score,
      calculatedScore: calculatedScore,
      totalQuestions: formattedQuestions.length,
      databasePercentage: attempt.percentage,
      calculatedPercentage: calculatedPercentage,
      databasePassed: attempt.passed,
      calculatedPassed: calculatedPassed
    });

    return {
      id: attempt.id,
      user_id: attempt.user_id,
      course_id: test.course_id,
      test_id: attempt.test_id,
      enrollment_id: attempt.enrollment_id,
      score: calculatedScore,
      total_questions: formattedQuestions.length,
      percentage: calculatedPercentage,
      passed: calculatedPassed,
      submitted_at: attempt.created_at,
      answers: attempt.answers || [],
      questions: formattedQuestions,
      test_title: test.title || 'Test',
      course_title: course?.title || 'Course',
      courses: course ? { id: course.id, title: course.title } : null,
      certificateEligible: calculatedPassed === true
    };
  } catch (error) {
    console.error('❌ Error getting test results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get test results'
    };
  }
}

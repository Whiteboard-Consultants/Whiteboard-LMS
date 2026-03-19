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

    console.log('✅ Test loaded:', { 
      id: test.id, 
      title: test.title, 
      seriesId: test.series_id,
      courseId: test.course_id
    });

    // Get enrollment for this user and test/series
    // First, try to find enrollment by test_id
    let enrollment = null;
    let enrollmentError = null;

    // Try to find enrollment by test_id
    const { data: testEnrollment, error: testEnrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .single();

    if (!testEnrollmentError && testEnrollment) {
      enrollment = testEnrollment;
      console.log('✅ Enrollment found by test_id:', enrollment.id);
    } else if (test.series_id) {
      // If no test enrollment, try to find by series_id
      const { data: seriesEnrollment, error: seriesEnrollmentError } = await supabaseAdmin
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('series_id', test.series_id)
        .single();

      if (!seriesEnrollmentError && seriesEnrollment) {
        enrollment = seriesEnrollment;
        console.log('✅ Enrollment found by series_id:', enrollment.id);
      } else {
        enrollmentError = seriesEnrollmentError || new Error('No enrollment found');
      }
    } else {
      enrollmentError = testEnrollmentError || new Error('No enrollment found');
    }

    if (enrollmentError) {
      console.error('❌ Error fetching enrollment:', enrollmentError.message);
      return { success: false, error: `Enrollment not found: ${enrollmentError.message}` };
    }

    if (!enrollment) {
      console.error('❌ No enrollment found for user', userId, 'for test', testId);
      return { success: false, error: 'No enrollment found for this test' };
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
    console.log('📌 Questions array details:', questions?.map((q: any, i: number) => ({
      index: i,
      id: q.id,
      order: q.order_number,
      correct: q.correct_answer
    })));
    console.log('📌 Answers provided:', answers);
    console.log('📌 Answers length:', answers.length);

    // Calculate score with marks and negative marks
    let totalScore = 0;
    let totalMarks = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;

    answers.forEach((answer, index) => {
      const question = questions?.[index];
      if (!question) {
        console.log(`⚠️  Q${index + 1}: NO QUESTION FOUND at index ${index}`);
        return;
      }

      const marks = question.points || 1; // Default to 1 mark if not specified
      const negativeMarks = question.negative_marks || 0;
      const correctAnswerIndex = parseInt(question.correct_answer as string, 10);
      
      // Normalize answer to number for proper comparison
      const normalizedAnswer = answer === -1 || answer === null ? -1 : parseInt(String(answer), 10);

      totalMarks += marks; // Add to total marks for all questions

      if (normalizedAnswer === -1 || normalizedAnswer === null) {
        // Unattempted question
        unattempted++;
        if (index < 3) {
          console.log(`  Q${index + 1}: UNATTEMPTED`);
        }
      } else if (normalizedAnswer === correctAnswerIndex) {
        // Correct answer - add marks
        totalScore += marks;
        correctAnswers++;
        if (index < 6) {
          console.log(`  Q${index + 1}: CORRECT +${marks} marks (total: ${totalScore})`);
        }
      } else {
        // Incorrect answer - deduct negative marks
        const deduction = Math.min(negativeMarks, marks); // Don't go below 0
        totalScore -= deduction;
        incorrectAnswers++;
        if (index < 6) {
          console.log(`  Q${index + 1}: INCORRECT -${deduction} marks (total: ${totalScore})`);
        }
      }
    });

    // Ensure score doesn't go below 0
    totalScore = Math.max(0, totalScore);

    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    const passed = percentage >= (test.passing_score || 80);

    console.log('✅ Test scoring:', {
      totalScore,
      totalMarks,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      percentage,
      passed,
      passingScore: test.passing_score || 80
    });

    // Determine course_id: use series_id first, then course_id from test, or from enrollment
    let courseId = test.series_id || test.course_id || enrollment.course_id;
    
    if (!courseId) {
      console.error('❌ Could not determine course_id from test or enrollment:', {
        testSeriesId: test.series_id,
        testCourseId: test.course_id,
        enrollmentCourseId: enrollment.course_id
      });
      return { success: false, error: 'Test is not linked to a valid series or course' };
    }

    console.log('📝 Creating test attempt with course_id:', courseId);

    // Prepare the insert data with only fields that definitely exist in the table
    const insertData: any = {
      test_id: testId,
      user_id: userId,
      enrollment_id: enrollment.id,
      course_id: courseId,
      submitted_at: new Date().toISOString(),
      status: 'completed',
      answers: answers,
      score: totalScore,
      total_questions: questions?.length || 0
    };
    
    // Add optional fields if they might exist in the schema
    try {
      // Try to add these fields - if they don't exist, INSERT will fail and we'll retry without them
      insertData.total_marks = totalMarks;
      insertData.correct_answers = correctAnswers;
      insertData.incorrect_answers = incorrectAnswers;
      insertData.unattempted = unattempted;
    } catch (e) {
      console.warn('⚠️ Optional fields may not exist in schema');
    }

    console.log('📋 Insert data:', { 
      testId, 
      userId, 
      enrollmentId: enrollment.id,
      courseId,
      totalQuestions: questions?.length || 0,
      scoreValue: correctAnswers,
      scoreType: 'correctAnswers (satisfies CHECK constraint)',
      totalMarksValue: totalMarks,
      answersLength: answers.length,
      answersArray: answers.slice(0, 5),
      insertKeys: Object.keys(insertData)
    });

    const { data: attemptData, error: attemptError } = await supabaseAdmin
      .from('test_attempts')
      .insert(insertData)
      .select()
      .single();

    console.log('📊 Insert result:', { attemptDataId: attemptData?.id, attemptError: attemptError?.message });
    
    // If insert fails, log the error and attempt recovery strategies
    if (attemptError) {
      console.error('❌ Initial insert failed:', {
        message: attemptError.message,
        code: attemptError.code,
        details: attemptError.details
      });
      
      // Check if it's a column/schema issue - retry with minimal fields
      if (attemptError.message && (attemptError.message.includes('column') || attemptError.code === '42703')) {
        console.warn('⚠️ Schema mismatch detected, retrying with core fields only');
        
        const minimalData = {
          test_id: testId,
          user_id: userId,
          enrollment_id: enrollment.id,
          course_id: courseId,
          submitted_at: new Date().toISOString(),
          status: 'completed',
          answers: answers,
          score: totalScore,
          total_questions: questions?.length || 0
        };

        const { data: retryAttemptData, error: retryError } = await supabaseAdmin
          .from('test_attempts')
          .insert(minimalData)
          .select()
          .single();

        if (retryError) {
          console.error('❌ Retry failed:', retryError.message);
          return { success: false, error: `Failed to save attempt: ${retryError.message}` };
        }

        if (!retryAttemptData) {
          return { success: false, error: 'Failed to save test attempt' };
        }

        console.log('✅ Insert succeeded with retry:', retryAttemptData.id);
        return {
          success: true,
          message: 'Test submitted successfully',
          attemptId: retryAttemptData.id,
          percentage,
          passed
        };
      }

      // If it's a NOT NULL constraint on course_id, the course_id determination failed
      if (attemptError.message && attemptError.message.includes('course_id')) {
        console.error('❌ course_id NOT NULL constraint violation');
        return { success: false, error: `Failed to save attempt: Missing course information. Test must be linked to a valid course or series.` };
      }

      // Generic error
      console.error('❌ Error creating test attempt:', attemptError.message, attemptError.code);
      return { success: false, error: `Failed to save attempt: ${attemptError.message}` };
    }

    if (!attemptData) {
      console.error('❌ No attempt data returned after insert');
      return { success: false, error: 'Failed to save test attempt' };
    }

    // Update attempt record with additional scoring details
    // Only try to update if the columns exist (skip to avoid errors if columns are missing)
    // Since we now include all data in the INSERT, this update is optional
    if (correctAnswers !== undefined && totalMarks !== undefined) {
      const { error: updateError } = await supabaseAdmin
        .from('test_attempts')
        .update({
          total_marks: totalMarks,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          unattempted: unattempted
        })
        .eq('id', attemptData.id);

      if (updateError) {
        console.warn('⚠️ Could not update attempt with additional details (columns may not exist):', updateError.message);
      }
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
      percentage: attempt.percentage,
      hasAnswers: !!attempt.answers,
      answersType: typeof attempt.answers,
      answersIsArray: Array.isArray(attempt.answers),
      answersLength: Array.isArray(attempt.answers) ? attempt.answers.length : 'N/A'
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
      .select('id, question_text, options, correct_answer, points, negative_marks, order_number, explanation')
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
    console.log('📋 Attempting to format questions with answers:');
    console.log('   Answers from attempt:', attempt.answers);
    console.log('   Answers type:', typeof attempt.answers, Array.isArray(attempt.answers));
    console.log('   Questions count:', questions?.length);
    
    const formattedQuestions = (questions || []).map((q, index) => {
      const rawUserAnswer = attempt.answers?.[index];
      const userAnswerDetail = attempt.answer_details?.[index];
      const options = q.options || [];
      
      // Parse options if string
      const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      
      // correct_answer is stored as a string index ('0', '1', etc.), not the option text
      const correctAnswerIndex = parseInt(q.correct_answer as string, 10);
      
      // Normalize userAnswer to number (it might be a string from database)
      const userAnswer = rawUserAnswer === -1 || rawUserAnswer === null 
        ? -1 
        : parseInt(String(rawUserAnswer), 10);
      
      const correctAnswerText = parsedOptions[correctAnswerIndex] || '';
      
      if (index < 3) {
        console.log(`📝 Q${index + 1}: userAnswer=${userAnswer}, correctAnswerIndex=${correctAnswerIndex}, match=${userAnswer === correctAnswerIndex}, correctText="${correctAnswerText}"`);
      }
      
      return {
        id: q.id,
        questionText: q.question_text,
        options: parsedOptions,
        correctAnswerIndex,
        correctAnswerText,
        userAnswerIndex: userAnswer ?? -1,
        userAnswer: userAnswer !== undefined && userAnswer !== -1 ? parsedOptions[userAnswer] : null,
        correct: userAnswer === correctAnswerIndex,
        explanation: q.explanation || null,
        points: q.points || 1,
        negative_marks: q.negative_marks || 0
      };
    });

    // Recalculate score based on marks and negative marks
    let calculatedScore = 0;
    let calculatedTotalMarks = 0;
    
    console.log('🧮 Scoring details:');
    console.log(`   Total formatted questions: ${formattedQuestions.length}`);
    console.log(`   Total questions from DB: ${questions?.length}`);
    
    (formattedQuestions as any[]).forEach((q: any, idx: number) => {
      const marks = q.points || 1;
      calculatedTotalMarks += marks;
      
      if (q.correct) {
        // Correct answer: add marks
        calculatedScore += marks;
        if (idx < 3) console.log(`   Q${idx + 1}: ✅ CORRECT +${marks} marks`);
      } else if (q.userAnswerIndex !== -1 && q.userAnswerIndex !== null) {
        // Incorrect answer: deduct negative marks
        const negativeMarks = q.negative_marks || 0;
        const deduction = Math.min(negativeMarks, marks); // Don't go below 0
        calculatedScore -= deduction;
        if (idx < 3) console.log(`   Q${idx + 1}: ❌ INCORRECT -${deduction} marks (selected: ${q.userAnswerIndex}, correct: ${q.correctAnswerIndex})`);
      } else {
        // Unattempted: no change to score
        if (idx < 3) console.log(`   Q${idx + 1}: ⏭️ UNATTEMPTED (userAnswerIndex: ${q.userAnswerIndex})`);
      }
    });
    
    // Ensure score doesn't go below 0
    calculatedScore = Math.max(0, calculatedScore);
    
    const calculatedPercentage = calculatedTotalMarks > 0 
      ? Math.round((calculatedScore / calculatedTotalMarks) * 100)
      : 0;
    const calculatedPassed = calculatedPercentage >= (test.passing_score || 80);

    console.log('✅ Test results compiled:', {
      databaseScore: attempt.score,
      calculatedScore: calculatedScore,
      totalMarks: calculatedTotalMarks,
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
      total_marks: calculatedTotalMarks,
      total_questions: formattedQuestions.length,
      percentage: calculatedPercentage,
      passed: calculatedPassed,
      passing_score: test.passing_score || 80,
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

'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

/**
 * Get all pending quiz attempts with descriptive questions for an instructor
 */
export async function getPendingGradingTasks(instructorId: string, courseId?: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    let query = supabaseAdmin
      .from('quiz_attempts')
      .select(`
        id,
        user_id,
        lesson_id,
        course_id,
        enrollment_id,
        answers,
        questions,
        score,
        total_questions,
        submitted_at,
        grading_status,
        instructor_feedback,
        instructor_score,
        lessons (
          id,
          title,
          type,
          course_id
        ),
        enrollments (
          id,
          user_id,
          student_name,
          course_title
        )
      `)
      .eq('grading_status', 'pending');

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    // Get enrollments for this instructor to verify permissions
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('instructor_id', instructorId);

    if (enrollmentsError) {
      return { success: false, error: 'Failed to verify instructor permissions', data: [] };
    }

    const courseIds = enrollments?.map(e => e.course_id) || [];

    const { data: attempts, error } = await query;

    if (error) {
      console.error('❌ Error fetching pending grading tasks:', error);
      return { success: false, error: error.message, data: [] };
    }

    // Filter by instructor's courses
    const filteredAttempts = (attempts || []).filter((attempt: any) => 
      courseIds.includes(attempt.course_id)
    );

    console.log('✅ Fetched pending grading tasks:', {
      total: filteredAttempts.length,
      instructorId,
      courseId,
    });

    return { success: true, data: filteredAttempts, error: null };
  } catch (error) {
    console.error('❌ Exception in getPendingGradingTasks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
}

/**
 * Get a single quiz attempt with full details for grading
 */
export async function getQuizAttemptForGrading(attemptId: string, instructorId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    // Fetch the quiz attempt
    const { data: attempt, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select(`
        *,
        lessons (
          id,
          title,
          type,
          course_id
        ),
        enrollments (
          id,
          user_id,
          student_name,
          course_title
        )
      `)
      .eq('id', attemptId)
      .single();

    if (error || !attempt) {
      return { success: false, error: 'Quiz attempt not found' };
    }

    // Verify instructor has permission to grade this
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('instructor_id')
      .eq('id', attempt.enrollment_id)
      .single();

    if (enrollmentError || enrollment?.instructor_id !== instructorId) {
      return { success: false, error: 'Permission denied' };
    }

    return { success: true, data: attempt };
  } catch (error) {
    console.error('❌ Exception in getQuizAttemptForGrading:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Submit grading feedback for a quiz attempt
 */
export async function submitGradingFeedback(
  attemptId: string,
  instructorId: string,
  feedback: string,
  score?: number
) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    // Verify instructor has permission and get student info
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('enrollment_id, user_id, lessons(title)')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      return { success: false, error: 'Quiz attempt not found' };
    }

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('instructor_id, student_name')
      .eq('id', attempt.enrollment_id)
      .single();

    if (enrollmentError || enrollment?.instructor_id !== instructorId) {
      return { success: false, error: 'Permission denied' };
    }

    // Update with grading information
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('quiz_attempts')
      .update({
        grading_status: 'reviewed',
        instructor_feedback: feedback,
        instructor_score: score || null,
        graded_by: instructorId,
        graded_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating grading:', updateError);
      return { success: false, error: 'Failed to save feedback' };
    }

    // Create notification for student
    const lessonTitle = (attempt.lessons as any)?.title || 'Assessment/Quiz';
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: attempt.user_id,
        type: 'feedback_posted',
        title: 'Feedback Posted',
        message: `Your instructor has posted feedback on your Assessment/Quiz: "${lessonTitle}"`,
        attempt_id: attemptId,
      } as any);

    if (notificationError) {
      console.error('⚠️ Warning: Failed to create notification:', notificationError);
      // Don't fail the grading, just log the warning
    }

    console.log('✅ Grading feedback submitted:', {
      attemptId,
      instructorId,
      feedbackLength: feedback.length,
      notificationCreated: !notificationError,
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('❌ Exception in submitGradingFeedback:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get grading statistics for an instructor
 */
export async function getGradingStats(instructorId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: {} };
    }

    // Get all quiz attempts for this instructor's courses
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('course_id')
      .eq('instructor_id', instructorId);

    const courseIds = enrollments?.map(e => e.course_id) || [];

    if (courseIds.length === 0) {
      return { success: true, data: { pending: 0, reviewed: 0, total: 0 } };
    }

    const { data: attempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select('id, grading_status')
      .in('course_id', courseIds);

    const pending = attempts?.filter(a => a.grading_status === 'pending').length || 0;
    const reviewed = attempts?.filter(a => a.grading_status === 'reviewed').length || 0;
    const total = attempts?.length || 0;

    return { success: true, data: { pending, reviewed, total } };
  } catch (error) {
    console.error('❌ Exception in getGradingStats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {}
    };
  }
}

/**
 * Get similar student answers for comparison
 * Finds all attempts for the same lesson to compare responses
 */
export async function getSimilarAnswers(
  attemptId: string,
  instructorId: string,
  questionIndex: number
) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    // Get the current attempt to find lesson_id
    const { data: currentAttempt, error: currentError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('lesson_id, course_id, enrollment_id, answers, questions')
      .eq('id', attemptId)
      .single();

    if (currentError || !currentAttempt) {
      return { success: false, error: 'Attempt not found', data: [] };
    }

    // Verify instructor has permission
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('instructor_id')
      .eq('id', currentAttempt.enrollment_id)
      .single();

    if (enrollmentError || enrollment?.instructor_id !== instructorId) {
      return { success: false, error: 'Permission denied', data: [] };
    }

    // Get all attempts for the same lesson with similar answer type
    const { data: allAttempts, error: allError } = await supabaseAdmin
      .from('quiz_attempts')
      .select(`
        id,
        user_id,
        answers,
        questions,
        enrollment_id,
        enrollments (
          student_name
        )
      `)
      .eq('lesson_id', currentAttempt.lesson_id)
      .eq('course_id', currentAttempt.course_id);

    if (allError) {
      return { success: false, error: 'Failed to fetch attempts', data: [] };
    }

    // Filter to only descriptive answers for the same question
    const currentQuestions = currentAttempt.questions as any[];
    if (!currentQuestions[questionIndex] || currentQuestions[questionIndex].type !== 'descriptive') {
      return { success: false, error: 'Invalid question index', data: [] };
    }

    // Get similar answers (different attempts, same question)
    const similarAnswers = (allAttempts || [])
      .filter((attempt: any) => attempt.id !== attemptId) // Exclude current attempt
      .map((attempt: any) => ({
        attemptId: attempt.id,
        studentName: attempt.enrollments?.student_name || 'Unknown',
        answer: attempt.answers[questionIndex],
        wordCount: typeof attempt.answers[questionIndex] === 'string' 
          ? attempt.answers[questionIndex].split(/\s+/).length 
          : 0,
      }))
      .filter((item: any) => typeof item.answer === 'string' && item.answer.trim().length > 0)
      .sort((a: any, b: any) => b.wordCount - a.wordCount); // Sort by length

    console.log('✅ Fetched similar answers:', {
      attemptId,
      questionIndex,
      totalFound: similarAnswers.length,
    });

    return { success: true, data: similarAnswers };
  } catch (error) {
    console.error('❌ Exception in getSimilarAnswers:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Get student notifications
 */
export async function getStudentNotifications(studentId: string, limit = 20) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: notifications || [] };
  } catch (error) {
    console.error('❌ Exception in getStudentNotifications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, studentId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    // Verify ownership
    const { data: notification, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || notification?.user_id !== studentId) {
      return { success: false, error: 'Not found or permission denied' };
    }

    const { error: updateError } = await supabaseAdmin
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Exception in markNotificationAsRead:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(studentId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', count: 0 };
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', studentId)
      .eq('read', false);

    if (error) {
      return { success: false, error: error.message, count: 0 };
    }

    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('❌ Exception in getUnreadNotificationCount:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      count: 0
    };
  }
}

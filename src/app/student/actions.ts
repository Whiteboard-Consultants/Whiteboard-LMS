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

export async function submitRating(formData: FormData) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    const courseId = formData.get('courseId') as string;
    const userId = formData.get('userId') as string;
    const userName = formData.get('userName') as string;
    const userAvatarUrl = formData.get('userAvatarUrl') as string | null;
    const rating = parseInt(formData.get('rating') as string);
    const instructorRating = parseInt(formData.get('instructorRating') as string);
    const instructorId = formData.get('instructorId') as string;
    const comment = formData.get('comment') as string;

    // Validate required fields
    if (!courseId || !userId || !rating || !instructorRating || !comment) {
      return { success: false, error: 'Missing required fields' };
    }

    // Validate rating values
    if (rating < 1 || rating > 5 || instructorRating < 1 || instructorRating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    // Insert the rating into the database
    const { data, error } = await supabaseAdmin
      .from('course_ratings')
      .insert([
        {
          course_id: courseId,
          user_id: userId,
          user_name: userName,
          user_avatar_url: userAvatarUrl,
          content_rating: rating,
          instructor_rating: instructorRating,
          instructor_id: instructorId,
          comment: comment,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('Error submitting rating:', error);
      return { success: false, error: 'Failed to submit rating' };
    }

    return { success: true, message: 'Thank you for your review!', data };
  } catch (error) {
    console.error('Error in submitRating:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateProgress(
  enrollmentId: string,
  courseId: string,
  lessonId: string,
  quizData?: {
    questions: any[];
    answers: (number | null)[];
  }
) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    if (!enrollmentId || !courseId || !lessonId) {
      return { success: false, error: 'Missing required fields' };
    }

    // Get current enrollment
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return { success: false, error: 'Lesson not found' };
    }

    // Initialize completed lessons array if not exists
    const completedLessons = enrollment.completed_lessons || [];
    
    // Add lesson to completed list if not already there
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // Calculate progress percentage
    const { data: allLessons, error: lessonsError } = await supabaseAdmin
      .from('lessons')
      .select('id')
      .eq('course_id', courseId);

    if (lessonsError) {
      return { success: false, error: 'Failed to calculate progress' };
    }

    const totalLessons = allLessons?.length || 1;
    const progress = Math.round((completedLessons.length / totalLessons) * 100);

    // Update enrollment with new progress
    const updateData: any = {
      completed_lessons: completedLessons,
      progress: progress
    };

    // If this is a quiz/assignment with answers, create a quiz attempt
    let quizAttemptId = null;
    if (quizData && (lesson.type === 'quiz' || lesson.type === 'assignment')) {
      // Calculate score
      console.log('📝 Creating quiz attempt for lesson:', {
        type: lesson.type,
        questionCount: quizData.questions.length,
        answerCount: quizData.answers.length,
        firstQuestion: quizData.questions[0]
      });

      const correctAnswers = quizData.answers.filter(
        (answer, index) => {
          const question = quizData.questions[index];
          // Handle both correctAnswer and correctAnswerIndex
          const correctIndex = question?.correctAnswer ?? question?.correctAnswerIndex;
          return answer === correctIndex;
        }
      ).length;
      const totalQuestions = quizData.questions.length;
      const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      console.log('✅ Quiz scoring:', {
        correctAnswers,
        totalQuestions,
        percentage
      });

      // Create quiz attempt record in quiz_attempts table
      const { data: attempt, error: attemptError } = await supabaseAdmin
        .from('quiz_attempts')
        .insert([
          {
            user_id: enrollment.user_id,
            lesson_id: lessonId,
            course_id: courseId,
            enrollment_id: enrollmentId,
            answers: quizData.answers,
            questions: quizData.questions,
            score: correctAnswers,
            total_questions: totalQuestions,
            percentage: percentage,
            submitted_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (!attemptError && attempt) {
        quizAttemptId = attempt.id;
        console.log('✅ Quiz attempt created:', quizAttemptId);
      } else {
        console.error('❌ Error creating quiz attempt:', attemptError);
      }
    }

    const { data: updatedEnrollment, error: updateError } = await supabaseAdmin
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select()
      .single();

    if (updateError || !updatedEnrollment) {
      return { success: false, error: 'Failed to update progress' };
    }

    // Convert snake_case to camelCase for response
    return {
      success: true,
      message: 'Progress updated',
      updatedEnrollment: {
        ...updatedEnrollment,
        userId: updatedEnrollment.user_id,
        courseId: updatedEnrollment.course_id,
        instructorId: updatedEnrollment.instructor_id,
        enrolledAt: updatedEnrollment.enrolled_at,
        completedLessons: updatedEnrollment.completed_lessons,
        certificateStatus: updatedEnrollment.certificate_status,
        averageScore: updatedEnrollment.average_score,
        couponCode: updatedEnrollment.coupon_code,
        purchaseDate: updatedEnrollment.purchase_date,
        paymentId: updatedEnrollment.payment_id,
        orderId: updatedEnrollment.order_id
      },
      quizAttemptId
    };
  } catch (error) {
    console.error('Error in updateProgress:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
export async function getTestAttempt(attemptId: string) {
  try {
    if (!supabaseAdmin) {
      return null;
    }

    const { data: attempt, error } = await supabaseAdmin
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (error || !attempt) {
      console.error('Error fetching test attempt:', error);
      return null;
    }

    return attempt;
  } catch (error) {
    console.error('Error in getTestAttempt:', error);
    return null;
  }
}

export async function getQuizAttempt(attemptId: string) {
  try {
    if (!supabaseAdmin) {
      return null;
    }

    const { data: attempt, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (error || !attempt) {
      console.error('❌ Error fetching quiz attempt:', error);
      return null;
    }

    console.log('✅ Quiz attempt fetched:', {
      id: attempt.id,
      questionsCount: attempt.questions?.length,
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      percentage: attempt.percentage
    });

    // Return with snake_case field names as expected by quiz-results page
    return {
      id: attempt.id,
      user_id: attempt.user_id,
      lesson_id: attempt.lesson_id,
      course_id: attempt.course_id,
      enrollment_id: attempt.enrollment_id,
      answers: attempt.answers || [],
      questions: attempt.questions || [],
      score: attempt.score || 0,
      total_questions: attempt.total_questions || 0,
      percentage: attempt.percentage || 0,
      submitted_at: attempt.submitted_at,
    };
  } catch (error) {
    console.error('❌ Error in getQuizAttempt:', error);
    return null;
  }
}
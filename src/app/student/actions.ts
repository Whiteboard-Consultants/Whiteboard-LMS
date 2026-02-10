'use server';

import { createClient } from '@supabase/supabase-js';
import { VIDEO_COMPLETION_THRESHOLD } from '@/lib/constants';

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
    answers: (number | string | null)[];
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

      // Calculate correct answers
      // For MCQ: check if answer index matches correct index
      // For Descriptive: any non-empty answer is considered as "attempted" (instructors will grade manually)
      const correctAnswers = quizData.answers.filter(
        (answer, index) => {
          const question = quizData.questions[index];
          
          // For descriptive questions, count if answer is provided (non-empty string)
          if (question?.type === 'descriptive') {
            return typeof answer === 'string' && answer.trim().length > 0;
          }
          
          // For MCQ questions, check if answer matches correct index
          const correctIndex = question?.correctAnswer ?? question?.correctAnswerIndex;
          return answer === correctIndex;
        }
      ).length;
      const totalQuestions = quizData.questions.length;
      const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      console.log('✅ Quiz scoring:', {
        correctAnswers,
        totalQuestions,
        percentage,
        userId: enrollment.user_id,
        lessonId,
        courseId,
        enrollmentId,
        questionsStructure: quizData.questions.map((q, i) => ({
          index: i,
          type: q.type || 'mcq',
          hasId: !!q.id,
          hasQuestionText: !!q.questionText,
          hasOptions: !!q.options,
          hasCorrectAnswerIndex: q.correctAnswerIndex !== undefined,
          keys: Object.keys(q)
        }))
      });

      try {
        // Create quiz attempt record in quiz_attempts table
        const quizAttemptPayload = {
          user_id: enrollment.user_id,
          lesson_id: lessonId,
          course_id: courseId,
          enrollment_id: enrollmentId,
          answers: quizData.answers,
          questions: quizData.questions,
          score: correctAnswers,
          total_questions: totalQuestions,
          submitted_at: new Date().toISOString(),
        };
        
        console.log('📮 Inserting quiz attempt with payload:', {
          ...quizAttemptPayload,
          questions: `[${quizAttemptPayload.questions.length} questions]`
        });

        const { data: attempt, error: attemptError } = await supabaseAdmin
          .from('quiz_attempts')
          .insert([quizAttemptPayload])
          .select()
          .single();

        if (attemptError) {
          console.error('❌ Error creating quiz attempt:', {
            code: attemptError.code,
            message: attemptError.message,
            details: attemptError.details,
            hint: attemptError.hint
          });
        } else if (attempt) {
          quizAttemptId = attempt.id;
          console.log('✅ Quiz attempt created successfully:', {
            id: quizAttemptId,
            score: attempt.score,
            total_questions: attempt.total_questions,
            questions_count: attempt.questions?.length,
            stored_correctly: attempt.score === correctAnswers && attempt.total_questions === totalQuestions
          });
        } else {
          console.error('❌ No data returned from quiz attempt insert');
        }
      } catch (insertError) {
        console.error('❌ Exception during quiz attempt insert:', insertError);
      }

      // Track skills gained from this course
      try {
        console.log('📚 Attempting to track skills for course:', courseId);
        
        // Get skills associated with this course
        const { data: courseSkills, error: skillsError } = await supabaseAdmin
          .from('course_skills')
          .select('skill_id, proficiency_level')
          .eq('course_id', courseId);

        if (skillsError) {
          console.log('⚠️ Could not fetch course skills:', skillsError.message);
        } else if (courseSkills && courseSkills.length > 0) {
          console.log('🎓 Found', courseSkills.length, 'skills for course');

          // For each skill, update or create user_skills record
          for (const courseSkill of courseSkills) {
            const skillLevel = Math.max(
              Math.round(percentage / 20), // Scale percentage to 0-5
              1 // At least 1 if they completed the quiz
            );

            const { error: upsertError } = await supabaseAdmin
              .from('user_skills')
              .upsert({
                user_id: enrollment.user_id,
                skill_id: courseSkill.skill_id,
                proficiency_level: courseSkill.proficiency_level,
                mastery_percentage: percentage, // Use quiz score as mastery %
                practice_count: 1,
                last_practiced_at: new Date().toISOString(),
                acquired_at: new Date().toISOString(),
              });

            if (upsertError) {
              console.log('⚠️ Error updating skill:', upsertError.message);
            } else {
              console.log('✅ Skill tracked for user:', {
                userId: enrollment.user_id,
                skillId: courseSkill.skill_id,
                masteryPercentage: percentage
              });
            }
          }
        }
      } catch (skillError) {
        console.error('⚠️ Exception during skill tracking:', skillError);
        // Don't fail the quiz submission if skill tracking fails
      }
    } else {
      console.log('⏭️ Skipping quiz attempt creation:', {
        hasQuizData: !!quizData,
        lessonType: lesson.type
      });
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

    // Calculate percentage from score and total_questions
    const percentage = attempt.total_questions > 0 
      ? Math.round((attempt.score / attempt.total_questions) * 100) 
      : 0;

    console.log('✅ Quiz attempt fetched:', {
      id: attempt.id,
      questionsCount: attempt.questions?.length,
      questionsType: typeof attempt.questions,
      questionsIsArray: Array.isArray(attempt.questions),
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      percentage,
      firstQuestion: attempt.questions?.[0]
    });

    // Ensure questions is always an array
    let questionsArray = attempt.questions || [];
    if (typeof questionsArray === 'string') {
      try {
        questionsArray = JSON.parse(questionsArray);
      } catch (e) {
        console.error('Failed to parse questions JSON:', questionsArray);
        questionsArray = [];
      }
    }

    // Return with snake_case field names as expected by quiz-results page
    return {
      id: attempt.id,
      user_id: attempt.user_id,
      lesson_id: attempt.lesson_id,
      course_id: attempt.course_id,
      enrollment_id: attempt.enrollment_id,
      answers: attempt.answers || [],
      questions: questionsArray,
      score: attempt.score || 0,
      total_questions: attempt.total_questions || 0,
      percentage: percentage,
      submitted_at: attempt.submitted_at,
      instructor_feedback: attempt.instructor_feedback || null,
      instructor_score: attempt.instructor_score || null,
      grading_status: attempt.grading_status || 'pending',
      graded_at: attempt.graded_at || null,
    };
  } catch (error) {
    console.error('❌ Error in getQuizAttempt:', error);
    return null;
  }
}

export async function updateVideoProgress(
  enrollmentId: string,
  lessonId: string,
  watchTimeSeconds: number,
  totalDurationSeconds: number,
  userId: string
) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    if (!enrollmentId || !lessonId || watchTimeSeconds < 0 || totalDurationSeconds <= 0) {
      return { success: false, error: 'Invalid parameters' };
    }

    const isCompleted = watchTimeSeconds >= totalDurationSeconds * VIDEO_COMPLETION_THRESHOLD;

    // Check if there's an existing record
    const { data: existingRecord } = await supabaseAdmin
      .from('video_progress')
      .select('completed_at')
      .eq('enrollment_id', enrollmentId)
      .eq('lesson_id', lessonId)
      .single();

    // Only set completed_at if newly completing (don't overwrite existing completion)
    const completedAt = isCompleted 
      ? (existingRecord?.completed_at || new Date().toISOString())
      : existingRecord?.completed_at || null;

    // Upsert video progress record
    const { data, error } = await supabaseAdmin
      .from('video_progress')
      .upsert(
        {
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          user_id: userId,
          watch_time_seconds: watchTimeSeconds,
          total_duration_seconds: totalDurationSeconds,
          last_watched_at: new Date().toISOString(),
          completed_at: completedAt,
        },
        { onConflict: 'enrollment_id,lesson_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating video progress:', error);
      return { success: false, error: error.message };
    }

    // If video was just completed (first time), mark the lesson as complete in enrollments
    const justCompleted = isCompleted && !existingRecord?.completed_at;
    if (justCompleted) {
      console.log('Video completed! Auto-marking lesson as complete...');
      const { data: enrollment } = await supabaseAdmin
        .from('enrollments')
        .select('completed_lessons')
        .eq('id', enrollmentId)
        .single();

      if (enrollment) {
        const completedLessons = enrollment.completed_lessons || [];
        if (!completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
          
          // Calculate progress
          const { data: allLessons } = await supabaseAdmin
            .from('lessons')
            .select('id')
            .eq('course_id', (await supabaseAdmin.from('enrollments').select('course_id').eq('id', enrollmentId).single()).data?.course_id);

          const totalLessons = allLessons?.length || 1;
          const progress = Math.round((completedLessons.length / totalLessons) * 100);

          await supabaseAdmin
            .from('enrollments')
            .update({
              completed_lessons: completedLessons,
              progress: progress,
            })
            .eq('id', enrollmentId);
        }
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateVideoProgress:', error);
    return { success: false, error: 'Failed to update video progress' };
  }
}

export async function getVideoProgress(enrollmentId: string, lessonId: string) {
  try {
    if (!supabaseAdmin) {
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('video_progress')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('lesson_id', lessonId)
      .single();

    if (error) {
      // Not found is not an error for this use case
      if (error.code !== 'PGRST116') {
        console.error('Error fetching video progress:', error);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getVideoProgress:', error);
    return null;
  }
}
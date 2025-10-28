
'use server';

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import type { Course, Enrollment, QuizAttempt, Question, User, Test, TestAttempt, Answer, Review } from '@/types';




export async function getTestAttempt(attemptId: string): Promise<TestAttempt | null> {
    if (!attemptId) {
        console.error("Attempt ID is required.");
        return null;
    }
    try {
        const { data, error } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('id', attemptId)
            .single();
        if (error || !data) {
            console.error('Test attempt not found.');
            return null;
        }
        return data as TestAttempt;
    } catch (error) {
        console.error("Error fetching test attempt:", error);
        return null;
    }
}

export async function getQuizAttempt(attemptId: string): Promise<QuizAttempt | null> {
    if (!attemptId) {
        return null;
    }
    try {
        const db = supabaseAdmin || supabase;
        const { data, error } = await db
            .from('quiz_attempts')
            .select('*')
            .eq('id', attemptId)
            .single();
        if (error || !data) {
            return null;
        }
        return data as QuizAttempt;
    } catch (error) {
        console.error("Error fetching quiz attempt:", error);
        return null;
    }
}
// ...existing code...

// Use enrollInFreeCourse from enrollment-actions.ts


// Use enrollInPaidCourses from enrollment-actions.ts

export async function submitRating(formData: FormData) {
    const courseId = formData.get('courseId') as string;
    const userId = formData.get('userId') as string;
    const userName = formData.get('userName') as string;
    const userAvatarUrl = formData.get('userAvatarUrl') as string | undefined;
    const rating = parseInt(formData.get('rating') as string, 10);
    const comment = formData.get('comment') as string;
    const instructorRating = parseInt(formData.get('instructorRating') as string, 10);
    const instructorId = formData.get('instructorId') as string;

    if (!courseId || !userId || !userName || !rating || !instructorRating || !instructorId) {
        return { success: false, error: "Missing required fields." };
    }

    try {
        // Check for existing review
        const { data: existingReview, error: reviewError } = await supabase
            .from('reviews')
            .select('id')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .single();
        if (existingReview) {
            return { success: false, error: "You have already reviewed this course." };
        }

        // Update course rating
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('rating_count, total_rating, rating')
            .eq('id', courseId)
            .single();
        if (courseError || !course) {
            throw new Error("Course not found");
        }
        const newRatingCount = (course.rating_count || 0) + 1;
        const newTotalRating = (course.total_rating || 0) + rating;
        const newAverageRating = newTotalRating / newRatingCount;
        await supabase
            .from('courses')
            .update({
                rating_count: newRatingCount,
                total_rating: newTotalRating,
                rating: parseFloat(newAverageRating.toFixed(2)),
            })
            .eq('id', courseId);

        // Update instructor rating
        const { data: instructor, error: instructorError } = await supabase
            .from('users')
            .select('rating_count, total_rating, average_rating')
            .eq('id', instructorId)
            .single();
        if (instructorError || !instructor) {
            throw new Error("Instructor not found");
        }
        const newInstructorRatingCount = (instructor.rating_count || 0) + 1;
        const newTotalInstructorRating = (instructor.total_rating || 0) + instructorRating;
        const newAverageInstructorRating = newTotalInstructorRating / newInstructorRatingCount;
        await supabase
            .from('users')
            .update({
                rating_count: newInstructorRatingCount,
                total_rating: newTotalInstructorRating,
                average_rating: parseFloat(newAverageInstructorRating.toFixed(2)),
            })
            .eq('id', instructorId);

        // Add the review
        await supabase
            .from('reviews')
            .insert({
                course_id: courseId,
                user_id: userId,
                user_name: userName,
                user_avatar_url: userAvatarUrl || '',
                rating: rating,
                content_rating: rating,
                instructor_rating: instructorRating,
                comment,
                created_at: new Date().toISOString(),
            });

        revalidatePath(`/courses/${courseId}`);
        revalidatePath('/student/dashboard');
        revalidatePath('/instructor/reports');

        return { success: true, message: "Your review has been submitted!" };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Could not submit your review.";
        console.error("Error submitting rating: ", error);
        return { success: false, error: message };
    }
}

export async function updateProgress(
    enrollmentId: string,
    courseId: string,
    lessonId: string,
    quizSubmission?: { questions: Question[]; answers: (number | null)[] }
): Promise<{ success: boolean; error?: string; updatedEnrollment?: Enrollment, quizAttemptId?: string }> {
    if (!enrollmentId || !courseId || !lessonId) {
        return { success: false, error: 'Missing required IDs for updating progress.' };
    }

    // --- Supabase version ---
    try {
        // Use admin client to bypass RLS for quiz operations
        const db = supabaseAdmin || supabase;
        // Fetch enrollment
        const { data: enrollment, error: enrollmentError } = await db
            .from('enrollments')
            .select('*')
            .eq('id', enrollmentId)
            .single();
        if (enrollmentError || !enrollment) {
            throw new Error('Enrollment record not found.');
        }

        // Fetch course
        const { data: course, error: courseError } = await db
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();
        if (courseError || !course) {
            throw new Error('Course not found');
        }

        // Fetch all lessons for the course
        const { data: lessons, error: lessonsError } = await db
            .from('lessons')
            .select('id')
            .eq('course_id', courseId);
        if (lessonsError) {
            throw new Error('Could not fetch lessons for course');
        }
        const totalLessons = lessons.length;

        // Update completed lessons
        const completedLessonIds = new Set(enrollment.completed_lessons || []);
        if (!completedLessonIds.has(lessonId)) {
            completedLessonIds.add(lessonId);
        } else if (!quizSubmission) {
            // Already completed, no quiz, just return
            return { success: true, updatedEnrollment: enrollment };
        }
        const updatedCompletedLessons = Array.from(completedLessonIds);
        const newProgress = totalLessons > 0 ? Math.round((updatedCompletedLessons.length / totalLessons) * 100) : 0;

        const enrollmentUpdate: any = {
            completed_lessons: updatedCompletedLessons,
        };
        if (newProgress >= 100) {
            if (course.final_assessment_id) {
                enrollmentUpdate.progress = 99;
            } else {
                enrollmentUpdate.progress = 100;
                enrollmentUpdate.completed = true;
                if (course.has_certificate) {
                    enrollmentUpdate.certificate_status = 'eligible';
                }
            }
        } else {
            enrollmentUpdate.progress = newProgress;
        }

        let finalQuizAttemptId: string | undefined = undefined;
        if (quizSubmission) {
            // Check for existing quiz attempt
            const { data: existingAttempts, error: attemptError } = await db
                .from('quiz_attempts')
                .select('id')
                .eq('user_id', enrollment.user_id)
                .eq('lesson_id', lessonId);
            let quizAttemptId: string;
            if (existingAttempts && existingAttempts.length > 0) {
                quizAttemptId = existingAttempts[0].id;
                await db
                    .from('quiz_attempts')
                    .update({
                        enrollment_id: enrollmentId,
                        course_id: courseId,
                        lesson_id: lessonId,
                        user_id: enrollment.user_id,
                        submitted_at: new Date().toISOString(),
                        score: quizSubmission.questions.reduce((acc, question, index) => quizSubmission.answers[index] === question.correctAnswerIndex ? acc + 1 : acc, 0),
                        total_questions: quizSubmission.questions.length,
                        answers: quizSubmission.answers,
                        questions: quizSubmission.questions
                    })
                    .eq('id', quizAttemptId);
            } else {
                const { data: newAttempt, error: newAttemptError } = await db
                    .from('quiz_attempts')
                    .insert({
                        enrollment_id: enrollmentId,
                        course_id: courseId,
                        lesson_id: lessonId,
                        user_id: enrollment.user_id,
                        submitted_at: new Date().toISOString(),
                        score: quizSubmission.questions.reduce((acc, question, index) => quizSubmission.answers[index] === question.correctAnswerIndex ? acc + 1 : acc, 0),
                        total_questions: quizSubmission.questions.length,
                        answers: quizSubmission.answers,
                        questions: quizSubmission.questions
                    })
                    .select()
                    .single();
                if (newAttemptError) {
                    console.error('Quiz attempt creation error:', newAttemptError);
                    throw new Error(`Failed to create quiz attempt: ${newAttemptError.message}`);
                }
                quizAttemptId = newAttempt.id;
            }
            finalQuizAttemptId = quizAttemptId;
        }

        // Update enrollment
        const { data: updatedEnrollment, error: updateError } = await db
            .from('enrollments')
            .update(enrollmentUpdate)
            .eq('id', enrollmentId)
            .select()
            .single();
        if (updateError) {
            throw new Error('Failed to update enrollment');
        }

        revalidatePath(`/courses/${courseId}`);
        revalidatePath('/student/dashboard');
        revalidatePath(`/instructor/reports/${courseId}`);
        if(finalQuizAttemptId) {
             revalidatePath(`/student/quiz-results/${finalQuizAttemptId}`);
        }

        return { success: true, updatedEnrollment, quizAttemptId: finalQuizAttemptId };
    } catch (error: unknown) {
        console.error('Error updating progress:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update lesson progress.';
        console.error('Detailed error:', errorMessage);
        return { success: false, error: errorMessage };
    }
}

export async function requestCertificate(enrollmentId: string) {
    if (!enrollmentId) {
        return { success: false, error: 'Enrollment ID is required.' };
    }
    try {
        // Fetch enrollment
        const { data: enrollment, error } = await supabase
            .from('enrollments')
            .select('certificate_status')
            .eq('id', enrollmentId)
            .single();
        if (error || !enrollment) {
            throw new Error('Enrollment not found.');
        }
        if (enrollment.certificate_status !== 'eligible') {
            throw new Error('You are not eligible to request a certificate at this time.');
        }
        const { error: updateError } = await supabase
            .from('enrollments')
            .update({ certificate_status: 'requested' })
            .eq('id', enrollmentId);
        if (updateError) {
            throw new Error('Failed to update certificate status.');
        }
        revalidatePath('/student/dashboard');
        revalidatePath('/admin/certificates');
        revalidatePath(`/courses/${enrollmentId}`);
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred while requesting your certificate."
        console.error("Error requesting certificate:", error);
        return { success: false, error: message };
    }
}


export async function startOrResumeTest(userId: string, testId: string): Promise<{success: boolean; error?: string; attempt?: Partial<TestAttempt>}> {
    if (!userId || !testId) {
        return { success: false, error: 'User and Test ID are required.' };
    }
    try {
        // Fetch test
        const { data: test, error: testError } = await supabase
            .from('tests')
            .select('id, duration')
            .eq('id', testId)
            .single();
        if (testError || !test) {
            throw new Error("Test not found.");
        }
        // Create new attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('test_attempts')
            .insert({
                user_id: userId,
                test_id: testId,
                status: 'in-progress',
                start_time: new Date().toISOString(),
                time_left: test.duration,
                answers: [],
            })
            .select()
            .single();
        if (attemptError || !attempt) {
            throw new Error("Failed to create test attempt.");
        }
        return { success: true, attempt };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        console.error("Error starting test:", error);
        return { success: false, error: message };
    }
}

export async function endTestAttempt(attemptId: string) {
    if (!attemptId) return { success: false, error: 'Attempt ID is required.' };
    try {
        const { error } = await supabase
            .from('test_attempts')
            .update({ status: 'abandoned', score: 0 })
            .eq('id', attemptId);
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        console.error("Error ending test attempt:", error);
        return { success: false, error: "Failed to end test attempt." };
    }
}

export async function submitTest(
    testId: string,
    userId: string,
    answerIndices: (number | null)[],
    answers: Answer[]
) {
    if (!testId || !userId || !answers) {
        return { success: false, error: 'Missing required data to submit test.' };
    }
    try {
        // Fetch test
        const { data: test, error: testError } = await supabase
            .from('tests')
            .select('id, instructor_id, course_id, duration, has_certificate')
            .eq('id', testId)
            .single();
        if (testError || !test) throw new Error("Test not found.");

        // Fetch questions
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('test_id', testId)
            .order('order');
        if (questionsError || !questions || questions.length !== answers.length) {
            throw new Error("Answer count does not match question count.");
        }

        // Fetch enrollment (if courseId exists)
        let enrollment: Enrollment | null = null;
        if (test.course_id) {
            const { data: enrollments, error: enrollmentError } = await supabase
                .from('enrollments')
                .select('*')
                .eq('user_id', userId)
                .eq('course_id', test.course_id)
                .maybeSingle();
            if (enrollments) enrollment = enrollments as Enrollment;
        }

        // Calculate score
        let score = 0;
        let totalMarks = 0;
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unattempted = 0;
        questions.forEach((question, index) => {
            totalMarks += question.marks;
            const userAnswerIndex = answerIndices[index];
            if (userAnswerIndex === null) {
                unattempted++;
            } else if (userAnswerIndex === question.correct_option) {
                score += question.marks;
                correctAnswers++;
            } else {
                score -= question.negative_marks || 0;
                incorrectAnswers++;
            }
        });

        // Insert test attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('test_attempts')
            .insert({
                user_id: userId,
                test_id: testId,
                instructor_id: test.instructor_id,
                course_id: test.course_id || null,
                submitted_at: new Date().toISOString(),
                score,
                total_marks: totalMarks,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                unattempted,
                answers,
                status: 'completed',
                start_time: new Date().toISOString(),
            })
            .select()
            .single();
        if (attemptError || !attempt) {
            throw new Error("Failed to create test attempt.");
        }

        // Update enrollment if exists
        if (enrollment) {
            const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
            const updateData: any = {
                progress: 100,
                completed: true,
                average_score: percentage,
            };
            if (test.has_certificate) {
                updateData.certificate_status = percentage >= 80 ? 'eligible' : 'not_eligible';
            }
            await supabase
                .from('enrollments')
                .update(updateData)
                .eq('id', enrollment.id);
        }

        revalidatePath('/student/dashboard');
        return { success: true, attemptId: attempt.id };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to submit test.";
        console.error("Error submitting test:", error);
        return { success: false, error: message };
    }
}

// Review and Rating Functions
export async function submitCourseReview(
    courseId: string,
    userId: string,
    contentRating: number,
    instructorRating: number,
    comment: string
): Promise<{ success: boolean; error?: string }> {
    if (!courseId || !userId || !contentRating || !instructorRating) {
        return { success: false, error: 'All fields are required.' };
    }

    if (contentRating < 1 || contentRating > 5 || instructorRating < 1 || instructorRating > 5) {
        return { success: false, error: 'Ratings must be between 1 and 5.' };
    }

    try {
        if (!supabaseAdmin) {
            return { success: false, error: 'Service configuration error.' };
        }

        // Check if user is enrolled in the course
        const { data: enrollment, error: enrollmentError } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('status', 'approved')
            .single();

        if (enrollmentError || !enrollment) {
            return { success: false, error: 'You must be enrolled in this course to leave a review.' };
        }

        // Check if user has already reviewed this course
        const { data: existingReview } = await supabaseAdmin
            .from('reviews')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (existingReview) {
            return { success: false, error: 'You have already reviewed this course.' };
        }

        // Get user name for the review
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('name, avatar_url')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return { success: false, error: 'User information not found.' };
        }

        // Calculate overall rating (average of content and instructor rating)
        const rating = Math.round((contentRating + instructorRating) / 2);

        // Insert the review
        const { error: insertError } = await supabaseAdmin
            .from('reviews')
            .insert({
                course_id: courseId,
                user_id: userId,
                user_name: user.name,
                user_avatar_url: user.avatar_url,
                rating: rating,
                content_rating: contentRating,
                instructor_rating: instructorRating,
                comment: comment.trim(),
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('Error inserting review:', insertError);
            return { success: false, error: 'Failed to submit review.' };
        }

        // Update course rating
        await updateCourseRating(courseId);

        revalidatePath(`/courses/${courseId}`);
        revalidatePath('/student/dashboard');
        
        return { success: true };
    } catch (error) {
        console.error('Error submitting course review:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function getCourseReviews(courseId: string): Promise<Review[]> {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }

        return reviews?.map((review: any) => ({
            id: review.id,
            courseId: review.course_id,
            userId: review.user_id,
            userName: review.user_name,
            userAvatarUrl: review.user_avatar_url,
            rating: review.rating,
            contentRating: review.content_rating,
            instructorRating: review.instructor_rating,
            comment: review.comment,
            createdAt: review.created_at
        })) || [];
    } catch (error) {
        console.error('Error fetching course reviews:', error);
        return [];
    }
}

export async function getUserCourseReview(courseId: string, userId: string): Promise<Review | null> {
    try {
        const { data: review, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .single();

        if (error || !review) {
            return null;
        }

        return {
            id: review.id,
            courseId: review.course_id,
            userId: review.user_id,
            userName: review.user_name,
            userAvatarUrl: review.user_avatar_url,
            rating: review.rating,
            contentRating: review.content_rating,
            instructorRating: review.instructor_rating,
            comment: review.comment,
            createdAt: review.created_at
        };
    } catch (error) {
        console.error('Error fetching user course review:', error);
        return null;
    }
}

async function updateCourseRating(courseId: string) {
    try {
        if (!supabaseAdmin) return;

        // Get all reviews for the course
        const { data: reviews, error: reviewsError } = await supabaseAdmin
            .from('reviews')
            .select('rating, content_rating, instructor_rating')
            .eq('course_id', courseId);

        if (reviewsError || !reviews || reviews.length === 0) {
            return;
        }

        // Calculate average ratings
        const totalReviews = reviews.length;
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

        // Update the course with new ratings
        await supabaseAdmin
            .from('courses')
            .update({
                rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
                rating_count: totalReviews,
                total_rating: totalRating
            })
            .eq('id', courseId);
    } catch (error) {
        console.error('Error updating course rating:', error);
    }
}

    
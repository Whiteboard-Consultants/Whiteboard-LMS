/**
 * Lesson Segments & Microlearning Service Layer
 * Core business logic for segment management and progress tracking
 */

import { createClient } from '@supabase/supabase-js';
import type {
  LessonSegment,
  UserSegmentProgress,
  SegmentWithProgress,
  LessonWithSegments,
  SegmentStatus,
  UserSegmentStats,
  LessonProgressDetail,
  ContentType,
} from '@/types/lessons';

// Get Supabase client (server-safe)
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
};

// ============================================================================
// LESSON SEGMENT QUERIES
// ============================================================================

/**
 * Get all segments for a lesson
 */
export async function getLessonSegments(lessonId: string): Promise<LessonSegment[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('lesson_segments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('segment_number');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching lesson segments:', error);
    return [];
  }
}

/**
 * Get specific segment by ID
 */
export async function getSegmentById(segmentId: string): Promise<LessonSegment | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('lesson_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching segment:', error);
    return null;
  }
}

/**
 * Get lesson with all segments
 */
export async function getLessonWithSegments(lessonId: string): Promise<LessonWithSegments | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('id, title, description')
      .eq('id', lessonId)
      .single();

    if (lessonError) throw lessonError;

    const segments = await getLessonSegments(lessonId);

    // Calculate totals
    const totalDurationSeconds = segments.reduce((sum, s) => sum + s.duration_seconds, 0);

    return {
      id: lessonData.id,
      title: lessonData.title,
      description: lessonData.description,
      segments,
      total_duration_minutes: Math.ceil(totalDurationSeconds / 60),
      total_segments: segments.length,
    };
  } catch (error) {
    console.error('Error fetching lesson with segments:', error);
    return null;
  }
}

/**
 * Get segments by content type
 */
export async function getSegmentsByContentType(
  lessonId: string,
  contentType: ContentType
): Promise<LessonSegment[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('lesson_segments')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('content_type', contentType)
      .order('segment_number');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching segments by type:', error);
    return [];
  }
}

// ============================================================================
// USER SEGMENT PROGRESS
// ============================================================================

/**
 * Get user's progress on a segment
 */
export async function getUserSegmentProgress(
  userId: string,
  segmentId: string,
  enrollmentId: string
): Promise<UserSegmentProgress | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_segment_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('segment_id', segmentId)
      .eq('enrollment_id', enrollmentId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching user segment progress:', error);
    return null;
  }
}

/**
 * Get user's progress for all segments in a lesson
 */
export async function getUserLessonSegmentProgress(
  userId: string,
  lessonId: string,
  enrollmentId: string
): Promise<UserSegmentProgress[]> {
  try {
    const supabase = getSupabaseClient();

    // Get all segments for the lesson
    const segments = await getLessonSegments(lessonId);
    const segmentIds = segments.map((s) => s.id);

    if (segmentIds.length === 0) return [];

    const { data, error } = await supabase
      .from('user_segment_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('enrollment_id', enrollmentId)
      .in('segment_id', segmentIds)
      .order('created_at');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user lesson segment progress:', error);
    return [];
  }
}

/**
 * Get lesson progress detail for user
 */
export async function getLessonProgressDetail(
  userId: string,
  lessonId: string,
  enrollmentId: string
): Promise<LessonProgressDetail | null> {
  try {
    const lesson = await getLessonWithSegments(lessonId);
    if (!lesson) return null;

    const userProgress = await getUserLessonSegmentProgress(userId, lessonId, enrollmentId);
    const progressMap = new Map(userProgress.map((p) => [p.segment_id, p]));

    // Calculate stats
    const completedSegments = userProgress.filter((p) => p.status === 'completed').length;
    const inProgressSegments = userProgress.filter((p) => p.status === 'in_progress').length;
    const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.time_spent_seconds, 0);

    const completionPercentage =
      lesson.total_segments > 0
        ? Math.round((completedSegments / lesson.total_segments) * 100)
        : 0;

    const segmentDetails = lesson.segments.map((segment) => {
      const progress = progressMap.get(segment.id);
      return {
        segment_id: segment.id,
        segment_number: segment.segment_number,
        title: segment.title,
        status: progress?.status || 'not_started',
        progress_percentage: progress?.progress_percentage || 0,
      };
    });

    const lastAccessedSegment = segmentDetails
      .reverse()
      .find((s) => s.status !== 'not_started');
    const nextSegment = segmentDetails.find((s) => s.status === 'not_started');

    return {
      lesson_id: lessonId,
      lesson_title: lesson.title,
      enrollment_id: enrollmentId,
      total_segments: lesson.total_segments,
      completed_segments: completedSegments,
      in_progress_segments: inProgressSegments,
      locked_segments: 0, // TODO: Implement prerequisites
      completion_percentage: completionPercentage,
      total_duration_minutes: lesson.total_duration_minutes,
      time_spent_minutes: Math.ceil(totalTimeSpent / 60),
      estimated_remaining_minutes: Math.ceil(
        (lesson.total_duration_minutes * 60 - totalTimeSpent) / 60
      ),
      segments: segmentDetails,
      last_accessed_segment: lastAccessedSegment
        ? {
            id: lesson.segments[lastAccessedSegment.segment_number - 1].id,
            number: lastAccessedSegment.segment_number,
            title: lastAccessedSegment.title,
          }
        : undefined,
      next_segment: nextSegment
        ? {
            id: lesson.segments[nextSegment.segment_number - 1].id,
            number: nextSegment.segment_number,
            title: nextSegment.title,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error fetching lesson progress detail:', error);
    return null;
  }
}

// ============================================================================
// UPDATE SEGMENT PROGRESS
// ============================================================================

/**
 * Start a segment (mark as in_progress)
 */
export async function startSegment(
  userId: string,
  segmentId: string,
  enrollmentId: string
): Promise<UserSegmentProgress | null> {
  try {
    const supabase = getSupabaseClient();

    // Check if progress record exists
    const existing = await getUserSegmentProgress(userId, segmentId, enrollmentId);

    if (existing && existing.status !== 'not_started') {
      return existing;
    }

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('user_segment_progress')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('segment_id', segmentId)
        .eq('enrollment_id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('user_segment_progress')
        .insert({
          user_id: userId,
          segment_id: segmentId,
          enrollment_id: enrollmentId,
          status: 'in_progress',
          progress_percentage: 0,
          time_spent_seconds: 0,
          attempts: 1,
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error starting segment:', error);
    return null;
  }
}

/**
 * Complete a segment
 */
export async function completeSegment(
  userId: string,
  segmentId: string,
  enrollmentId: string,
  timeSpentSeconds: number,
  quizScore?: number
): Promise<UserSegmentProgress | null> {
  try {
    const supabase = getSupabaseClient();

    const existingProgress = await getUserSegmentProgress(userId, segmentId, enrollmentId);

    if (existingProgress) {
      const { data, error } = await supabase
        .from('user_segment_progress')
        .update({
          status: 'completed',
          progress_percentage: 100,
          time_spent_seconds: Math.max(existingProgress.time_spent_seconds, timeSpentSeconds),
          quiz_score: quizScore,
          quiz_passed: quizScore !== undefined ? quizScore >= 60 : undefined,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('segment_id', segmentId)
        .eq('enrollment_id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('user_segment_progress')
        .insert({
          user_id: userId,
          segment_id: segmentId,
          enrollment_id: enrollmentId,
          status: 'completed',
          progress_percentage: 100,
          time_spent_seconds: timeSpentSeconds,
          attempts: 1,
          quiz_score: quizScore,
          quiz_passed: quizScore !== undefined ? quizScore >= 60 : undefined,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error completing segment:', error);
    return null;
  }
}

/**
 * Update segment progress (generic)
 */
export async function updateSegmentProgress(
  userId: string,
  segmentId: string,
  enrollmentId: string,
  updates: Partial<UserSegmentProgress>
): Promise<UserSegmentProgress | null> {
  try {
    const supabase = getSupabaseClient();

    const existing = await getUserSegmentProgress(userId, segmentId, enrollmentId);

    if (!existing) {
      return await startSegment(userId, segmentId, enrollmentId);
    }

    const { data, error } = await supabase
      .from('user_segment_progress')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('segment_id', segmentId)
      .eq('enrollment_id', enrollmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating segment progress:', error);
    return null;
  }
}

/**
 * Increment attempts for a segment
 */
export async function incrementSegmentAttempts(
  userId: string,
  segmentId: string,
  enrollmentId: string
): Promise<boolean> {
  try {
    const existing = await getUserSegmentProgress(userId, segmentId, enrollmentId);
    if (!existing) return false;

    const updated = await updateSegmentProgress(userId, segmentId, enrollmentId, {
      attempts: (existing.attempts || 0) + 1,
    });

    return !!updated;
  } catch (error) {
    console.error('Error incrementing attempts:', error);
    return false;
  }
}

// ============================================================================
// USER SEGMENT STATISTICS
// ============================================================================

/**
 * Get user's segment statistics
 */
export async function getUserSegmentStats(userId: string): Promise<UserSegmentStats> {
  try {
    const supabase = getSupabaseClient();

    const { data: progressData, error } = await supabase
      .from('user_segment_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const completed = (progressData || []).filter((p: any) => p.status === 'completed');
    const inProgress = (progressData || []).filter((p: any) => p.status === 'in_progress');
    const totalTimeSpent = (progressData || []).reduce(
      (sum: number, p: any) => sum + (p.time_spent_seconds || 0),
      0
    );
    const quizData = (progressData || []).filter((p: any) => p.quiz_score !== null);

    return {
      total_segments_completed: completed.length,
      total_time_spent_seconds: totalTimeSpent,
      average_time_per_segment_seconds:
        completed.length > 0 ? Math.round(totalTimeSpent / completed.length) : 0,
      segments_in_progress: inProgress.length,
      segments_locked: 0, // TODO: Implement
      completion_rate_percentage:
        progressData && progressData.length > 0
          ? Math.round((completed.length / progressData.length) * 100)
          : 0,
      average_quiz_score:
        quizData.length > 0
          ? Math.round(quizData.reduce((sum: number, p: any) => sum + p.quiz_score, 0) / quizData.length)
          : undefined,
      quiz_pass_rate:
        quizData.length > 0
          ? Math.round(
              (quizData.filter((p: any) => p.quiz_passed).length / quizData.length) * 100
            )
          : undefined,
    };
  } catch (error) {
    console.error('Error fetching segment stats:', error);
    return {
      total_segments_completed: 0,
      total_time_spent_seconds: 0,
      average_time_per_segment_seconds: 0,
      segments_in_progress: 0,
      segments_locked: 0,
      completion_rate_percentage: 0,
    };
  }
}

// ============================================================================
// SEGMENT HELPERS
// ============================================================================

/**
 * Calculate lesson completion percentage
 */
export async function calculateLessonCompletion(
  userId: string,
  lessonId: string,
  enrollmentId: string
): Promise<number> {
  try {
    const progressDetail = await getLessonProgressDetail(userId, lessonId, enrollmentId);
    return progressDetail?.completion_percentage || 0;
  } catch (error) {
    console.error('Error calculating lesson completion:', error);
    return 0;
  }
}

/**
 * Get next incomplete segment in lesson
 */
export async function getNextSegmentToComplete(
  userId: string,
  lessonId: string,
  enrollmentId: string
): Promise<LessonSegment | null> {
  try {
    const lesson = await getLessonWithSegments(lessonId);
    if (!lesson) return null;

    const userProgress = await getUserLessonSegmentProgress(userId, lessonId, enrollmentId);
    const completedIds = new Set(
      userProgress.filter((p) => p.status === 'completed').map((p) => p.segment_id)
    );

    const nextSegment = lesson.segments.find((s) => !completedIds.has(s.id));
    return nextSegment || null;
  } catch (error) {
    console.error('Error finding next segment:', error);
    return null;
  }
}

/**
 * Check if all segments in lesson are completed
 */
export async function isLessonCompleted(
  userId: string,
  lessonId: string,
  enrollmentId: string
): Promise<boolean> {
  try {
    const lesson = await getLessonWithSegments(lessonId);
    if (!lesson || lesson.total_segments === 0) return false;

    const progressDetail = await getLessonProgressDetail(userId, lessonId, enrollmentId);
    return (progressDetail?.completion_percentage || 0) === 100;
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    return false;
  }
}

/**
 * Estimate remaining time for lesson
 */
export async function estimateRemainingTime(
  userId: string,
  lessonId: string,
  enrollmentId: string
): Promise<number> {
  try {
    const progressDetail = await getLessonProgressDetail(userId, lessonId, enrollmentId);
    return progressDetail?.estimated_remaining_minutes || 0;
  } catch (error) {
    console.error('Error estimating remaining time:', error);
    return 0;
  }
}

'use server';

/**
 * Lessons & Microlearning Server Actions
 * Server-side operations for segment and progress management
 */

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import type { LessonSegment, UserSegmentProgress, CreateSegmentRequest } from '@/types/lessons';

// Get user ID from Authorization header
const getUserIdFromHeaders = async () => {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.slice(7);
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// Get admin client (service_role - bypasses RLS)
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Create a lesson segment
 */
export async function createLessonSegment(
  request: CreateSegmentRequest
): Promise<{ success: boolean; data?: LessonSegment; error?: string }> {
  try {
    const userId = await getUserIdFromHeaders();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { data, error } = await admin
      .from('lesson_segments')
      .insert({
        lesson_id: request.lesson_id,
        segment_number: request.segment_number,
        title: request.title,
        description: request.description,
        content_type: request.content_type,
        content_url: request.content_url,
        duration_seconds: request.duration_seconds,
        learning_objectives: request.learning_objectives,
        key_concepts: request.key_concepts,
        estimated_effort: request.estimated_effort,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error creating lesson segment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a lesson segment
 */
export async function updateLessonSegment(
  segmentId: string,
  updates: Partial<LessonSegment>
): Promise<{ success: boolean; data?: LessonSegment; error?: string }> {
  try {
    const userId = await getUserIdFromHeaders();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { data, error } = await admin
      .from('lesson_segments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', segmentId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error updating lesson segment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a lesson segment
 */
export async function deleteLessonSegment(segmentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await getUserIdFromHeaders();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { error } = await admin.from('lesson_segments').delete().eq('id', segmentId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting lesson segment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Start a segment for user
 */
export async function startUserSegment(
  userId: string,
  segmentId: string,
  enrollmentId: string
): Promise<{ success: boolean; data?: UserSegmentProgress; error?: string }> {
  try {
    const authUserId = await getUserIdFromHeaders();
    if (!authUserId || authUserId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    // Check if progress exists
    const { data: existing } = await admin
      .from('user_segment_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('segment_id', segmentId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();

    let result;

    if (existing) {
      // Update existing if not already in progress
      const { data, error } = await admin
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
      result = data;
    } else {
      // Create new progress record
      const { data, error } = await admin
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
      result = data;
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error starting segment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Complete a segment for user
 */
export async function completeUserSegment(
  userId: string,
  segmentId: string,
  enrollmentId: string,
  timeSpentSeconds: number,
  quizScore?: number
): Promise<{ success: boolean; data?: UserSegmentProgress; error?: string }> {
  try {
    const authUserId = await getUserIdFromHeaders();
    if (!authUserId || authUserId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    // Check if progress exists
    const { data: existing } = await admin
      .from('user_segment_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('segment_id', segmentId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();

    let result;

    if (existing) {
      const { data, error } = await admin
        .from('user_segment_progress')
        .update({
          status: 'completed',
          progress_percentage: 100,
          time_spent_seconds: Math.max(existing.time_spent_seconds || 0, timeSpentSeconds),
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
      result = data;
    } else {
      const { data, error } = await admin
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
      result = data;
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error completing segment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update segment progress
 */
export async function updateSegmentProgress(
  userId: string,
  segmentId: string,
  enrollmentId: string,
  updates: Partial<UserSegmentProgress>
): Promise<{ success: boolean; data?: UserSegmentProgress; error?: string }> {
  try {
    const authUserId = await getUserIdFromHeaders();
    if (!authUserId || authUserId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { data, error } = await admin
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

    return { success: true, data };
  } catch (error) {
    console.error('Error updating segment progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reset segment progress (for retakes)
 */
export async function resetSegmentProgress(
  userId: string,
  segmentId: string,
  enrollmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authUserId = await getUserIdFromHeaders();
    if (!authUserId || authUserId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { error } = await admin
      .from('user_segment_progress')
      .delete()
      .eq('user_id', userId)
      .eq('segment_id', segmentId)
      .eq('enrollment_id', enrollmentId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error resetting segment progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Bulk update segments for reordering
 */
export async function reorderSegments(
  lessonId: string,
  segmentUpdates: Array<{ segment_id: string; segment_number: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserIdFromHeaders();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    // Update each segment's number
    for (const update of segmentUpdates) {
      const { error } = await admin
        .from('lesson_segments')
        .update({
          segment_number: update.segment_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.segment_id)
        .eq('lesson_id', lessonId);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error reordering segments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Duplicate a segment
 */
export async function duplicateSegment(
  segmentId: string,
  newSegmentNumber: number
): Promise<{ success: boolean; data?: LessonSegment; error?: string }> {
  try {
    const userId = await getUserIdFromHeaders();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    // Fetch original segment
    const { data: original, error: fetchError } = await admin
      .from('lesson_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (fetchError) throw fetchError;

    // Create duplicate
    const { data: duplicate, error: createError } = await admin
      .from('lesson_segments')
      .insert({
        lesson_id: original.lesson_id,
        segment_number: newSegmentNumber,
        title: `${original.title} (Copy)`,
        description: original.description,
        content_type: original.content_type,
        content_url: original.content_url,
        duration_seconds: original.duration_seconds,
        learning_objectives: original.learning_objectives,
        key_concepts: original.key_concepts,
        estimated_effort: original.estimated_effort,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;

    return { success: true, data: duplicate };
  } catch (error) {
    console.error('Error duplicating segment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

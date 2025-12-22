/**
 * Dynamic route for lesson progress endpoints
 * GET /api/lessons/[lessonId]/progress
 * GET /api/lessons/[lessonId]/segments (with progress)
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * GET /api/lessons/[lessonId]/segments
 * Get all segments for a lesson with optional user progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { lessonId } = params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const enrollmentId = searchParams.get('enrollmentId');

    const client = getClient();

    // Get lesson and segments
    const { data: lesson, error: lessonError } = await client
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (lessonError) throw lessonError;
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Get segments
    const { data: segments, error: segmentsError } = await client
      .from('lesson_segments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('segment_number', { ascending: true });

    if (segmentsError) throw segmentsError;

    if (userId && enrollmentId) {
      // Get progress for each segment
      const segmentsWithProgress = await Promise.all(
        (segments || []).map(async (segment) => {
          const { data: progress } = await client
            .from('user_segment_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('segment_id', segment.id)
            .eq('enrollment_id', enrollmentId)
            .maybeSingle();

          return {
            ...segment,
            user_progress: progress,
          };
        })
      );

      return NextResponse.json({
        lesson: {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          difficulty: lesson.difficulty,
          duration_seconds: lesson.duration_seconds,
        },
        segments: segmentsWithProgress,
      });
    }

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        duration_seconds: lesson.duration_seconds,
      },
      segments,
    });
  } catch (error) {
    console.error('Error fetching lesson segments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lessons/[lessonId]/progress
 * Get complete lesson progress for user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { lessonId } = params;
    const body = await request.json();
    const { userId, enrollmentId } = body;

    if (!userId || !enrollmentId) {
      return NextResponse.json({ error: 'Missing userId or enrollmentId' }, { status: 400 });
    }

    const client = getClient();

    // Get all segment progress
    const { data: progressRecords, error: progressError } = await client
      .from('user_segment_progress')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Get lesson segments
    const { data: segments } = await client
      .from('lesson_segments')
      .select('id, duration_seconds')
      .eq('lesson_id', lessonId);

    const totalSegments = segments?.length || 0;
    const completedSegments =
      progressRecords?.filter((p) => p.status === 'completed').length || 0;
    const inProgressSegments =
      progressRecords?.filter((p) => p.status === 'in_progress').length || 0;

    const progressPercentage =
      totalSegments > 0 ? Math.round((completedSegments / totalSegments) * 100) : 0;

    const totalTimeSpent = progressRecords?.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0) || 0;
    const totalLessonDuration =
      (segments?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0) * 60;

    return NextResponse.json({
      progress: {
        lessonId,
        userId,
        enrollmentId,
        completedSegments,
        inProgressSegments,
        totalSegments,
        progressPercentage,
        totalTimeSpent,
        totalLessonDuration,
        isComplete: completedSegments === totalSegments && totalSegments > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

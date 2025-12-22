/**
 * Dynamic route for lesson segments endpoints
 * GET /api/lessons/[lessonId]/segments/[segmentId]
 * GET /api/lessons/[lessonId]/segments/[segmentId]/progress
 * POST /api/lessons/[lessonId]/segments/[segmentId]/start
 * POST /api/lessons/[lessonId]/segments/[segmentId]/complete
 */

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

const getClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * GET /api/lessons/[lessonId]/segments/[segmentId]
 * Get a specific segment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string; segmentId: string } }
) {
  try {
    const { segmentId } = params;
    const client = getClient();

    const { data: segment, error } = await client
      .from('lesson_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (error) throw error;
    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }

    return NextResponse.json({ segment });
  } catch (error) {
    console.error('Error fetching segment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lessons/[lessonId]/segments/[segmentId]/start
 * Start a segment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string; segmentId: string } }
) {
  try {
    const userId = await getUserIdFromHeaders();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { segmentId } = params;
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Missing enrollmentId' }, { status: 400 });
    }

    const client = getClient();

    if (action === 'start') {
      // Check if progress exists
      const { data: existing } = await client
        .from('user_segment_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('segment_id', segmentId)
        .eq('enrollment_id', enrollmentId)
        .maybeSingle();

      let result;

      if (existing) {
        const { data, error } = await client
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
        const { data, error } = await client
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

      return NextResponse.json({ progress: result }, { status: 200 });
    } else if (action === 'complete') {
      const { timeSpentSeconds, quizScore } = body;

      // Check if progress exists
      const { data: existing } = await client
        .from('user_segment_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('segment_id', segmentId)
        .eq('enrollment_id', enrollmentId)
        .maybeSingle();

      let result;

      if (existing) {
        const { data, error } = await client
          .from('user_segment_progress')
          .update({
            status: 'completed',
            progress_percentage: 100,
            time_spent_seconds: Math.max(
              existing.time_spent_seconds || 0,
              timeSpentSeconds || 0
            ),
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
        const { data, error } = await client
          .from('user_segment_progress')
          .insert({
            user_id: userId,
            segment_id: segmentId,
            enrollment_id: enrollmentId,
            status: 'completed',
            progress_percentage: 100,
            time_spent_seconds: timeSpentSeconds || 0,
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

      return NextResponse.json({ progress: result }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error handling segment action:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

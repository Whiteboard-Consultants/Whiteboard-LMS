/**
 * Lessons & Microlearning API Routes
 * REST endpoints for segment and progress management
 * 
 * Routes:
 * GET /api/lessons - List all lessons
 * GET /api/lessons/[lessonId] - Get lesson with segments
 * GET /api/lessons/[lessonId]/progress - Get lesson progress
 */

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getUserSegmentStats } from '@/lib/lessons';

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

const getClient = (token?: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });
};

/**
 * GET /api/lessons
 * List all lessons (paginated)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const client = getClient();

    const { data: lessons, error: lessonsError, count } = await client
      .from('lessons')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (lessonsError) throw lessonsError;

    return NextResponse.json({
      lessons: lessons || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

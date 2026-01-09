'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Fetch user details by IDs
 * Uses service role to bypass RLS
 */
export async function fetchUsersByIds(userIds: string[]) {
  try {
    if (!userIds || userIds.length === 0) return { success: true, error: null, data: [] };

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('id', userIds);

    console.log('[SERVER ACTION] Fetched', data?.length, 'users');

    if (error) {
      console.error('[SERVER ACTION] Error fetching users:', JSON.stringify(error));
      return { success: false, error, data: [] };
    }

    return { success: true, error: null, data: data || [] };
  } catch (err) {
    console.error('[SERVER ACTION] Exception fetching users:', err instanceof Error ? err.message : JSON.stringify(err));
    return { success: false, error: err, data: [] };
  }
}

/**
 * Fetch enrollments for a course
 * Uses service role to bypass RLS - only callable from server
 */
export async function fetchCourseEnrollments(courseId: string) {
  try {
    console.log('[SERVER ACTION] fetchCourseEnrollments called');
    
    // Try with explicit await and error handling
    const request = supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('status', 'approved');
    
    const { data, error } = await request;

    console.log('[SERVER ACTION] Query completed - error:', !!error, '- data count:', data?.length);

    if (error) {
      console.error('[SERVER ACTION] Supabase error:', JSON.stringify(error));
      return { success: false, error, data: [] };
    }

    console.log('[SERVER ACTION] Successfully fetched', data?.length || 0, 'enrollments');
    return { success: true, error: null, data: data || [] };
  } catch (err) {
    console.error('[SERVER ACTION] Exception:', err instanceof Error ? err.message : JSON.stringify(err));
    return { success: false, error: err, data: [] };
  }
}

/**
 * Fetch course details
 * Uses service role to bypass RLS
 */
export async function fetchCourseDetails(courseId: string) {
  try {
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return { success: false, error, data: null };
    }

    return { success: true, error: null, data: course };
  } catch (err) {
    console.error('Exception fetching course:', err);
    return { success: false, error: err, data: null };
  }
}

/**
 * Fetch lessons for a course
 * Uses service role to bypass RLS
 */
export async function fetchCourseLessons(courseId: string) {
  try {
    const { data: lessons, error } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_number', { ascending: true });

    if (error) {
      console.error('Error fetching lessons:', error);
      return { success: false, error, data: [] };
    }

    return { success: true, error: null, data: lessons || [] };
  } catch (err) {
    console.error('Exception fetching lessons:', err);
    return { success: false, error: err, data: [] };
  }
}

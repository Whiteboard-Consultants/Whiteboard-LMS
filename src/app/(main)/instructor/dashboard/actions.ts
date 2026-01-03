'use server';

import { createClient } from '@supabase/supabase-js';
import { subDays } from 'date-fns';

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
 * Fetch new enrollments for instructor from past 7 days
 * Uses service role to bypass RLS
 */
export async function fetchNewEnrollmentsForInstructor(instructorId: string) {
  try {
    console.log('[SERVER ACTION] fetchNewEnrollmentsForInstructor called for:', instructorId);

    if (!instructorId) {
      console.warn('[SERVER ACTION] No instructor ID provided');
      return { success: true, data: 0, error: null };
    }

    const sevenDaysAgo = subDays(new Date(), 7).toISOString();

    // Fetch new approved enrollments from past 7 days
    const { data, error, count } = await supabaseAdmin
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('instructor_id', instructorId)
      .eq('status', 'approved')
      .gte('enrolled_at', sevenDaysAgo);

    if (error) {
      console.error('[SERVER ACTION] Error fetching new enrollments:', JSON.stringify(error));
      return { success: false, data: 0, error };
    }

    console.log('[SERVER ACTION] Found new enrollments:', count || 0);
    return { success: true, data: count || 0, error: null };
  } catch (err) {
    console.error('[SERVER ACTION] Exception in fetchNewEnrollmentsForInstructor:', err instanceof Error ? err.message : JSON.stringify(err));
    return { success: false, data: 0, error: err };
  }
}

/**
 * Fetch total revenue for instructor
 * Uses service role to bypass RLS
 */
export async function fetchTotalRevenueForInstructor(instructorId: string) {
  try {
    console.log('[SERVER ACTION] fetchTotalRevenueForInstructor called for:', instructorId);

    if (!instructorId) {
      console.warn('[SERVER ACTION] No instructor ID provided');
      return { success: true, data: 0, error: null };
    }

    // Fetch all approved enrollments for revenue calculation
    // Try to fetch all fields to see what's available
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('status', 'approved');

    if (error) {
      console.error('[SERVER ACTION] Error fetching enrollments for revenue:', JSON.stringify(error));
      return { success: false, data: 0, error };
    }

    // Log sample data to see available fields
    if (data && data.length > 0) {
      console.log('[SERVER ACTION] Sample enrollment data:', JSON.stringify(data[0], null, 2));
    }

    // Try different possible field names for price
    const totalRevenue = (data || []).reduce((sum, enrollment: any) => {
      const price = enrollment.original_price || enrollment.price || enrollment.course_price || 0;
      return sum + (typeof price === 'number' ? price : 0);
    }, 0);

    console.log('[SERVER ACTION] Calculated total revenue:', totalRevenue);
    return { success: true, data: totalRevenue, error: null };
  } catch (err) {
    console.error('[SERVER ACTION] Exception in fetchTotalRevenueForInstructor:', err instanceof Error ? err.message : JSON.stringify(err));
    return { success: false, data: 0, error: err };
  }
}

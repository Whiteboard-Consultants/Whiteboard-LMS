'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function fetchAllEnrollments() {
  try {
    console.log('[Server] Starting fetchAllEnrollments with service role');
    
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*');

    console.log('[Server] Enrollments fetch result:', {
      dataLength: data?.length || 0,
      hasError: !!error,
      error: error?.message,
    });

    if (error) {
      console.error('[Server] Error fetching enrollments:', error);
      throw error;
    }

    console.log('[Server] Returning', data?.length || 0, 'enrollments');
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[Server] Unexpected error in fetchAllEnrollments:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

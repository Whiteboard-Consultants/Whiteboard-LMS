'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function fetchQuizAttemptsForLessons(lessonIds: string[]) {
  try {
    if (!lessonIds || lessonIds.length === 0) {
      return { success: true, error: null, data: [] };
    }

    console.log('[SERVER ACTION] Fetching quiz attempts for', lessonIds.length, 'lessons');
    
    const { data: attempts, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select(`
        id,
        lesson_id,
        user_id,
        score,
        total_questions,
        answers,
        questions,
        submitted_at
      `)
      .in('lesson_id', lessonIds);

    if (error) {
      console.error('[SERVER ACTION] Error fetching quiz attempts:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('[SERVER ACTION] Successfully fetched', attempts?.length || 0, 'quiz attempts');
    return { success: true, error: null, data: attempts || [] };
  } catch (error) {
    console.error('[SERVER ACTION] Exception fetching quiz attempts:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
}

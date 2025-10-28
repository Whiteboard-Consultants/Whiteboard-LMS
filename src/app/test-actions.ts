'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function testSupabaseConnection() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Simple test query to verify connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Supabase connection working' };
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
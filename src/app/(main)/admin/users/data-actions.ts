'use server';

import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAllUsers() {
  try {
    // Fetch all users using service role (bypasses RLS)
    const { data: usersData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    return {
      success: true,
      data: usersData || [],
      error: null
    };
  } catch (error) {
    console.error('Unexpected error fetching users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

export async function getPendingUsers() {
  try {
    // Fetch pending users using service role
    const { data: usersData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching pending users:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    return {
      success: true,
      data: usersData || [],
      error: null
    };
  } catch (error) {
    console.error('Unexpected error fetching pending users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

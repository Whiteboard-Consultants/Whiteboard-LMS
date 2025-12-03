'use server';

import { createClient } from '@supabase/supabase-js';

export async function fetchInstructorsAsAdmin() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
    
    if (!SERVICE_ROLE_KEY) {
      console.error('Service role key not configured');
      return { error: 'Server misconfiguration', instructors: [] };
    }

    // Use admin client directly (service_role bypasses RLS)
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false }
    });

    const { data, error } = await serviceClient
      .from('users')
      .select('id, name')
      .eq('role', 'instructor')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching instructors', error);
      return { error: error.message, instructors: [] };
    }

    return { error: null, instructors: data || [] };
  } catch (err) {
    console.error('Unexpected error fetching instructors:', err);
    return { error: 'Internal error', instructors: [] };
  }
}

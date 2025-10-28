'use server';

import { createServerSupabaseClient, createServerSupabaseClientWithSession } from '@/lib/supabase-server';

export async function fetchInstructorsServerAction(accessToken?: string) {
  try {
    let serverSupabase;
    
    // If accessToken is provided, use it directly
    if (accessToken) {
      serverSupabase = await createServerSupabaseClientWithSession(accessToken);
    } else {
      // Fall back to cookie-based auth
      serverSupabase = await createServerSupabaseClient();
    }

    // Get the authenticated user
    const { data: userData, error: userErr } = await serverSupabase.auth.getUser();
    if (userErr) {
      console.error('Error getting user from session', userErr);
      return { error: 'Unauthorized', instructors: [] };
    }

    const currentUser = userData?.user;
    if (!currentUser) {
      return { error: 'Unauthorized', instructors: [] };
    }

    // Verify the requester is an admin by checking the users table
    const { data: me, error: meErr } = await serverSupabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (meErr || !me || me.role !== 'admin') {
      return { error: 'Forbidden', instructors: [] };
    }

    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
    if (!SERVICE_ROLE_KEY) {
      console.error('Service role key not configured');
      return { error: 'Server misconfiguration', instructors: [] };
    }

    const { createClient } = await import('@supabase/supabase-js');
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    
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

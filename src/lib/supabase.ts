import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug log - only log on server side
if (typeof window === 'undefined') {
  console.log('🔧 Supabase client config:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    anonKey: supabaseAnonKey ? 'SET' : 'MISSING',
    serviceKey: supabaseServiceKey ? 'SET' : 'MISSING (expected - server only)'
  });
}

// Client for regular operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : null,
    storageKey: 'sb-auth-token',
    flowType: 'implicit'  // Changed from 'pkce' - password recovery uses implicit flow
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
});

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
}) : null;

// For compatibility with existing code, export common Supabase functions
export const auth = supabase.auth;
export const db = supabase; // Will be used for database operations
export const storage = supabase.storage;

export default supabase;
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug log to ensure we're using the right keys
console.log('🔧 Supabase client config:', {
  url: supabaseUrl ? 'SET' : 'MISSING',
  anonKey: supabaseAnonKey ? 'SET' : 'MISSING',
  serviceKey: supabaseServiceKey ? 'SET' : 'MISSING'
});

// Client for regular operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

// For compatibility with existing code, export common Supabase functions
export const auth = supabase.auth;
export const db = supabase; // Will be used for database operations
export const storage = supabase.storage;

export default supabase;
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create a Supabase client for server-side operations with user context
export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  try {
    const cookieStore = await cookies();
    
    // Extract project ref from URL
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] || 'lqezaljvpiycbeakndby';
    
    // Get all cookies to debug
    const allCookies = cookieStore.getAll();
    console.log('Available cookies:', allCookies.map(c => c.name));
    
    // Try multiple cookie formats for Supabase auth
    const possibleAuthCookies = [
      `sb-${projectRef}-auth-token`,
      `sb-${projectRef}-auth-token.0`,
      `sb-${projectRef}-auth-token.1`, 
      'supabase.auth.token',
      'supabase-auth-token',
      'sb-auth-token',
      // Check for session-based cookies
      `sb-${projectRef}-session`,
      `sb-${projectRef}-auth-session`,
      // Check for any supabase-related cookies
      ...allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-')).map(c => c.name)
    ];
    
    let authCookie = null;
    for (const cookieName of possibleAuthCookies) {
      authCookie = cookieStore.get(cookieName);
      if (authCookie) {
        console.log(`Found auth cookie: ${cookieName}`);
        break;
      }
    }
    
    if (authCookie?.value) {
      console.log('Processing auth cookie...');
      
      // Try multiple parsing strategies
      let session = null;
      
      // Strategy 1: Direct JSON parse
      try {
        session = JSON.parse(authCookie.value);
        console.log('Parsed as JSON:', { hasAccessToken: !!session?.access_token });
      } catch {
        // Strategy 2: Base64 decode then JSON parse
        try {
          const decoded = atob(authCookie.value);
          session = JSON.parse(decoded);
          console.log('Parsed as base64 JSON:', { hasAccessToken: !!session?.access_token });
        } catch {
          console.log('Could not parse cookie value');
        }
      }
      
      if (session?.access_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token || ''
        });
        
        if (error) {
          console.error('Error setting session:', error);
        } else {
          console.log('✅ Successfully set session, user:', data.user?.email);
        }
      }
    } else {
      console.log('❌ No auth cookie found');
    }
  } catch (error) {
    console.warn('⚠️ Error processing cookies (might be outside request scope):', error instanceof Error ? error.message : String(error));
  }

  return supabase;
}

// Alternative: Create client with provided session data
export async function createServerSupabaseClientWithSession(accessToken: string, refreshToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  // Set the session directly
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || ''
  });

  if (error) {
    console.error('Error setting session in createServerSupabaseClientWithSession:', error);
    throw new Error(`Failed to set session: ${error.message}`);
  }

  console.log('✅ Session set successfully in createServerSupabaseClientWithSession');
  return supabase;
}
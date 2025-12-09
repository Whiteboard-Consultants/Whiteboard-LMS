import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔐 Auth callback received:', { 
    code: code ? `${code.substring(0, 10)}...` : '❌', 
    error,
    errorDescription,
    origin: requestUrl.origin
  });

  if (error) {
    console.error('❌ Auth error from Supabase:', { error, errorDescription });
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${error}`
    );
  }

  if (!code) {
    console.warn('⚠️ No code provided in recovery link');
    return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=no_code`);
  }

  try {
    console.log('🔐 Processing recovery link with code:', code.substring(0, 20) + '...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      }
    });

    // For recovery links, verify the code on the server first
    console.log('🔐 Verifying recovery token on server-side...');
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: code,  // From URL params
      type: 'recovery'   // Email auto-detected from token
    });

    if (error) {
      console.error('❌ Server-side recovery verification failed:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=invalid_recovery_link`
      );
    }

    if (data.session?.user) {
      console.log('✅ Recovery token verified on server! Session established for:', data.session.user.email);
      // Session is now set in cookies, redirect to reset form
      const response = NextResponse.redirect(
        `${requestUrl.origin}/reset-password`
      );
      return response;
    }

    console.error('❌ Recovery verification succeeded but no session created');
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=session_failed`
    );
  } catch (err) {
    console.error('❌ Callback error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=callback_failed`
    );
  }
}

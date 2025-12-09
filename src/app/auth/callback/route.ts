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
    origin: requestUrl.origin
  });

  if (error) {
    console.error('❌ Auth error:', { error, errorDescription });
    // Redirect to reset password page with error
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${error}`
    );
  }

  if (!code) {
    console.warn('⚠️ No code provided');
    return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=no_code`);
  }

  try {
    console.log('🔄 Exchanging recovery code for session...');
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Exchange the code for a session
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Code exchange failed:', exchangeError);
      throw exchangeError;
    }

    if (!session) {
      console.error('❌ No session created from code');
      throw new Error('Failed to create session');
    }

    console.log('✅ Session created for user:', session.user.email);

    // Create response that redirects to reset password page
    const response = NextResponse.redirect(`${requestUrl.origin}/reset-password?reset=true`);
    
    // Set the session in cookies so the client can access it
    const { data: { session: newSession } } = await supabase.auth.getSession();
    if (newSession) {
      response.cookies.set('sb-access-token', newSession.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 1 day
      });
      response.cookies.set('sb-refresh-token', newSession.refresh_token || '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
    }

    return response;
  } catch (err) {
    console.error('❌ Callback error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=exchange_failed`
    );
  }
}

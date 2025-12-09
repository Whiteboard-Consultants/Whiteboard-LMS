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
      `${requestUrl.origin}/reset-password?error=${error}&desc=${encodeURIComponent(errorDescription || '')}`
    );
  }

  if (!code) {
    console.warn('⚠️ No code provided in URL');
    return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=no_code`);
  }

  try {
    console.log('🔄 Exchanging recovery code for session...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials missing');
    }

    // Create client with default auth settings
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🔄 Calling exchangeCodeForSession with code:', code.substring(0, 20) + '...');

    // Exchange code for session - this is the key operation
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Code exchange failed:', {
        message: exchangeError.message,
        code: exchangeError.code,
      });
      
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=invalid_code&message=${encodeURIComponent(
          exchangeError.message || 'Failed to exchange recovery code'
        )}`
      );
    }

    if (!data.session) {
      console.error('❌ No session returned from exchange');
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=no_session`
      );
    }

    const session = data.session;
    console.log('✅ Code exchange successful!');
    console.log('User:', session.user.email);
    console.log('Access token available:', !!session.access_token);

    // Create response and redirect to reset password page
    const response = NextResponse.redirect(`${requestUrl.origin}/reset-password?step=reset`);

    // Set authentication cookies
    // The cookie names are standardized by Supabase
    const projectRef = 'lqezaljvpiycbeakndby'; // Extract from your SUPABASE_URL
    
    response.cookies.set(`sb-${projectRef}-auth-token`, session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    // Set refresh token if available
    if (session.refresh_token) {
      response.cookies.set(`sb-${projectRef}-auth-token-code-verifier`, session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    console.log('✅ Session cookies set, redirecting to reset page');
    return response;
  } catch (err) {
    console.error('❌ Callback error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=callback_error&message=${encodeURIComponent(errorMsg)}`
    );
  }
}

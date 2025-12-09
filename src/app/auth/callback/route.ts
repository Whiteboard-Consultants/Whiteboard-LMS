import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔐 Auth callback received:', { code: code ? '✅' : '❌', error });

  if (error) {
    console.error('❌ Auth error:', { error, errorDescription });
    // Redirect to reset password page with error
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${error}&error_description=${errorDescription}`
    );
  }

  if (code) {
    try {
      console.log('🔄 Exchanging code for session...');
      // Exchange the code for a session using the service role client
      // This will work because the code is valid for password recovery
      const { data, error: exchangeError } = await supabaseAdmin.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Exchange error:', exchangeError);
        throw exchangeError;
      }

      if (data.session) {
        console.log('✅ Session created, redirecting to reset password...');
        // Redirect to reset password page with session established
        return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
      }
    } catch (err) {
      console.error('❌ Callback processing error:', err);
      return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=invalid_link`);
    }
  }

  // No code or error, just redirect
  return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
}

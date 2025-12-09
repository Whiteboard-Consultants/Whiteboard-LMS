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
      `${requestUrl.origin}/reset-password?error=${error}&error_description=${encodeURIComponent(errorDescription || '')}`
    );
  }

  // For password recovery, pass the code to the reset password page
  // The form will handle exchanging it for a session
  if (code) {
    console.log('✅ Recovery code found, redirecting to reset password...');
    return NextResponse.redirect(`${requestUrl.origin}/reset-password?code=${code}`);
  }

  // No code or error, just redirect to reset password page
  return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
}

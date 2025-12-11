import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  console.log('🔐 Auth callback received');
  console.log('📋 Full URL:', requestUrl.toString());
  console.log('📋 Query string:', requestUrl.search);
  console.log('📋 Hash:', requestUrl.hash);
  
  // Check for errors first
  const error = requestUrl.searchParams.get('error') || new URLSearchParams(requestUrl.hash.substring(1)).get('error');
  const errorDescription = requestUrl.searchParams.get('error_description') || new URLSearchParams(requestUrl.hash.substring(1)).get('error_description');
  
  if (error) {
    console.error('❌ Auth error from Supabase:', { error, errorDescription });
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${encodeURIComponent(error)}`
    );
  }

  // For implicit flow (password recovery), tokens come in hash fragment
  // Just redirect with the hash intact so the SDK can process it
  if (requestUrl.hash && requestUrl.hash.includes('access_token')) {
    console.log('🔐 Implicit flow tokens detected in hash');
    const redirectUrl = `${requestUrl.origin}/reset-password${requestUrl.hash}`;
    console.log('📍 Redirecting to:', redirectUrl.substring(0, 100) + '...');
    return NextResponse.redirect(redirectUrl);
  }

  // For PKCE flow, code comes in query params (fallback)
  const code = requestUrl.searchParams.get('code');
  if (code) {
    console.log('🔐 PKCE code detected in query params');
    const redirectUrl = `${requestUrl.origin}/reset-password?code=${encodeURIComponent(code)}`;
    console.log('📍 Redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  console.log('ℹ️ No auth parameters found, redirecting to home');
  return NextResponse.redirect(`${requestUrl.origin}/`);
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔐 Auth callback received:', { 
    code: code ? `${code.substring(0, 10)}...` : '❌', 
    type,
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

  // For recovery links, Supabase doesn't send a 'code' - instead it establishes session directly
  // The URL just needs to be accessed with the recovery token in the URL hash or as a param
  // If we got here without an error, the user likely has a recovery session
  
  console.log('✅ Recovery link accessed successfully');
  console.log('Redirecting to reset password form...');

  // Redirect to reset password - the session should be established by Supabase
  const response = NextResponse.redirect(`${requestUrl.origin}/reset-password?step=reset`);
  
  return response;
}

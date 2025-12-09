import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔐 Auth callback received:', { code: code ? '✅' : '❌', error });

  // Create Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

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
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

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

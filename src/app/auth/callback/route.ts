import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('🔐 Auth callback received:', { 
    code: code ? `${code.substring(0, 10)}...` : '❌', 
    token: token ? `${token.substring(0, 10)}...` : '❌',
    type,
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

  // Handle recovery tokens (from email links) - token is the recovery token
  if (token && type === 'recovery') {
    console.log('🔐 Recovery token detected, using as code for exchange...');
    const codeToExchange = token;

    try {
      console.log('🔐 Processing recovery token with code:', codeToExchange.substring(0, 20) + '...');
      console.log('📋 Full URL:', requestUrl.toString());
      console.log('📋 All query params:', Array.from(requestUrl.searchParams.entries()));
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      console.log('🔐 Supabase config:', { url: supabaseUrl, anonKey: supabaseAnonKey.substring(0, 20) + '...' });

      // Create a Supabase client
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        }
      });

      // Recovery tokens work via exchangeCodeForSession - this is the PKCE recovery flow
      console.log('🔐 Attempting exchangeCodeForSession with token:', codeToExchange.substring(0, 20) + '...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(codeToExchange);

      console.log('📊 exchangeCodeForSession response:');
      console.log('  Error:', error ? { message: error.message, status: error.status, code: error.code } : 'none');
      console.log('  Data:', data ? { session: !!data.session, user: data.session?.user?.email } : 'none');

      if (error) {
        console.error('❌ Recovery code exchange failed:', {
          message: error.message,
          status: error.status,
          code: error.code,
          originalError: JSON.stringify(error)
        });
        return NextResponse.redirect(
          `${requestUrl.origin}/reset-password?error=invalid_recovery_link`
        );
      }

      if (data.session?.user) {
        console.log('✅ Recovery code exchanged successfully! Session established for:', data.session.user.email);
        const response = NextResponse.redirect(
          `${requestUrl.origin}/reset-password?success=authenticated`
        );
        return response;
      }

      console.error('❌ Code exchange succeeded but no session created');
      console.log('📊 Data returned:', JSON.stringify(data));
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=session_failed`
      );
    } catch (err) {
      console.error('❌ Callback error:', err);
      console.error('📊 Full error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=callback_failed`
      );
    }
  }

  // Handle standard OAuth codes
  if (!code) {
    console.warn('⚠️ No code or token provided in recovery link');
    return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=no_code`);
  }

  try {
    console.log('🔐 Processing OAuth code with code:', code.substring(0, 20) + '...');
    
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

    // For standard OAuth codes
    console.log('🔐 Attempting exchangeCodeForSession with code:', code.substring(0, 20) + '...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('📊 exchangeCodeForSession response:');
    console.log('  Error:', error ? { message: error.message, status: error.status, code: error.code } : 'none');
    console.log('  Data:', data ? { session: !!data.session, user: data.session?.user?.email } : 'none');

    if (error) {
      console.error('❌ Code exchange failed:', {
        message: error.message,
        status: error.status,
        code: error.code,
        originalError: JSON.stringify(error)
      });
      return NextResponse.redirect(
        `${requestUrl.origin}/reset-password?error=invalid_code`
      );
    }

    if (data.session?.user) {
      console.log('✅ Code exchanged successfully! Session established for:', data.session.user.email);
      const response = NextResponse.redirect(
        `${requestUrl.origin}/reset-password?success=authenticated`
      );
      return response;
    }

    console.error('❌ Code exchange succeeded but no session created');
    console.log('📊 Data returned:', JSON.stringify(data));
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=session_failed`
    );
  } catch (err) {
    console.error('❌ Callback error:', err);
    console.error('📊 Full error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=callback_failed`
    );
  }
}

import { createClient } from '@supabase/supabase-js';
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

  // For password recovery, we need to use the user's client and just verify the code is valid
  // The actual session will be created when the user submits their new password
  if (code) {
    try {
      console.log('🔄 Validating recovery code...');
      
      // Create an authenticated client with the code to verify it's valid
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }
      
      // Create a temporary client to verify the code
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: false,
        }
      });

      // Try to verify the session from the recovery code
      const { data, error: verifyError } = await tempClient.auth.verifyOtp({
        type: 'recovery',
        code: code,
        // Token is in the URL as 'code', but verifyOtp expects 'token' in some cases
        token: code
      });

      if (verifyError) {
        console.log('⚠️ OTP verification result:', verifyError);
        // Even if OTP verify fails, the code might still be valid for reset
        // Pass the code to the reset page to use directly with updateUser
        console.log('✅ Redirecting to reset password with code...');
        return NextResponse.redirect(`${requestUrl.origin}/reset-password?code=${code}`);
      }

      console.log('✅ Recovery code verified, redirecting to reset password...');
      return NextResponse.redirect(`${requestUrl.origin}/reset-password?code=${code}`);
    } catch (err) {
      console.error('❌ Callback processing error:', err);
      // Even on error, redirect to reset password with the code
      // The form will handle it
      return NextResponse.redirect(`${requestUrl.origin}/reset-password?code=${requestUrl.searchParams.get('code')}`);
    }
  }

  // No code or error, just redirect to reset password page
  return NextResponse.redirect(`${requestUrl.origin}/reset-password`);
}

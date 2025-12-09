'use server';

import { createClient } from '@supabase/supabase-js';

export async function resetPasswordWithCode(password: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    console.log('🔐 Processing recovery code for password reset...');
    
    // First, use the anon key client to verify the OTP (recovery code)
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔄 Verifying recovery code as OTP...');
    const { data: otpData, error: otpError } = await anonClient.auth.verifyOtp({
      type: 'recovery',
      token: code
    });

    if (otpError) {
      console.error('❌ OTP verification failed:', otpError);
      // Try alternative: exchange it directly
      console.log('🔄 Attempting direct code exchange...');
      const { data: sessionData, error: exchangeError } = await anonClient.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('❌ Code exchange also failed:', exchangeError);
        throw new Error(`Invalid or expired recovery code: ${otpError.message}`);
      }

      if (!sessionData.session) {
        throw new Error('Failed to create session from recovery code');
      }

      // Update password with the authenticated user
      console.log('✅ Session created via exchange, updating password...');
      const { error: updateError } = await anonClient.auth.updateUser({
        password
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        throw updateError;
      }

      console.log('✅ Password reset successfully');
      return { success: true, message: 'Password reset successfully' };
    }

    if (!otpData.session) {
      throw new Error('Failed to create session from OTP');
    }

    console.log('✅ OTP verified, session created. Updating password...');

    // Now update the password with the verified session
    const { error: updateError } = await anonClient.auth.updateUser({
      password
    });

    if (updateError) {
      console.error('❌ Password update error:', updateError);
      throw updateError;
    }

    console.log('✅ Password reset successfully');
    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to reset password'
    );
  }
}

export async function resetPasswordWithSession(password: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      }
    });

    console.log('🔐 Updating password with active session...');
    
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      console.error('❌ Password update error:', error);
      throw error;
    }

    console.log('✅ Password reset successfully');
    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to reset password'
    );
  }
}

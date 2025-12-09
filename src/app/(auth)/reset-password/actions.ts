'use server';

import { createClient } from '@supabase/supabase-js';

export async function resetPasswordWithCode(password: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    console.log('🔐 Processing recovery code for password reset...');
    console.log('Code:', code.substring(0, 10) + '...');
    
    // Create a client with implicit flow for password recovery
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔄 Attempting to exchange recovery code for session...');
    
    // Exchange the code for a session
    // Recovery codes from password reset emails are meant to be used this way
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Code exchange error:', exchangeError);
      throw new Error(`Invalid or expired recovery code: ${exchangeError.message}`);
    }

    if (!sessionData.session) {
      throw new Error('Failed to create session from recovery code');
    }

    console.log('✅ Session created from recovery code, updating password...');
    console.log('User ID:', sessionData.session.user.id);

    // Now update the password with the authenticated session
    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      console.error('❌ Password update error:', updateError);
      throw new Error(`Failed to update password: ${updateError.message}`);
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
    
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      console.error('❌ Password update error:', error);
      throw new Error(`Failed to update password: ${error.message}`);
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

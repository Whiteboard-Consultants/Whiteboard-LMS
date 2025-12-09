'use server';

import { createClient } from '@supabase/supabase-js';

export async function resetPasswordWithCode(password: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // Use the service role client to handle the recovery code
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔐 Exchanging recovery code for session...');
    
    // Exchange the code for a session first
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Code exchange error:', exchangeError);
      throw exchangeError;
    }

    if (!sessionData.session) {
      throw new Error('Failed to create session from recovery code');
    }

    console.log('✅ Session created, updating password...');

    // Now use the session to update the password
    const { data, error } = await supabase.auth.admin.updateUserById(
      sessionData.session.user.id,
      { password }
    );

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

'use server';

import { createClient } from '@supabase/supabase-js';

export async function resetPasswordWithCode(password: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    // Create a client and use the recovery code
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: false,
      }
    });

    // First, verify the code is valid
    console.log('🔐 Verifying recovery code...');
    
    // Update password with the code as the auth token
    const { data, error } = await supabase.auth.updateUser(
      { password },
      {
        headers: {
          Authorization: `Bearer ${code}`
        }
      }
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

'use server';

import { createClient } from '@supabase/supabase-js';

export async function resetPasswordWithCode(password: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    console.log('🔐 Attempting password reset with recovery code...');
    console.log('Code length:', code.length);
    
    // Create a client with implicit flow
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔄 Step 1: Exchanging code for session...');
    
    // Try to exchange the code for a session
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Exchange failed:', exchangeError);
      
      // If exchange fails, try an alternative approach:
      // Use the code directly with resetPasswordForEmail
      console.log('🔄 Step 2: Trying alternative method...');
      
      // The code might be a hashed token, try using verifyOtp with email-less approach
      // This is a workaround for the recovery code issue
      console.log('⚠️ Code exchange failed, attempting direct password update...');
      
      // If we have a recovery code, we can attempt to use it by creating
      // a special client that treats it as a valid token
      const recoveryClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            // Try passing the code as authorization
            'Authorization': `Bearer ${code}`
          }
        }
      });

      const { error: updateError } = await recoveryClient.auth.updateUser({
        password
      });

      if (updateError) {
        console.error('❌ Direct update also failed:', updateError);
        throw new Error(`Invalid recovery code: ${exchangeError.message}`);
      }

      console.log('✅ Password updated via direct method');
      return { success: true, message: 'Password reset successfully' };
    }

    if (!sessionData.session) {
      throw new Error('Failed to create session from recovery code');
    }

    console.log('✅ Step 2: Session created, now updating password...');

    // Update password with the authenticated session
    const { error: updateError } = await supabase.auth.updateUser({
      password
    });

    if (updateError) {
      console.error('❌ Password update failed:', updateError);
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

'use server';

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('base64');
}

export async function resetPasswordWithCode(password: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    console.log('🔐 Attempting password reset with recovery code...');
    console.log('Original code length:', code.length);
    
    // Create a client for verifying the recovery token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      }
    });

    console.log('🔄 Step 1: Hashing recovery code...');
    // Hash the code as Supabase expects
    const hashedCode = hashCode(code);
    console.log('Hashed code length:', hashedCode.length);
    
    // Verify the recovery code using verifyOtp
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: hashedCode,
      type: 'recovery'
    });

    if (verifyError) {
      console.error('❌ Recovery code verification failed:', verifyError);
      throw new Error(`Invalid recovery code: ${verifyError.message}`);
    }

    if (!verifyData.session) {
      console.error('❌ No session created from recovery code');
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
    const message = error instanceof Error ? error.message : 'Failed to reset password';
    return { success: false, message };
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
        persistSession: true,
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
    const message = error instanceof Error ? error.message : 'Failed to reset password';
    return { success: false, message };
  }
}

'use server';

import { supabaseAdmin } from '@/lib/supabase';

export async function sendPasswordResetEmail(email: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) {
      console.error('Error generating recovery link:', error);
      throw error;
    }

    return { 
      success: true, 
      message: `Password reset email sent to ${email}`,
      link: data?.properties?.action_link 
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function setTemporaryPassword(email: string, tempPassword: string = 'password123') {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    // Update the user's password in Supabase Auth
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      (await supabaseAdmin.auth.admin.listUsers()).data?.users?.find(u => u.email === email)?.id || '',
      {
        password: tempPassword,
      }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    // Mark password as not yet changed by user (clear the password_changed_at timestamp)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ password_changed_at: null })
      .eq('email', email);

    if (dbError) {
      console.error('Error updating password_changed_at:', dbError);
      // Don't throw here as the password was already updated
    }

    return { 
      success: true, 
      message: `Temporary password set to: ${tempPassword}`,
      tempPassword: tempPassword
    };
  } catch (error) {
    console.error('Error setting temporary password:', error);
    throw new Error(`Failed to set temporary password: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

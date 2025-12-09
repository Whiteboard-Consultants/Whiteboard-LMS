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

    // First find the user ID by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    const user = users?.find(u => u.email === email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    // Update the user's password in Supabase Auth
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: tempPassword,
      }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
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

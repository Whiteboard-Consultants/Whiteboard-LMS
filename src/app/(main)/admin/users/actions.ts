'use server';

import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    // Determine the redirect URL based on environment
    // For local development, we don't use a custom redirectTo since Supabase
    // will redirect to https://localhost:3000 which won't work
    // Instead, we'll extract the token from the Supabase verify URL
    const generateLinkOptions: any = {
      type: 'recovery',
      email: email,
    };

    // Generate a recovery link using admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink(generateLinkOptions);

    if (error) {
      console.error('Error generating recovery link:', error);
      throw error;
    }

    const actionLink = data?.properties?.action_link;
    if (!actionLink) {
      throw new Error('No action link generated');
    }

    console.log('✅ Recovery link generated:', `${actionLink.substring(0, 50)}...`);
    console.log('🔗 Full recovery link:', actionLink);

    // The action_link from Supabase contains token, type, and redirect_to parameters
    // Our callback route will handle extracting the token and redirecting appropriately

    return { 
      success: true, 
      message: `Password reset email prepared for ${email}`,
      link: actionLink,
      // Note: In production, you would send this link via your email service here
      // For now, we'll rely on Supabase sending it automatically
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

'use server';

import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    // Generate a recovery link using admin API
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

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

    // Extract the token from the Supabase URL
    // Supabase link format: https://...supabase.co/auth/v1/verify?token=XXX&type=recovery&redirect_to=...
    const supabaseUrl = new URL(actionLink);
    const token = supabaseUrl.searchParams.get('token');
    
    if (!token) {
      throw new Error('No token extracted from recovery link');
    }

    // Create our own recovery link that points to our callback with just the token
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const customRecoveryLink = `${appUrl}/auth/callback?token=${token}&type=recovery`;
    
    console.log('🔗 Custom recovery link (for testing):', customRecoveryLink);

    return { 
      success: true, 
      message: `Password reset email prepared for ${email}`,
      link: customRecoveryLink,  // Return our custom link instead of Supabase's
      // Note: In production, you would send this link via your email service here
      // For now, we'll use this custom link for testing
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

export async function fetchUserEnrollments(userId: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    console.log('🔍 [SERVER ACTION] Fetching enrollments for user:', userId);

    const { data: enrollmentsData, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        courses:course_id(title)
      `)
      .eq('user_id', userId);

    console.log('📊 [SERVER ACTION] Query error:', error);
    console.log('📊 [SERVER ACTION] Enrollments data:', enrollmentsData);
    console.log('📊 [SERVER ACTION] Enrollments count:', enrollmentsData?.length || 0);

    if (error) {
      throw error;
    }

    return {
      success: true,
      enrollments: enrollmentsData || []
    };
  } catch (error) {
    console.error('❌ [SERVER ACTION] Error fetching enrollments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch enrollments',
      enrollments: []
    };
  }
}

export async function deleteUserEnrollment(enrollmentId: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    console.log('🗑️ [SERVER ACTION] Deleting enrollment:', enrollmentId);

    // First get the enrollment to verify it exists and get course_id
    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('id, course_id, user_id')
      .eq('id', enrollmentId)
      .single();

    if (fetchError || !enrollment) {
      throw new Error('Enrollment not found');
    }

    // Delete the enrollment
    const { error: deleteError } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId);

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ [SERVER ACTION] Enrollment deleted successfully');

    return {
      success: true,
      message: 'Course access revoked successfully'
    };
  } catch (error) {
    console.error('❌ [SERVER ACTION] Error deleting enrollment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete enrollment'
    };
  }
}

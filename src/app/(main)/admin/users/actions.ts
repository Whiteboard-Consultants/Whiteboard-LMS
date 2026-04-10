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

    // Fetch course enrollments
    const { data: courseEnrollmentsData, error: courseError } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        courses:course_id(title)
      `)
      .eq('user_id', userId)
      .not('course_id', 'is', null);

    console.log('📊 [SERVER ACTION] Course query error:', courseError);
    console.log('📊 [SERVER ACTION] Course enrollments data:', courseEnrollmentsData);
    console.log('📊 [SERVER ACTION] Course enrollments count:', courseEnrollmentsData?.length || 0);

    if (courseError) {
      throw courseError;
    }

    // Fetch test enrollments
    const { data: testEnrollmentsData, error: testError } = await supabaseAdmin
      .from('enrollments')
      .select(`
        *,
        tests:test_id(title),
        test_series:series_id(title)
      `)
      .eq('user_id', userId)
      .or('test_id.not.is.null,series_id.not.is.null');

    console.log('📊 [SERVER ACTION] Test query error:', testError);
    console.log('📊 [SERVER ACTION] Test enrollments data:', testEnrollmentsData);
    console.log('📊 [SERVER ACTION] Test enrollments count:', testEnrollmentsData?.length || 0);

    if (testError) {
      throw testError;
    }

    // Combine and format all enrollments
    const allEnrollments = [
      ...(courseEnrollmentsData || []).map(e => ({
        ...e,
        type: 'course' as const,
        title: e.courses?.title || 'Unknown Course'
      })),
      ...(testEnrollmentsData || []).map(e => ({
        ...e,
        type: e.test_id ? ('test' as const) : ('series' as const),
        title: e.tests?.title || e.test_series?.title || 'Unknown Test/Series'
      }))
    ];

    return {
      success: true,
      enrollments: allEnrollments
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

export async function approveUser(userId: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    console.log('✅ [SERVER ACTION] Approving user:', userId);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error approving user:', error);
      throw error;
    }

    console.log('✅ [SERVER ACTION] User approved successfully:', userId);

    return {
      success: true,
      message: 'User approved successfully',
      data
    };
  } catch (error) {
    console.error('❌ [SERVER ACTION] Error approving user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve user'
    };
  }
}

export async function rejectUser(userId: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    console.log('🚫 [SERVER ACTION] Rejecting user:', userId);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status: 'rejected' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }

    console.log('✅ [SERVER ACTION] User rejected successfully:', userId);

    return {
      success: true,
      message: 'User rejected successfully',
      data
    };
  } catch (error) {
    console.error('❌ [SERVER ACTION] Error rejecting user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject user'
    };
  }
}

export async function suspendUser(userId: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    console.log('⏸️ [SERVER ACTION] Suspending user:', userId);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status: 'suspended' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error suspending user:', error);
      throw error;
    }

    console.log('✅ [SERVER ACTION] User suspended successfully:', userId);

    return {
      success: true,
      message: 'User suspended successfully',
      data
    };
  } catch (error) {
    console.error('❌ [SERVER ACTION] Error suspending user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to suspend user'
    };
  }
}

export async function reinstateUser(userId: string) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    console.log('🔄 [SERVER ACTION] Reinstating user:', userId);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error reinstating user:', error);
      throw error;
    }

    console.log('✅ [SERVER ACTION] User reinstated successfully:', userId);

    return {
      success: true,
      message: 'User reinstated successfully',
      data
    };
  } catch (error) {
    console.error('❌ [SERVER ACTION] Error reinstating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reinstate user'
    };
  }
}

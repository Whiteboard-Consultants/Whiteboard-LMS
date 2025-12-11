'use server';

import { supabase } from '@/lib/supabase';

export async function sendPasswordReset(email: string) {
  try {
    // For password recovery, redirect directly to reset-password page
    // Supabase will append the recovery tokens as hash fragments to this URL
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`;
    
    console.log('📧 Sending password reset email with redirect:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('Password reset failed:', error);
      
      // For security reasons, don't reveal if email exists or not
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('User not found')) {
        return { success: true };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Password reset failed:', error);
    let errorMessage = 'An unknown error occurred.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function verifyRecoveryCode(code: string) {
  try {
    console.log('🔐 Server-side: Verifying recovery code with PKCE flow...');
    console.log('🔐 Code:', code.substring(0, 20) + '...');
    
    // For PKCE flow, we use exchangeCodeForSession instead of verifyOtp
    // This is the correct method for password recovery in PKCE flow
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('🔐 Server-side: Code exchange failed:', exchangeError);
      // Check if it's an expired code
      if (exchangeError.message && exchangeError.message.includes('expired')) {
        return { success: false, error: 'Your password reset link has expired. Please request a new one.' };
      }
      return { success: false, error: 'Your password reset link is invalid. Please request a new one.' };
    }
    
    if (exchangeData?.session?.user?.email) {
      console.log('🔐 Server-side: Code exchanged successfully:', exchangeData.session.user.email);
      return { 
        success: true, 
        user: {
          email: exchangeData.session.user.email,
          id: exchangeData.session.user.id
        }
      };
    }
    
    console.error('🔐 Server-side: Code exchanged but no user data returned');
    return { success: false, error: 'Failed to establish session. Please try again.' };
    
  } catch (error: unknown) {
    console.error('🔐 Server-side: Code verification failed:', error);
    let errorMessage = 'An error occurred during verification.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

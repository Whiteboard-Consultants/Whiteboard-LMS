
'use server';

import { supabase } from '@/lib/supabase';

export async function sendPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
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

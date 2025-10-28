import { supabase } from './supabase';
import type { User } from '@/types';

// This file mirrors auth helpers but avoids casting responses to `any`.

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, userData: {
  name: string;
  role: 'student' | 'instructor' | 'admin';
}) {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role
        }
      }
    });

    if (error) {
      throw error;
    }

    if (!authData.user) {
      throw new Error('No user data returned from sign up');
    }

    // Wait for potential DB trigger
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the user record with additional information
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        name: userData.name,
        role: userData.role,
        status: userData.role === 'instructor' ? 'pending' : 'approved'
      })
      .eq('id', authData.user.id);

    if (updateError) {
      throw updateError;
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Failed to fetch user data:', userError);
      return { data, error: null, userData: null };
    }

    return { data, error: null, userData };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error, userData: null };
  }
}

// Helper function to clear all auth-related localStorage
function clearAuthStorage() {
  try {
    const keys = Object.keys(localStorage || {});
    keys.forEach(key => {
      if (
        key.toLowerCase().includes('supabase') ||
        key.toLowerCase().includes('sb-') ||
        key.toLowerCase().includes('auth')
      ) {
        localStorage.removeItem(key);
      }
    });
  } catch (storageError) {
    console.warn('Failed to clear localStorage:', storageError);
  }
}

// Sign out - attempts server-side logout but always clears local state
export async function signOut() {
  try {
    console.log('🔄 Attempting server-side logout...');
    
    // First, attempt server-side logout (scope: 'global' invalidates token on server)
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    // 403 errors from signOut are non-fatal (session may already be invalid/expired)
    // The important part is clearing local state
    if (error && error.status !== 403) {
      console.warn('❌ Server logout failed with error:', error.message);
      return { data: null, error };
    }
    
    if (error && error.status === 403) {
      console.log('⚠️ Server returned 403 (session may be invalid), clearing local state anyway');
    } else {
      console.log('✅ Server-side logout successful');
    }
    
    // Always clear local auth state regardless of server response
    // This ensures UI reflects logged-out state immediately
    clearAuthStorage();
    
    return { data: null, error: null };
  } catch (error) {
    console.error('❌ Unexpected error during signOut:', error);
    
    // Even on unexpected errors, try to clear localStorage
    clearAuthStorage();
    
    return { data: null, error };
  }
}

// Manual logout function - clears all auth state locally
// Use this as a fallback if server logout fails or to force logout
export async function manualLogout() {
  console.log('🔴 Performing manual logout (clearing all auth state locally)');
  
  try {
    // Clear localStorage
    clearAuthStorage();
    
    // Also attempt to sign out from Supabase (don't wait for response)
    supabase.auth.signOut({ scope: 'local' }).catch(err => {
      console.warn('Background local signout failed:', err);
    });
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error during manual logout:', error);
    return { data: null, error };
  }
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });

    if (error) return { data: null, error };

    try {
      const redirectUrl = data && typeof data === 'object' && 'url' in (data as Record<string, unknown>)
        ? (data as Record<string, unknown>)['url'] as string | undefined
        : undefined;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return { data, error: null };
      }
    } catch (navErr) {
      console.warn('Failed to navigate to redirect URL automatically:', navErr);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error (unexpected):', error);
    return { data: null, error };
  }
}

// Change password
export async function changePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Change password error:', error);
    return { data: null, error };
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error };
  }
}
import { supabase } from './supabase';
import type { User } from '@/types';

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, userData: {
  name: string;
  role: 'student' | 'instructor' | 'admin';
}) {
  try {
    console.log('Starting user registration for:', email);
    
    // Try a more minimal signup approach to avoid triggers
    console.log('Creating auth user with minimal data...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      console.error('Error details:', JSON.stringify(authError, null, 2));
      
      // Handle specific Supabase auth errors
      if (authError.message.includes('Email rate limit exceeded')) {
        throw new Error('Too many registration attempts. Please try again later.');
      } else if (authError.message.includes('Invalid email')) {
        throw new Error('Please provide a valid email address.');
      } else if (authError.message.includes('Password should be')) {
        throw new Error('Password must be at least 6 characters long.');
      } else if (authError.message.includes('already registered')) {
        throw new Error('This email is already registered. Please try signing in instead.');
      } else {
        throw new Error(`Registration failed: ${authError.message}`);
      }
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Step 2: Wait a moment for Supabase to complete its internal setup
    await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 3: Wait for auth trigger to create user, then update with additional info
  console.log('Waiting for auth trigger to create user record...');
  
  // Wait a moment for the trigger to complete
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
    console.error('Failed to update user profile:', updateError);
    throw new Error(`Failed to update user profile: ${updateError.message}`);
  }
  
  console.log('User profile updated successfully');

    // TODO: Implement instructor approval workflow
    if (userData.role === 'instructor') {
      console.log('Instructor registration - approval workflow not yet implemented');
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
    console.log('🔐 Starting sign in for:', email);
    
    // Use API proxy to bypass CORS issues with Supabase auth
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      console.log('📡 Sending request to /api/auth/signin');
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log('📦 Response received, status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error || 'Sign in failed');
      }

      console.log('✅ Response OK, parsing JSON...');
      const responseData = await response.json();
      console.log('📄 Response data keys:', Object.keys(responseData));
      
      const { session, user } = responseData;
      console.log('👤 User:', user?.email, 'Session exists:', !!session);

      if (!session || !user) {
        console.error('❌ Missing session or user:', { hasSession: !!session, hasUser: !!user });
        throw new Error('Sign in failed - no session returned');
      }

      console.log('🔑 Setting session in Supabase client (non-blocking)...');
      // Set the session in Supabase client - don't wait for it to complete
      // Just fire and forget, the listener will handle it
      supabase.auth.setSession(session).then(() => {
        console.log('✅ setSession completed');
      }).catch((err) => {
        console.error('⚠️ setSession error (non-blocking):', err);
      });

      console.log('✅ Auth sign in successful for:', user.email);

      // Return immediately - don't fetch user data here
      // The auth hook's SIGNED_IN event will fetch the correct role
      // We default to student for initial redirect
      return { data: { user, session }, error: null, userData: null };
    } catch (timeoutError) {
      clearTimeout(timeout);
      if (timeoutError instanceof Error && timeoutError.name === 'AbortError') {
        console.error('⏱️ Request timeout');
        throw new Error('Login request timed out. Please check your connection and try again.');
      }
      throw timeoutError;
    }
  } catch (error) {
    console.error('❌ Sign in error:', error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === 'Invalid login credentials') {
      return { 
        data: null, 
        error: new Error('Invalid email or password. Please check your credentials and try again.'), 
        userData: null 
      };
    } else if (errorMessage.includes('Email not confirmed')) {
      return { 
        data: null, 
        error: new Error('Please check your email and click the confirmation link before signing in.'), 
        userData: null 
      };
    }
    
    return { data: null, error, userData: null };
  }
}

// Sign out
export async function signOut() {
  try {
    console.log('🔄 Starting Supabase sign out...');
    
    // Always attempt to sign out, regardless of current session state
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Supabase sign out error:', error);
      
      // For session-related errors, treat as successful since we're logging out anyway
      if (error.message.includes('Auth session missing') || 
          error.message.includes('session_not_found') ||
          error.message.includes('Invalid session') ||
          error.name === 'AuthSessionMissingError') {
        console.log('⚠️ Session already missing, treating as successful logout');
      } else {
        console.error('❌ Unexpected logout error:', error);
      }
    } else {
      console.log('✅ Supabase sign out successful');
    }
    
    // Always clear local storage auth data, regardless of API call result
    try {
      console.log('🔄 Clearing localStorage auth data...');
      
      // Clear all Supabase auth related data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supabase.auth') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('✅ localStorage cleared successfully');
    } catch (storageError) {
      console.warn('⚠️ Failed to clear localStorage:', storageError);
    }
    
    // Always return success to ensure logout flow continues
    return { error: null };
    
  } catch (error) {
    console.error('❌ Sign out process failed:', error);
    
    // Even on complete failure, try to clear localStorage and return success
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supabase.auth') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (storageError) {
      console.warn('⚠️ Failed to clear localStorage on error:', storageError);
    }
    
    // Return success to ensure user gets logged out from the UI
    return { error: null };
  }
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  try {
    console.log('🔐 Initiating Google OAuth sign-in');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Ensure the redirect target exists in your Supabase OAuth settings
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    console.log('Google OAuth response:', { data, error });

    if (error) {
      console.error('Google sign in error returned by Supabase:', error);
      return { data: null, error };
    }

    // Supabase may return a `url` to navigate to for redirect flows
    // If present, navigate there explicitly to avoid popup/redirect ambiguity
    // (useful during development where popup behavior can vary)
    try {
      const redirectUrl = (data as any)?.url;
      if (redirectUrl) {
        console.log('Redirecting browser to provider URL:', redirectUrl);
        window.location.href = redirectUrl;
        return { data, error: null };
      }
    } catch (navErr) {
      console.warn('Failed to navigate to redirect URL automatically:', navErr);
    }

    // If no explicit URL is returned, return the data so caller can handle it
    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error (unexpected):', error);
    return { data: null, error };
  }
}

// Change password
export async function changePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Change password error:', error);
    return { data: null, error };
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error };
  }
}
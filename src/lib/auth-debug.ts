// Auth debugging utilities
import { supabase } from './supabase';

export const debugAuthState = async () => {
  console.group('🔍 Auth Debug Information');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session Error:', sessionError);
    } else if (session) {
      console.log('✅ Session found');
      console.log('📧 User Email:', session.user.email);
      console.log('🆔 User ID:', session.user.id);
      console.log('⏰ Token Expires:', new Date(session.expires_at! * 1000));
      console.log('🔑 Has Refresh Token:', !!session.refresh_token);
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      const isExpired = session.expires_at! < now;
      console.log('⏳ Token Expired:', isExpired);
      
      if (isExpired) {
        console.warn('⚠️ Token is expired, should be refreshed');
      }
    } else {
      console.log('❌ No session found');
    }
    
    // Check localStorage for auth data
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('supabase.auth')
    );
    
    if (authKeys.length > 0) {
      console.log('💾 Auth data in localStorage:');
      authKeys.forEach(key => {
        console.log(`  - ${key}`);
      });
    } else {
      console.log('❌ No auth data in localStorage');
    }
    
  } catch (error) {
    console.error('❌ Error checking auth state:', error);
  }
  
  console.groupEnd();
};

export const clearAllAuthData = async () => {
  console.log('🧹 Clearing all auth data...');
  
  try {
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('supabase.auth')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key}`);
      }
    });
    
    console.log('✅ All auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuthState;
  (window as any).clearAuth = clearAllAuthData;
  
  console.log('🔧 Auth debug functions available:');
  console.log('  - debugAuth() - Show current auth state');
  console.log('  - clearAuth() - Clear all auth data');
}
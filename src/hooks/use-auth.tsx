"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback, useMemo } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

// Import debug utilities in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/auth-debug');
}

interface AuthContextType {
  user: SupabaseUser | null;
  userData: User | null;
  loading: boolean;
  error: Error | null;
  isClient: boolean;
  refreshUserData: () => Promise<void>;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true, 
  error: null,
  isClient: false,
  refreshUserData: async () => {},
  accessToken: null
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Set isClient flag after hydration
  useEffect(() => {
    // Use a small delay to reduce flickering during hydration
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to clear auth storage
  const clearAuthStorage = useCallback(() => {
    try {
      // Clear Supabase auth data from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('supabase.auth')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  }, []);

  // Check if JWT token is expired
  const isTokenExpired = useCallback((session: any) => {
    if (!session?.access_token) return true;
    
    try {
      // Decode JWT token payload (base64)
      const payloadBase64 = session.access_token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 30 second buffer)
      return payload.exp < (currentTime + 30);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return true; // Treat invalid tokens as expired
    }
  }, []);

  const fetchUserData = useCallback(async (supabaseUser: any) => {
    if (supabaseUser) {
      try {
        // Try to fetch existing user data with retry logic for new registrations
        let userData = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !userData) {
          // First, get the user data from the users table
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (userError) {
            if (userError.code === 'PGRST116') {
              // User not found - might be because trigger hasn't completed yet for new registrations
              console.log(`User not found in database (attempt ${attempts + 1}/${maxAttempts}), waiting for trigger...`);
              
              if (attempts < maxAttempts - 1) {
                // Wait and retry for new registrations
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
                continue;
              } else {
                // After max attempts, the user probably doesn't exist due to a trigger failure
                console.error("User not found after max attempts. This might indicate a registration issue.");
                setError(new Error("User profile not found. Please try logging out and logging back in, or contact support."));
                setUserData(null);
                return;
              }
            } else {
              // Other database errors
              console.error("Error fetching user data:", userError);
              console.error("Error details:", JSON.stringify(userError, null, 2));
              console.error("User ID:", supabaseUser.id);
              console.error("User email:", supabaseUser.email);
              setError(new Error(userError.message || "Failed to fetch user data"));
              setUserData(null);
              return;
            }
          } else {
            // User found, now try to get their profile data if they're a student
            let profileData = null;
            if (userRecord.role === 'student') {
              const { data: profile, error: profileError } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('user_id', supabaseUser.id)
                .single();
              
              if (profileError && profileError.code !== 'PGRST116') {
                // Log error but don't fail - profile might not exist yet
                console.log('Student profile not found or error:', profileError.message);
              } else if (profile) {
                profileData = profile;
              }
            }

            // Merge user data with profile data
            userData = {
              ...userRecord,
              // If profile exists, add the profile fields to the user object
              ...(profileData && {
                education: profileData.education,
                passingYear: profileData.passing_year,
                improvementAreas: profileData.improvement_areas,
                careerPlan: profileData.career_plan,
                isProfileComplete: profileData.is_profile_complete,
                needsInterviewSupport: profileData.needs_interview_support,
              })
            };
          }
          
          attempts++;
        }

        if (userData) {
          setUserData(userData);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        
        // Check if this might be an auth-related error
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('JWT') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          console.log("Detected auth error in user data fetch, checking session...");
          
          const { data: { session } } = await supabase.auth.getSession();
          if (!session || isTokenExpired(session)) {
            console.log("Session is expired, clearing storage and signing out...");
            clearAuthStorage();
            await supabase.auth.signOut();
            return;
          }
        }
        
        setError(err as Error);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  }, [isTokenExpired, clearAuthStorage]);

  const refreshUserData = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchUserData(user);
      setLoading(false);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          
          // Handle specific refresh token errors during initial session check
          if (error.message?.includes('Refresh Token Not Found') || 
              error.message?.includes('Invalid Refresh Token') ||
              error.message?.includes('refresh_token_not_found')) {
            console.log("Invalid refresh token detected on app start, clearing auth storage...");
            clearAuthStorage();
            await supabase.auth.signOut();
          }
          
          setError(new Error(error.message));
          setLoading(false);
          return;
        }

        // Check if the session token is expired
        if (session && isTokenExpired(session)) {
          console.log("Session token is expired, attempting refresh...");
          
          // Try to refresh the session
          const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.log("Failed to refresh session:", refreshError.message);
            
            // Handle specific refresh token errors
            if (refreshError.message?.includes('Refresh Token Not Found') || 
                refreshError.message?.includes('Invalid Refresh Token') ||
                refreshError.message?.includes('refresh_token_not_found')) {
              console.log("Invalid refresh token detected, clearing session and signing out...");
              // Clear any stored session data
              clearAuthStorage();
              await supabase.auth.signOut();
            }
            
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }
          
          if (!refreshedSession?.session) {
            console.log("No session returned after refresh, signing out...");
            await supabase.auth.signOut();
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }
          
          // Use the refreshed session
          setUser(refreshedSession.session.user);
          setAccessToken(refreshedSession.session.access_token || null);
          if (refreshedSession.session.user) {
            await fetchUserData(refreshedSession.session.user);
          }
        } else {
          setUser(session?.user ?? null);
          setAccessToken(session?.access_token || null);
          if (session?.user) {
            await fetchUserData(session.user);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Unexpected error during initial session check:", error);
        clearAuthStorage();
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    // IMPORTANT: Avoid calling signOut() inside this listener as it can create infinite loops
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        try {
          // Only handle specific auth events to avoid loops
          if (event === 'SIGNED_OUT') {
            // User explicitly signed out or session expired
            console.log("SIGNED_OUT event received, clearing user data...");
            setUser(null);
            setUserData(null);
            setAccessToken(null);
            setLoading(false);
            return;
          }
          
          // For SIGNED_IN and TOKEN_REFRESHED, update the session data
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
              setUser(session.user);
              setAccessToken(session.access_token || null);
              await fetchUserData(session.user);
            } else {
              setUser(null);
              setUserData(null);
              setAccessToken(null);
            }
            setLoading(false);
            return;
          }
          
          // For other events, just update the session if it exists
          setUser(session?.user ?? null);
          setAccessToken(session?.access_token || null);
          if (session?.user) {
            await fetchUserData(session.user);
          } else {
            setUserData(null);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error during auth state change:", error);
          // On error, only clear state - don't call signOut() to avoid loops
          setUser(null);
          setUserData(null);
          setAccessToken(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserData, isTokenExpired, clearAuthStorage]);

  // Set up real-time subscription for user data changes
  useEffect(() => {
    if (!user) return;

    // Temporarily disable real-time subscription to prevent infinite loops
    // TODO: Re-enable when the subscription loop issue is resolved
    /*
    const channel = supabase
      .channel(`user_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setUserData(payload.new as User);
        } else if (payload.eventType === 'DELETE') {
          setUserData(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    */
  }, [user]);

  // Periodic token validation to catch stale sessions
  useEffect(() => {
    if (!user) return;

    // Temporarily disable periodic validation to prevent potential loops
    // TODO: Re-enable when needed for production
    /*
    const validateToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && isTokenExpired(session)) {
          console.log("Periodic validation detected expired token, attempting refresh...");
          
          const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.log("Failed to refresh session during periodic validation:", refreshError.message);
            
            // Handle specific refresh token errors
            if (refreshError.message?.includes('Refresh Token Not Found') || 
                refreshError.message?.includes('Invalid Refresh Token') ||
                refreshError.message?.includes('refresh_token_not_found')) {
              console.log("Invalid refresh token detected during periodic validation, clearing session...");
              // Clear any stored session data
              clearAuthStorage();
            }
            
            await supabase.auth.signOut();
          } else if (!refreshedSession?.session) {
            console.log("No session returned after refresh during periodic validation, signing out...");
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error("Error during periodic token validation:", error);
        // Don't sign out on network errors, just log them
      }
    };

    // Check token every 5 minutes
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
    */
  }, [user, isTokenExpired, clearAuthStorage]);

  const value = useMemo(() => ({ user, userData, loading, error, isClient, refreshUserData, accessToken }), 
    [user, userData, loading, error, isClient, refreshUserData, accessToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

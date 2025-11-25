"use client";

import { useState, useEffect, useContext, createContext, ReactNode, useCallback, useMemo, useRef } from "react";
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
  const isMountedRef = useRef(true);

  // Set isClient flag after hydration
  useEffect(() => {
    // Minimal delay - just enough to mark hydration complete
    // This prevents hydration mismatches without causing visible flickering
    setIsClient(true);
    
    // Cleanup to mark component as unmounted
    return () => {
      isMountedRef.current = false;
    };
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

  const fetchUserData = useCallback(async (supabaseUser: any, skipRetry?: boolean, accessToken?: string) => {
    if (supabaseUser) {
      try {
        // Use provided token or try to get from session
        let token = accessToken;
        if (!token) {
          const { data: { session } } = await supabase.auth.getSession();
          token = session?.access_token;
        }
        
        if (!token) {
          console.log('❌ No access token available for fetching user data');
          setUserData(null);
          return;
        }

        console.log(`📥 fetchUserData called for user ${supabaseUser.id}, using API endpoint`);

        // Fetch user data via API endpoint (bypasses RLS issues)
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`📋 API response status:`, response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ API error:', errorData);
          
          if (response.status === 401) {
            console.log("Auth token invalid or expired, signing out...");
            clearAuthStorage();
            await supabase.auth.signOut();
            return;
          }

          if (response.status === 404) {
            // User not found - for new registrations, retry a few times
            if (skipRetry) {
              console.log('User not found (skipping retries for login flow)');
              setUserData(null);
              return;
            }

            console.log('User not found in database, retrying...');
            await new Promise(resolve => setTimeout(resolve, 500));
            // Retry by calling this function again
            return fetchUserData(supabaseUser, skipRetry);
          }

          throw new Error(errorData.error || 'Failed to fetch user data');
        }

        const { userData } = await response.json();

        if (userData) {
          console.log(`✅ userData loaded successfully:`, { id: userData.id, role: userData.role, name: userData.name });
          setUserData(userData);
          setError(null);
        } else {
          console.log(`❌ userData is null in response`);
          setUserData(null);
        }
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        
        setError(err as Error);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  }, [clearAuthStorage]);

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
        
        // Handle token refresh errors gracefully - these are expected when tokens expire
        if (error) {
          const isRefreshTokenError = error.message?.includes('Refresh Token Not Found') || 
                                      error.message?.includes('Invalid Refresh Token') ||
                                      error.message?.includes('refresh_token_not_found');
          
          if (isRefreshTokenError) {
            // Silently clear old session and continue as unauthenticated
            console.debug("Invalid refresh token detected on app start, clearing auth storage...");
            clearAuthStorage();
            setUser(null);
            setUserData(null);
            setAccessToken(null);
            setError(null); // Don't show error to user
            setLoading(false);
            return;
          }
          
          // For other errors, log and set error state
          console.error("Error getting session:", error);
          setError(new Error(error.message));
          setLoading(false);
          return;
        }

        // Check if the session token is expired
        if (session && isTokenExpired(session)) {
          console.debug("Session token is expired, attempting refresh...");
          
          // Try to refresh the session
          const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            const isRefreshTokenError = refreshError.message?.includes('Refresh Token Not Found') || 
                                        refreshError.message?.includes('Invalid Refresh Token') ||
                                        refreshError.message?.includes('refresh_token_not_found');
            
            if (isRefreshTokenError) {
              // Silently handle expired refresh tokens
              console.debug("Invalid refresh token during session refresh, clearing session...");
              clearAuthStorage();
              setUser(null);
              setUserData(null);
              setAccessToken(null);
              setError(null);
              setLoading(false);
              return;
            }
            
            console.error("Failed to refresh session:", refreshError.message);
            setUser(null);
            setUserData(null);
            setAccessToken(null);
            setLoading(false);
            return;
          }
          
          if (!refreshedSession?.session) {
            console.debug("No session returned after refresh, clearing auth...");
            setUser(null);
            setUserData(null);
            setAccessToken(null);
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
        setAccessToken(null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    // IMPORTANT: Avoid calling signOut() inside this listener as it can create infinite loops
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only update state if the component is still mounted
        if (!isMountedRef.current) {
          console.debug("Auth state change detected but component is unmounted, skipping update");
          return;
        }
        
        console.log("Auth state change event:", event);
        
        try {
          // Only handle specific auth events to avoid loops
          if (event === 'SIGNED_OUT') {
            // User explicitly signed out or session expired
            console.log("SIGNED_OUT event received, clearing user data...");
            if (isMountedRef.current) {
              setUser(null);
              setUserData(null);
              setAccessToken(null);
              setLoading(false);
            }
            return;
          }
          
          // For SIGNED_IN and TOKEN_REFRESHED, update the session data
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
              setUser(session.user);
              setAccessToken(session.access_token || null);
              // Pass the access token directly to avoid timing issues with setSession()
              await fetchUserData(session.user, true, session.access_token || undefined);
            } else {
              if (isMountedRef.current) {
                setUser(null);
                setUserData(null);
                setAccessToken(null);
              }
            }
            if (isMountedRef.current) {
              setLoading(false);
            }
            return;
          }
          
          // For other events, just update the session if it exists
          if (isMountedRef.current) {
            setUser(session?.user ?? null);
            setAccessToken(session?.access_token || null);
            if (session?.user) {
              // Skip retries for auth state changes, pass token directly
              await fetchUserData(session.user, true, session.access_token || undefined);
            } else {
              setUserData(null);
            }
            setLoading(false);
          }
        } catch (error) {
          console.error("Error during auth state change:", error);
          // On error, only clear state - don't call signOut() to avoid loops
          if (isMountedRef.current) {
            setUser(null);
            setUserData(null);
            setAccessToken(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
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

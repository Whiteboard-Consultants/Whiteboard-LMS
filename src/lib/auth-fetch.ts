/**
 * Helper function to make authenticated API calls using Bearer token
 * This function gets the current session from Supabase and includes it in the Authorization header
 */

import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

// Helper to read session from localStorage directly
function getSessionFromLocalStorage(): Session | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Supabase stores session in localStorage with key pattern: sb-<project-ref>-auth-token
    // The project ref from NEXT_PUBLIC_SUPABASE_URL=https://lqezaljvpiycbeakndby.supabase.co is "lqezaljvpiycbeakndby"
    const expectedKey = 'sb-lqezaljvpiycbeakndby-auth-token';
    
    // First try the specific Supabase key
    console.log(`authenticatedFetch: Looking for session in localStorage key: ${expectedKey}`);
    let stored = localStorage.getItem(expectedKey);
    
    if (stored) {
      console.log(`authenticatedFetch: ✅ Found session at expected key: ${expectedKey}`);
      try {
        const parsed = JSON.parse(stored);
        if (parsed.access_token) {
          console.log('authenticatedFetch: ✅ Got access_token from localStorage');
          return parsed;
        }
      } catch (e) {
        console.warn(`authenticatedFetch: Failed to parse session from ${expectedKey}`, e);
      }
    } else {
      console.log(`authenticatedFetch: ❌ Expected key not found, searching all keys...`);
    }
    
    // Fallback: check all localStorage keys for auth-token pattern
    const keys = Object.keys(localStorage);
    console.log(`authenticatedFetch: Checking ${keys.length} total localStorage keys`);
    
    for (const key of keys) {
      if (key.includes('auth-token')) {
        console.log(`authenticatedFetch: Found alternative auth key: ${key}`);
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.access_token) {
              console.log(`authenticatedFetch: ✅ Got access_token from alternative key: ${key}`);
              return parsed;
            }
          } catch (e) {
            console.warn(`authenticatedFetch: Failed to parse key ${key}`, e);
          }
        }
      }
    }
    
    console.log('authenticatedFetch: ❌ No auth-token found in any localStorage key');
    return null;
  } catch (e) {
    console.warn('authenticatedFetch: Error checking localStorage', e);
    return null;
  }
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  session?: Session | null
): Promise<Response> {
  // Use provided session or try to get the current session
  let currentSession = session;
  let source = 'provided';
  
  if (!currentSession) {
    // First, try getSession() which is the recommended Supabase way
    try {
      const { data: { session: fetchedSession } } = await supabase.auth.getSession();
      if (fetchedSession) {
        currentSession = fetchedSession;
        source = 'getSession()';
        console.log('authenticatedFetch: Got session from getSession()');
        console.log(`authenticatedFetch: Access token length: ${fetchedSession.access_token?.length}, Expires at: ${fetchedSession.expires_at}`);
      }
    } catch (e) {
      console.warn('authenticatedFetch: getSession() failed', e);
    }
    
    // If that didn't work, try localStorage as fallback
    if (!currentSession) {
      const localStorageSession = getSessionFromLocalStorage();
      if (localStorageSession) {
        currentSession = localStorageSession;
        source = 'localStorage';
        console.log('authenticatedFetch: Got session from localStorage');
      }
    }
  }
  
  console.log(`authenticatedFetch: Session source=${source}, has_access_token=${!!currentSession?.access_token}`);
  if (currentSession?.access_token) {
    console.log(`authenticatedFetch: Token length=${currentSession.access_token.length}, Expires=${currentSession.expires_at}`);
  }
  
  // Prepare fetch options
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };
  
  // Add Authorization header if we have a session
  if (currentSession?.access_token) {
    console.log(`authenticatedFetch: ✅ Adding Authorization header (token first 50 chars: ${currentSession.access_token.substring(0, 50)}...)`);
    (fetchOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${currentSession.access_token}`;
  } else {
    console.warn('authenticatedFetch: ❌ No access_token available - request will likely fail');
  }
  
  const result = await fetch(url, fetchOptions);
  console.log(`authenticatedFetch: ${url} returned ${result.status}`);
  return result;
}

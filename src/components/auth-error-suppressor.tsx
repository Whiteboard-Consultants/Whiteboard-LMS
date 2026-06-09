'use client';

import { useEffect } from 'react';

/**
 * Suppresses expected Supabase authentication errors from the console
 * These errors are handled gracefully in the useAuth hook
 */
export function AuthErrorSuppressor() {
  useEffect(() => {
    // Only patch once
    if ((window as any).__authErrorsSuppressed) return;
    (window as any).__authErrorsSuppressed = true;

    const originalError = console.error;
    const originalWarn = console.warn;

    // Patch console.error
    console.error = function(...args: any[]) {
      const firstArg = args[0];

      // Skip empty error objects (Supabase error objects that have no enumerable properties)
      if (firstArg && typeof firstArg === 'object' && Object.keys(firstArg).length === 0) {
        // Only suppress if this is the only argument or followed by a simple message
        // that looks like it's describing the empty object
        if (args.length === 1 || (args.length === 2 && typeof args[1] === 'string')) {
          return; // Suppress empty error objects
        }
      }

      // Check if it's an AuthApiError
      if (firstArg?.name === 'AuthApiError') {
        const message = firstArg.message || '';
        if (
          message.includes('Invalid Refresh Token') ||
          message.includes('Refresh Token Not Found') ||
          message.includes('refresh_token_not_found') ||
          message.includes('Could not refresh access token')
        ) {
          return; // Suppress this error
        }
      }

      // Check string messages
      const errorStr = firstArg?.toString?.() || '';
      if (
        errorStr.includes('Invalid Refresh Token') ||
        errorStr.includes('Refresh Token Not Found') ||
        errorStr.includes('refresh_token_not_found')
      ) {
        return; // Suppress
      }

      // Pass through all other errors
      originalError.apply(console, args) || originalError(...args);
    };

    // Patch console.warn
    console.warn = function(...args: any[]) {
      const errorStr = args[0]?.toString?.() || '';

      // Never intercept performance or Next.js image warnings
      if (errorStr.includes('[Vitals]') || errorStr.includes('Image with src')) {
        originalWarn.apply(console, args);
        return;
      }

      if (
        errorStr.includes('refresh_token') ||
        errorStr.includes('Refresh Token')
      ) {
        return; // Suppress
      }

      originalWarn.apply(console, args);
    };

    return () => {
      // Restore original functions on unmount
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // This component doesn't render anything
  return null;
}

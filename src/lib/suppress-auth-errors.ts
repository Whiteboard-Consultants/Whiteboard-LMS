/**
 * Suppresses known Supabase auth errors that are expected and handled gracefully
 * This prevents confusing error messages in the console while auth state is being resolved
 * 
 * @client
 */

'use client';

// This code runs in the browser after hydration
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Wait for DOM to be ready before patching console
  const patchConsole = () => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Patch console.error
    console.error = function(...args: any[]) {
      const firstArg = args[0];
      
      // Check if it's an AuthApiError (Supabase auth error)
      if (firstArg?.name === 'AuthApiError') {
        const message = firstArg.message || '';
        
        // Suppress known expected auth errors
        if (message.includes('Invalid Refresh Token') ||
            message.includes('Refresh Token Not Found') ||
            message.includes('refresh_token_not_found') ||
            message.includes('Could not refresh access token')) {
          // Silently suppress - these errors are handled in useAuth hook
          return;
        }
      }
      
      // Check error message string
      const errorStr = firstArg?.toString?.() || '';
      if (errorStr.includes('Invalid Refresh Token') ||
          errorStr.includes('Refresh Token Not Found') ||
          errorStr.includes('refresh_token_not_found')) {
        return;
      }
      
      // Pass through all other errors
      originalError.apply(console, args);
    };
    
    // Patch console.warn for similar warnings
    console.warn = function(...args: any[]) {
      const errorStr = args[0]?.toString?.() || '';
      
      // Suppress Supabase warnings about auth tokens
      if (errorStr.includes('refresh_token') || 
          errorStr.includes('Refresh Token')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
  };
  
  // Run immediately if document is ready, otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchConsole);
  } else {
    patchConsole();
  }
}

export {};

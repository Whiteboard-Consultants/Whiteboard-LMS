// Utility to clear all authentication data and refresh the page
// Use this when you get "Invalid Refresh Token" errors

export function clearAuthAndReload() {
    try {
        // Clear all Supabase auth keys from localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('supabase.auth.token') || 
                key.startsWith('sb-') || 
                key.includes('supabase')) {
                localStorage.removeItem(key);
                console.log('Removed auth key:', key);
            }
        });

        // Clear sessionStorage as well
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
            if (key.startsWith('supabase.auth.token') || 
                key.startsWith('sb-') || 
                key.includes('supabase')) {
                sessionStorage.removeItem(key);
                console.log('Removed session key:', key);
            }
        });

        console.log('Auth cleared. Reloading page...');
        
        // Reload the page to restart authentication
        window.location.reload();
    } catch (error) {
        console.error('Error clearing auth:', error);
    }
}

// Auto-clear auth on Invalid Refresh Token errors
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        if (error && error.message && 
            (error.message.includes('Invalid Refresh Token') || 
             error.message.includes('Refresh Token Not Found'))) {
            console.log('Auto-clearing auth due to refresh token error');
            clearAuthAndReload();
        }
    });
}

// Make function available globally for manual use
if (typeof window !== 'undefined') {
    (window as any).clearAuth = clearAuthAndReload;
}
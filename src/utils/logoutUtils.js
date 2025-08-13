import { supabase } from '../supabaseClient';

/**
 * Enhanced logout utility that handles different scenarios and environments
 */
export const handleLogout = async () => {
  try {
    console.log('Starting logout process...');
    
    // Get current session to check if user is actually logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No active session found, forcing local cleanup...');
      await forceLocalCleanup();
      return;
    }
    
    console.log('Active session found, attempting Supabase logout...');
    
    // Try different logout strategies based on the environment
    const isProduction = import.meta.env.PROD;
    const isVercel = import.meta.env.VITE_VERCEL_ENV;
    
    let logoutSuccess = false;
    
    // Strategy 1: Try local logout first (recommended for 403 errors)
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (!error) {
        console.log('Local logout successful');
        logoutSuccess = true;
      } else {
        console.warn('Local logout failed:', error.message);
      }
    } catch (localError) {
      console.warn('Local logout threw error:', localError.message);
    }
    
    // Strategy 2: If local logout failed and we're in development, try global logout
    if (!logoutSuccess && !isProduction) {
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (!error) {
          console.log('Global logout successful');
          logoutSuccess = true;
        } else {
          console.warn('Global logout failed:', error.message);
        }
      } catch (globalError) {
        console.warn('Global logout threw error:', globalError.message);
      }
    }
    
    // Strategy 3: Force local cleanup regardless of server response
    await forceLocalCleanup();
    
    console.log('Logout process completed');
    
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    await forceLocalCleanup();
  }
};

/**
 * Force local cleanup when server logout fails
 */
const forceLocalCleanup = async () => {
  try {
    console.log('Performing local cleanup...');
    
    // Clear Supabase auth storage keys
    const authKeys = [
      'supabase.auth.token',
      'sb-bieexexscxkrshdvyuhj-auth-token', // Your specific Supabase project key
      'supabase.auth.refreshToken',
      'supabase.auth.expiresAt'
    ];
    
    authKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove ${key}:`, error);
      }
    });
    
    // Clear all sessionStorage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
    
    // Clear any auth-related cookies
    clearAuthCookies();
    
    // Redirect to home/login page
    redirectToLogin();
    
  } catch (error) {
    console.error('Error in force local cleanup:', error);
    // Last resort - just reload the page
    window.location.reload();
  }
};

/**
 * Clear authentication-related cookies
 */
const clearAuthCookies = () => {
  try {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Clear each cookie
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear the cookie by setting expiration to past date
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
  } catch (error) {
    console.warn('Error clearing cookies:', error);
  }
};

/**
 * Redirect to login page after logout
 */
const redirectToLogin = () => {
  try {
    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      const currentPath = window.location.pathname;
      
      // If we're already on the home page, just reload
      if (currentPath === '/' || currentPath === '/login') {
        window.location.reload();
      } else {
        // Otherwise, navigate to home
        window.location.href = '/';
      }
    }, 100);
    
  } catch (error) {
    console.error('Error redirecting to login:', error);
    window.location.reload();
  }
};

/**
 * Check if user is properly logged out
 */
export const verifyLogoutComplete = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !session;
  } catch (error) {
    console.warn('Error verifying logout:', error);
    return true; // Assume logged out if we can't verify
  }
};

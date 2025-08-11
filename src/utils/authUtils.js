/**
 * Utility functions for authentication handling
 */

/**
 * Get the appropriate redirect URL for OAuth
 * @returns {string} The redirect URL
 */
export const getRedirectUrl = () => {
  // For production (Vercel), use the specific domain
  if (window.location.hostname === 'uerra.vercel.app') {
    return 'https://uerra.vercel.app';
  }
  
  // For development, use localhost
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return `${window.location.origin}`;
  }
  
  // Fallback to current origin
  return window.location.origin;
};

/**
 * Handle OAuth redirect by parsing URL parameters
 * This should be called on app initialization to handle OAuth callbacks
 */
export const handleOAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = urlParams.get('access_token');
  const errorParam = urlParams.get('error');
  
  if (accessToken || errorParam) {
    // Clear the hash from URL after processing
    window.history.replaceState(null, null, window.location.pathname);
    return { accessToken, error: errorParam };
  }
  
  return null;
};

/**
 * Configure OAuth options for Supabase
 * @returns {object} OAuth configuration object
 */
export const getOAuthOptions = () => ({
  redirectTo: getRedirectUrl()
});

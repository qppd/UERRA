/**
 * Utility functions for authentication handling
 */

/**
 * Get the appropriate redirect URL for OAuth
 * @returns {string} The redirect URL
 */
export const getRedirectUrl = () => {
  // In production, use the current origin
  // In development, use localhost with the correct port
  if (import.meta.env.DEV) {
    return `${window.location.origin}`;
  }
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

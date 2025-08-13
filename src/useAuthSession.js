import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          console.log('Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Check if we're in an OAuth callback
    const isOAuthCallback = window.location.hash.includes('access_token') || 
                           window.location.hash.includes('error');

    if (isOAuthCallback) {
      console.log('OAuth callback detected, processing tokens...');
      
      // Check for errors in the callback
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const error = urlParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        if (mounted) {
          setLoading(false);
        }
        return;
      }
      
      // Give Supabase time to process the OAuth tokens
      const processOAuthCallback = async () => {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts && mounted) {
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (session?.user) {
              console.log('OAuth session established:', session.user.email);
              setSession(session);
              setUser(session.user);
              setLoading(false);
              
              // Clean the URL
              window.history.replaceState(null, null, window.location.pathname);
              return;
            }
            
            if (error) {
              console.error('OAuth session error:', error);
              break;
            }
            
            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
            
          } catch (error) {
            console.error('Error processing OAuth callback:', error);
            break;
          }
        }
        
        // If we get here, OAuth didn't complete successfully
        console.warn('OAuth callback processing failed after', attempts, 'attempts');
        if (mounted) {
          setLoading(false);
        }
      };
      
      processOAuthCallback();
    } else {
      getInitialSession();
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
          
          // Always set loading to false after any auth state change
          setLoading(false);
          
          // Handle specific auth events
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing local state...');
            setSession(null);
            setUser(null);
            
            // Clear any remaining local storage
            try {
              localStorage.removeItem('supabase.auth.token');
              localStorage.removeItem('sb-bieexexscxkrshdvyuhj-auth-token');
            } catch (error) {
              console.warn('Error clearing local storage on signout:', error);
            }
          }
          
          // Clear OAuth callback URL after successful auth
          if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
            console.log('OAuth sign-in successful, cleaning URL...');
            window.history.replaceState(null, null, window.location.pathname);
          }
          
          // Handle token refresh failures
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}

export async function signOut() {
  try {
    console.log('Starting sign out process...');
    
    // First, try to sign out with scope: 'local' to avoid 403 errors
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    
    if (error) {
      console.error('Error during signOut:', error);
      
      // If local signout fails, try global signout
      if (error.status === 403) {
        console.log('Local signout failed, trying global signout...');
        const { error: globalError } = await supabase.auth.signOut({ scope: 'global' });
        
        if (globalError) {
          console.error('Global signout also failed:', globalError);
          // Force local cleanup even if server signout fails
          await forceLocalSignOut();
        }
      } else {
        // For other errors, force local cleanup
        await forceLocalSignOut();
      }
    }
    
    console.log('Sign out completed successfully');
    
    // Clear any local storage or session storage
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    
    // Redirect to login or refresh the page
    window.location.href = '/';
    
  } catch (error) {
    console.error('Unexpected error during signOut:', error);
    // Force local cleanup and redirect
    await forceLocalSignOut();
  }
}

// Helper function to force local signout when server signout fails
async function forceLocalSignOut() {
  try {
    console.log('Forcing local sign out...');
    
    // Clear all local auth data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies (if any)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Force page reload to clear React state
    window.location.reload();
    
  } catch (error) {
    console.error('Error in force local signout:', error);
    // Last resort - just reload the page
    window.location.reload();
  }
}

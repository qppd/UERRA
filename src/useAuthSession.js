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
          
          // Clear OAuth callback URL after successful auth
          if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
            console.log('OAuth sign-in successful, cleaning URL...');
            window.history.replaceState(null, null, window.location.pathname);
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
  await supabase.auth.signOut();
}

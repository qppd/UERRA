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
      console.log('OAuth callback detected, waiting for auth state change...');
      // Give Supabase a moment to process the OAuth tokens
      setTimeout(() => {
        if (mounted) {
          getInitialSession();
        }
      }, 100);
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
          if (event === 'SIGNED_IN' && isOAuthCallback) {
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

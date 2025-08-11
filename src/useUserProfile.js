import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          // If user doesn't exist, we'll handle this gracefully
          if (error.code === 'PGRST116') {
            // No rows returned, user profile doesn't exist
            setProfile(null);
            setError(null); // Don't treat this as an error initially
          } else {
            // Actual error occurred
            setError(error);
            setProfile(null);
          }
        } else {
          setProfile(data);
          setError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setProfile(null);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, error };
}

export async function upsertUserProfile({ id, email, role, agency_id }) {
  try {
    const profileData = { 
      id, 
      email, 
      role, 
      agency_id,
      name: email.split('@')[0] // Default name from email
    };

    // Only add created_at if it's a new record
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingUser) {
      profileData.created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('users')
      .upsert([profileData], {
        onConflict: 'id'
      })
      .select();
    
    return { data, error };
  } catch (err) {
    console.error('Error in upsertUserProfile:', err);
    return { data: null, error: err };
  }
}

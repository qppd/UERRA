import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        setProfile(data);
        setError(error);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, error };
}

export async function upsertUserProfile({ id, email, role, agency_id }) {
  const { data, error } = await supabase.from('users').upsert([
    { id, email, role, agency_id },
  ]);
  return { data, error };
}

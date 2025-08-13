import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const OAuthTest = () => {
  const [status, setStatus] = useState('Checking OAuth callback...');
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const testOAuthCallback = async () => {
      const addDetail = (message) => {
        setDetails(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
      };

      try {
        addDetail('Starting OAuth callback test');
        
        // Check URL hash
        const hash = window.location.hash;
        addDetail(`URL hash: ${hash}`);
        
        if (hash.includes('access_token')) {
          const urlParams = new URLSearchParams(hash.substring(1));
          const accessToken = urlParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token');
          
          addDetail(`Access token found: ${accessToken ? 'Yes' : 'No'}`);
          addDetail(`Refresh token found: ${refreshToken ? 'Yes' : 'No'}`);
          
          // Try to get session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            addDetail(`Session error: ${error.message}`);
            setStatus('OAuth callback failed');
          } else if (session?.user) {
            addDetail(`Session found for user: ${session.user.email}`);
            setStatus('OAuth callback successful!');
            
            // Clean URL
            window.history.replaceState(null, null, window.location.pathname);
            addDetail('URL cleaned');
            
            // Redirect to dashboard
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            addDetail('No session found, waiting...');
            setStatus('Waiting for session...');
            
            // Try again after a delay
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession?.user) {
                addDetail(`Session found on retry: ${retrySession.user.email}`);
                setStatus('OAuth callback successful!');
                window.history.replaceState(null, null, window.location.pathname);
                setTimeout(() => {
                  window.location.href = '/';
                }, 2000);
              } else {
                addDetail('Still no session after retry');
                setStatus('OAuth callback failed');
              }
            }, 1000);
          }
        } else if (hash.includes('error')) {
          const urlParams = new URLSearchParams(hash.substring(1));
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          addDetail(`OAuth error: ${error}`);
          addDetail(`Error description: ${errorDescription}`);
          setStatus('OAuth failed');
        } else {
          addDetail('No OAuth tokens in URL');
          setStatus('No OAuth callback detected');
        }
        
      } catch (error) {
        addDetail(`Unexpected error: ${error.message}`);
        setStatus('OAuth test failed');
      }
    };

    testOAuthCallback();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>OAuth Callback Test</h2>
      <p><strong>Status:</strong> {status}</p>
      
      <h3>Debug Log:</h3>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '4px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {details.map((detail, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            {detail}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => window.location.href = '/'}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default OAuthTest;

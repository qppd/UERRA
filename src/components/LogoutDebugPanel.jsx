import React, { useState } from 'react';
import { handleLogout, verifyLogoutComplete } from '../utils/logoutUtils';
import { useAuthSession } from '../useAuthSession';

/**
 * Debug component to test logout functionality
 * Remove this component in production
 */
export default function LogoutDebugPanel() {
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState(null);
  const { session, user } = useAuthSession();

  const testLogout = async () => {
    setTesting(true);
    setLastTest(null);

    try {
      console.log('=== LOGOUT TEST STARTED ===');
      console.log('Current user:', user?.email);
      console.log('Current session:', !!session);

      const startTime = Date.now();
      
      // Test the logout
      await handleLogout();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify logout completed
      const loggedOut = await verifyLogoutComplete();
      
      setLastTest({
        success: loggedOut,
        duration,
        timestamp: new Date().toLocaleTimeString()
      });

      console.log('=== LOGOUT TEST COMPLETED ===');
      console.log('Success:', loggedOut);
      console.log('Duration:', duration + 'ms');

    } catch (error) {
      console.error('=== LOGOUT TEST FAILED ===');
      console.error('Error:', error);
      
      setLastTest({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setTesting(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
        🔧 Logout Debug Panel
      </h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {user ? `Logged in as ${user.email}` : 'Not logged in'}
      </div>
      
      <button
        onClick={testLogout}
        disabled={testing || !user}
        style={{
          padding: '8px 16px',
          backgroundColor: testing ? '#ccc' : '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing || !user ? 'not-allowed' : 'pointer',
          marginBottom: '10px',
          width: '100%'
        }}
      >
        {testing ? 'Testing Logout...' : 'Test Logout'}
      </button>

      {lastTest && (
        <div style={{
          padding: '8px',
          backgroundColor: lastTest.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${lastTest.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <div><strong>Last Test:</strong> {lastTest.timestamp}</div>
          <div><strong>Result:</strong> {lastTest.success ? '✅ Success' : '❌ Failed'}</div>
          {lastTest.duration && <div><strong>Duration:</strong> {lastTest.duration}ms</div>}
          {lastTest.error && <div><strong>Error:</strong> {lastTest.error}</div>}
        </div>
      )}

      <div style={{ 
        marginTop: '10px', 
        fontSize: '10px', 
        color: '#666',
        borderTop: '1px solid #ddd',
        paddingTop: '8px'
      }}>
        This panel only appears in development mode.
        Check browser console for detailed logs.
      </div>
    </div>
  );
}

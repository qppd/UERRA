import React, { useState, useEffect } from 'react';
import { testDatabaseConnection, checkTablesExist } from '../utils/databaseTest';
import { supabase } from '../supabaseClient';

const DatabaseDebug = () => {
  const [connectionTest, setConnectionTest] = useState(null);
  const [tablesTest, setTablesTest] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const runTests = async () => {
      // Test database connection
      const connResult = await testDatabaseConnection();
      setConnectionTest(connResult);
      
      // Test table existence
      const tablesResult = await checkTablesExist();
      setTablesTest(tablesResult);
      
      // Test auth
      const { data: authData } = await supabase.auth.getUser();
      setAuthStatus(authData);
    };
    
    runTests();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      zIndex: 9999
    }}>
      <h4>Debug Info</h4>
      
      <div>
        <strong>Database Connection:</strong>
        <div style={{ color: connectionTest?.success ? 'green' : 'red' }}>
          {connectionTest ? (connectionTest.success ? '✓ Connected' : `✗ ${connectionTest.error}`) : 'Testing...'}
        </div>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Tables:</strong>
        {tablesTest ? (
          <div>
            {Object.entries(tablesTest).map(([table, exists]) => (
              <div key={table} style={{ color: exists ? 'green' : 'red' }}>
                {table}: {exists ? '✓' : '✗'}
              </div>
            ))}
          </div>
        ) : (
          <div>Checking...</div>
        )}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Auth Status:</strong>
        <div style={{ color: authStatus?.user ? 'green' : 'orange' }}>
          {authStatus?.user ? `✓ ${authStatus.user.email}` : 'Not logged in'}
        </div>
      </div>
    </div>
  );
};

export default DatabaseDebug;

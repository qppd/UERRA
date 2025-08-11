// Database connection test utility
import { supabase } from '../supabaseClient';

export async function testDatabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Database connection successful');
    return { success: true, data };
  } catch (err) {
    console.error('Database connection test error:', err);
    return { success: false, error: err.message };
  }
}

export async function checkTablesExist() {
  const tables = ['users', 'agencies', 'categories', 'reports'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      results[table] = error ? false : true;
      if (error) {
        console.warn(`Table ${table} not found:`, error.message);
      }
    } catch (err) {
      results[table] = false;
      console.warn(`Error checking table ${table}:`, err.message);
    }
  }
  
  return results;
}

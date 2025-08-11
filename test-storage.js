// Test script to verify Supabase Storage setup
// Run this in browser console after creating the bucket

import { supabase } from './src/supabaseClient.js';

async function testStorageSetup() {
  try {
    console.log('Testing storage bucket access...');
    
    // List buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    console.log('Available buckets:', buckets);
    
    // Check if photos bucket exists
    const photosBucket = buckets.find(bucket => bucket.name === 'photos');
    
    if (photosBucket) {
      console.log('✅ Photos bucket found:', photosBucket);
      
      // Test upload permissions
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const { data, error } = await supabase.storage
        .from('photos')
        .upload('test/test.txt', testFile);
        
      if (error) {
        console.error('❌ Upload test failed:', error);
      } else {
        console.log('✅ Upload test successful:', data);
        
        // Clean up test file
        await supabase.storage.from('photos').remove(['test/test.txt']);
        console.log('✅ Test file cleaned up');
      }
    } else {
      console.error('❌ Photos bucket not found. Please create it in Supabase dashboard.');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testStorageSetup();

// Simple test script to debug upload API
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testUploadAPI() {
  try {
    console.log('🧪 Testing upload API...');
    
    // Create a simple test file
    const testContent = 'test file content';
    fs.writeFileSync('/tmp/test-upload.txt', testContent);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream('/tmp/test-upload.txt'));
    formData.append('folder', 'test');
    formData.append('bucket', 'course-assets');
    
    console.log('📤 Making test upload request...');
    
    const response = await fetch('http://localhost:3000/api/supabase-upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: formData
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📋 Response body:', responseText);
    
    // Cleanup
    fs.unlinkSync('/tmp/test-upload.txt');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUploadAPI();
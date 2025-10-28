import { NextRequest, NextResponse } from 'next/server';
import { directUploadToSupabase } from '@/lib/direct-upload';

export async function POST(request: NextRequest) {
  console.log('🧪 TESTING DIRECT UPLOAD API');
  
  try {
    // Create a fake file for testing
    const testContent = 'This is a test file for upload verification';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-upload.txt', { type: 'text/plain' });
    
    console.log('📁 Test file created:', testFile.name, testFile.size);
    
    const result = await directUploadToSupabase(testFile);
    
    if (result.success) {
      console.log('✅ TEST UPLOAD SUCCESSFUL');
      return NextResponse.json({ 
        success: true, 
        message: 'Direct upload test SUCCESSFUL!',
        url: result.url 
      });
    } else {
      console.error('❌ TEST UPLOAD FAILED');
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('💥 TEST API ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
import { createClient } from '@supabase/supabase-js';

export async function testServiceUpload() {
  console.log('🧪 Testing service role upload...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) {
    console.error('❌ Service role key not found');
    return { success: false, error: 'Service role key not configured' };
  }
  
  console.log('🔑 Service key length:', supabaseServiceKey.length);
  console.log('🔑 Service key starts with:', supabaseServiceKey.substring(0, 20) + '...');
  
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
  
  // Create a test file buffer
  const testContent = Buffer.from('test file content for upload');
  const fileName = `test-${Date.now()}.txt`;
  const filePath = `course_thumbnails/${fileName}`;
  
  try {
    console.log('📤 Attempting upload with service role client...');
    
    const { data, error } = await serviceClient.storage
      .from('course-assets')
      .upload(filePath, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Upload successful:', data);
    
    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from('course-assets')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // Clean up - delete the test file
    await serviceClient.storage
      .from('course-assets')
      .remove([filePath]);
    
    console.log('🧹 Test file cleaned up');
    
    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('❌ Test upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
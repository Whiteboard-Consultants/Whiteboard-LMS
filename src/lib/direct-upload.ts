import { createClient } from '@supabase/supabase-js';

// Direct upload function that absolutely will work
export async function directUploadToSupabase(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
  console.debug('Direct upload starting for file:', file.name);
  console.debug('File details:', { name: file.name, size: file.size, type: file.type });
    
    // Create client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
  console.debug('Using service role client for upload');
    
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const fileExt = file.name.split('.').pop();
    const fileName = `upload_${timestamp}_${random}.${fileExt}`;
    const filePath = `course_thumbnails/${fileName}`;
    
  console.debug('Upload path:', filePath);
    
    // Convert file to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
  console.debug('Starting upload...');
    
    // Upload with explicit options
    const { data, error } = await supabase.storage
      .from('course-assets')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
      return { success: false, error: error.message };
    }
    
  console.log('Direct upload successful');
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-assets')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
  console.log('Direct upload public URL:', publicUrl);
    
    return { success: true, url: publicUrl };
    
  } catch (error) {
    console.error('💥 Direct upload failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
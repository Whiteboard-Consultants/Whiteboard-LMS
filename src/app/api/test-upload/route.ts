import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.debug('API /api/test-upload called');
  console.log('Headers:', {
    authorization: request.headers.get('authorization'),
    contentType: request.headers.get('content-type')
  });
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder');
    const bucket = formData.get('bucket');
    
    console.log('FormData received:', { 
      file: file ? `${file.name} (${file.size} bytes)` : 'none',
      folder,
      bucket
    });
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });
    }
    
    console.log('📁 File:', file.name, file.size);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    const fileName = `test_${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `course_thumbnails/${fileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from('course-assets')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    
    const { data: urlData } = supabase.storage
      .from('course-assets')
      .getPublicUrl(filePath);
    
    console.log('✅ Success:', urlData.publicUrl);
    
    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl,
      path: filePath
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

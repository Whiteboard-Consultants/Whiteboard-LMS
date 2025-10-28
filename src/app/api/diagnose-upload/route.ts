import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Upload diagnosis started');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'No authentication token provided',
        step: 'auth_check'
      }, { status: 401 });
    }
    
    const accessToken = authHeader.substring(7);
    console.log('✅ Auth token found');
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided',
        step: 'file_check'
      }, { status: 400 });
    }
    
    console.log('✅ File found:', { name: file.name, size: file.size, type: file.type });
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });
    
    console.log('✅ Supabase client created');
    
    // Test 1: Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: `Authentication failed: ${authError?.message || 'No user'}`,
        step: 'user_auth',
        details: { authError }
      }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Test 2: Check bucket existence
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot access storage: ${bucketError.message}`,
        step: 'bucket_access',
        details: { bucketError }
      }, { status: 500 });
    }
    
    const courseAssetsBucket = buckets?.find(b => b.name === 'course-assets');
    if (!courseAssetsBucket) {
      return NextResponse.json({ 
        success: false, 
        error: 'course-assets bucket not found',
        step: 'bucket_check',
        details: { availableBuckets: buckets?.map(b => b.name) }
      }, { status: 500 });
    }
    
    console.log('✅ Bucket found:', courseAssetsBucket.name);
    
    // Test 3: Try to upload the file
    const fileName = `test-${Date.now()}-${file.name}`;
    const filePath = `course_thumbnails/${fileName}`;
    
    console.log('🔄 Attempting upload to:', filePath);
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-assets')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      return NextResponse.json({ 
        success: false, 
        error: `Upload failed: ${uploadError.message}`,
        step: 'upload_attempt',
        details: { 
          uploadError,
          filePath,
          fileSize: file.size,
          fileType: file.type
        }
      }, { status: 500 });
    }
    
    console.log('✅ Upload successful:', uploadData);
    
    // Test 4: Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('course-assets')
      .getPublicUrl(filePath);
      
    console.log('✅ Public URL generated:', publicUrl);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Upload diagnosis completed successfully',
      details: {
        user: { id: user.id, email: user.email },
        bucket: courseAssetsBucket.name,
        file: { name: file.name, size: file.size, type: file.type },
        upload: { path: uploadData.path, fullPath: uploadData.fullPath },
        publicUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Upload diagnosis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'unexpected_error',
      details: { error: error instanceof Error ? error.stack : error }
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Image upload endpoint for rich text editor and blog posts
 * Accepts images and uploads them to Supabase Storage using user's access token
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [IMAGE UPLOAD] Starting image upload');
    
    // Verify user is authenticated (check authorization header)
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('⚠️ No authorization token provided');
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Get service role key for server-side Supabase Storage operations
    const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('❌ Missing NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB for images)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    console.log('📁 File:', { name: file.name, size: file.size, type: file.type });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${file.name.split('.')[0]}.${fileExtension}`;
    
    // Get bucket type from query parameter (default to 'uploads' for featured images)
    const url = new URL(request.url);
    const bucketType = url.searchParams.get('bucket') || 'featured';
    
    let bucket: string;
    let filePath: string;
    
    if (bucketType === 'editor') {
      // Rich text editor images go to course-assets
      bucket = 'course-assets';
      filePath = `blog_images/${fileName}`;
    } else {
      // Featured images (default) go to uploads bucket
      bucket = 'uploads';
      filePath = `${Date.now()}-${file.name}`;
    }

    // Get Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Direct REST API upload to Supabase Storage
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;
    
    console.log('🌐 Uploading to Supabase:', {
      url: uploadUrl.substring(0, 80) + '...',
      bucket,
      fileName,
      type: bucketType === 'editor' ? 'Rich Text Editor Image' : 'Featured Image'
    });

    const uploadStartTime = Date.now();
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': file.type,
        'x-upsert': 'false'
      },
      body: new Uint8Array(fileBuffer),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    const uploadDuration = Date.now() - uploadStartTime;
    console.log(`📥 Upload completed in ${uploadDuration}ms with status ${uploadResponse.status}`);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Upload failed:', { 
        status: uploadResponse.status, 
        error: errorText.substring(0, 200) 
      });
      
      return NextResponse.json({
        success: false,
        error: `Upload failed: HTTP ${uploadResponse.status}`
      }, { status: 500 });
    }

    console.log('✅ Image uploaded successfully');

    // Construct public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
    console.log('🔗 Public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('💥 Image upload error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}

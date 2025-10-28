import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Alternative upload endpoint using direct Supabase Storage REST API
 * This bypasses the Supabase SDK and uploads directly via HTTP
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [DIRECT API] Supabase storage upload via REST API');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication token required' 
      }, { status: 401 });
    }

    const accessToken = authHeader.substring(7);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'course_thumbnails';
    const bucket = (formData.get('bucket') as string) || 'course-assets';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    console.log('📁 File:', { name: file.name, size: file.size, type: file.type });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Get Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase URL' 
      }, { status: 500 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Direct REST API upload to Supabase Storage
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;
    
    console.log('🌐 Uploading via REST API:', {
      url: uploadUrl.substring(0, 80) + '...',
      method: 'POST',
      contentType: file.type,
      fileSize: fileBuffer.length
    });

    const uploadStartTime = Date.now();
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': file.type,
        'x-upsert': 'false'
      },
      body: new Uint8Array(fileBuffer),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    const uploadDuration = Date.now() - uploadStartTime;
    console.log(`📥 Upload API responded after ${uploadDuration}ms with status ${uploadResponse.status}`);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Upload API error:', { status: uploadResponse.status, error: errorText });
      
      return NextResponse.json({
        success: false,
        error: `Upload failed: HTTP ${uploadResponse.status}`
      }, { status: 500 });
    }

    console.log('✅ File uploaded successfully');

    // Construct public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
    console.log('🔗 Public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('💥 Direct API upload error:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown'
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}

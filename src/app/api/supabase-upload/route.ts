import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Supabase upload API route called');
    console.log('Content-Type header:', request.headers.get('content-type'));
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication token required' 
      }, { status: 401 });
    }
    
    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Got access token from header, token length:', accessToken.length);
    
    // Get form data
    console.log('Attempting to parse form data...');
    let formData;
    let file;
    let folder = 'course_thumbnails';
    let bucket = 'course-assets';
    
    try {
      formData = await request.formData();
      file = formData.get('file') as File;
      const folderField = formData.get('folder');
      const bucketField = formData.get('bucket');
      
      if (folderField) folder = folderField as string;
      if (bucketField) bucket = bucketField as string;
      
      console.log('✅ FormData parsed successfully');
      console.log('Form fields:', { fileSize: file?.size, fileType: file?.type, fileName: file?.name, folder, bucket });
    } catch (formDataError) {
      console.error('❌ FormData parsing error:', formDataError);
      const contentType = request.headers.get('content-type');
      const errorMsg = formDataError instanceof Error ? formDataError.message : 'Unknown error';
      
      // Try to get raw body for debugging
      let bodyPreview = '';
      try {
        const bodyBuffer = await request.arrayBuffer();
        bodyPreview = new TextDecoder().decode(bodyBuffer).substring(0, 200);
      } catch (e) {
        bodyPreview = 'Could not read body';
      }
      
      console.error('Request details:', { contentType, bodyPreview, errorMsg });
      return NextResponse.json({ 
        success: false, 
        error: `FormData parsing failed: ${errorMsg}. Content-Type: ${contentType}. If using FormData from browser, ensure it has 'multipart/form-data' Content-Type.`
      }, { status: 400 });
    }

    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    console.log('File details:', { name: file.name, size: file.size, folder, bucket });

    // Create Supabase client with the provided access token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }
    
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
    
    console.log('Supabase client created with auth token');

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Converting file to buffer...');
    // Convert File to Buffer for server-side upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    console.log('Uploading to path:', filePath, 'size:', fileBuffer.length);

    // Upload file to Supabase Storage with timeout
    console.log('Starting storage upload...');
    
    // Create a new client using SERVICE_ROLE_KEY to bypass RLS restrictions
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('🔑 Checking service key:', {
      hasServiceKey: !!serviceRoleKey,
      keyLength: serviceRoleKey?.length,
      first20Chars: serviceRoleKey?.substring(0, 20)
    });
    
    if (!serviceRoleKey) {
      console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error: missing service key. Check environment variables.',
        debug: {
          hasServiceKey: false,
          availableEnv: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
        }
      }, { status: 500 });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    
    console.log('✅ Using service role key for upload (bypasses RLS)...');
    
    console.log('🔍 DEBUG: File buffer info:', {
      bufferLength: fileBuffer.length,
      bufferType: typeof fileBuffer,
      contentType: file.type,
      fileName: file.name
    });

    console.log('🎯 About to call supabaseAdmin.storage.from()...');
    const storage = supabaseAdmin.storage.from(bucket);
    console.log('✅ Storage reference created');

    console.log('🚀 Calling upload method...');
    const uploadStartTime = Date.now();
    
    try {
      const { data, error } = await storage.upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

      const uploadDuration = Date.now() - uploadStartTime;
      console.log(`📥 Upload completed after ${uploadDuration}ms`);
      console.log('Response:', { hasError: !!error, hasData: !!data, errorMsg: error?.message, dataPath: data?.path });

      if (error) {
        console.error('❌ Storage upload error:', {
          message: error.message,
          cause: error.cause
        });
        return NextResponse.json({ 
          success: false, 
          error: `Storage upload failed: ${error.message}` 
        }, { status: 500 });
      }

      console.log('✅ Upload successful, getting public URL...');
      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;
      console.log('🔗 Public URL generated:', publicUrl);

      return NextResponse.json({ 
        success: true, 
        url: publicUrl,
        path: data.path 
      });

    } catch (uploadError) {
      const uploadDuration = Date.now() - uploadStartTime;
      console.error(`💥 Upload exception after ${uploadDuration}ms:`, {
        message: uploadError instanceof Error ? uploadError.message : String(uploadError),
        name: uploadError instanceof Error ? uploadError.name : 'Unknown'
      });
      
      return NextResponse.json({
        success: false,
        error: `Upload exception: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error details:', errorMessage);
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 });
  }
}
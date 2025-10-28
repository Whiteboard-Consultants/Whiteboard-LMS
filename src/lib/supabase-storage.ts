// Supabase Storage helper functions
import { createServerSupabaseClient, createServerSupabaseClientWithSession } from './supabase-server';
import { v4 as uuidv4 } from 'uuid';

export async function uploadToSupabaseStorage(
  file: File, 
  folder: string,
  bucket: string = 'course-assets',
  accessToken?: string,
  refreshToken?: string
): Promise<string> {
  try {
    // Always use cookie-based auth for server actions to avoid token issues
    const supabase = await createServerSupabaseClient();
    
    console.log('Starting upload:', { 
      fileName: file.name, 
      size: file.size, 
      folder, 
      bucket
    });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated for storage upload');
    }
    
    console.log('User authenticated:', user.id);
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Convert File to Buffer for server-side upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    console.log('Uploading to path:', filePath);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('Public URL generated:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Supabase Storage upload error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload file to storage');
  }
}

export async function deleteFromSupabaseStorage(
  filePath: string,
  bucket: string = 'course-assets'
): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Supabase Storage delete error:', error);
    throw new Error('Failed to delete file from storage');
  }
}

// Extract file path from public URL for deletion
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Remove the first few parts that are part of the base URL structure
    // Typical structure: /storage/v1/object/public/bucket-name/folder/file
    const bucketIndex = pathParts.findIndex(part => part === 'public');
    if (bucketIndex !== -1 && bucketIndex + 2 < pathParts.length) {
      return pathParts.slice(bucketIndex + 2).join('/');
    }
    return null;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
}
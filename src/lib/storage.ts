
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export async function uploadFile(file: File, path: string): Promise<string> {
    try {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `${path}/${fileName}`;
        
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: false
            });
        
        if (error) {
            console.error("Supabase storage error:", error);
            throw new Error(error.message);
        }
        
        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    } catch (error: unknown) {
        console.error("File upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload file.";
        throw new Error(errorMessage);
    }
}

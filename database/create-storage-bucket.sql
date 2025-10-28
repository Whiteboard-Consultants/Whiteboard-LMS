-- Create storage bucket for course assets
-- Run this in Supabase SQL Editor

-- First, check if bucket already exists
SELECT * FROM storage.buckets WHERE id = 'course-assets';

-- Create the storage bucket (will ignore if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload course assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for course assets" ON storage.objects;
DROP POLICY IF EXISTS "Instructors can delete their course assets" ON storage.objects;
DROP POLICY IF EXISTS "Instructors can update their course assets" ON storage.objects;

-- Create policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload course assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'course-assets' 
        AND auth.role() = 'authenticated'
    );

-- Create policy to allow public read access
CREATE POLICY "Public read access for course assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'course-assets');

-- Create policy to allow authenticated users to delete course assets
CREATE POLICY "Authenticated users can delete course assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'course-assets' 
        AND auth.role() = 'authenticated'
    );

-- Create policy to allow authenticated users to update course assets
CREATE POLICY "Authenticated users can update course assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'course-assets' 
        AND auth.role() = 'authenticated'
    );

-- Verify the bucket and policies were created
SELECT * FROM storage.buckets WHERE id = 'course-assets';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
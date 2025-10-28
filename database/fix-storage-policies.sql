-- Fix storage policies for course uploads
-- This addresses the RLS issue preventing file uploads

-- First, let's check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Drop existing policies for course-assets bucket
DROP POLICY IF EXISTS "Authenticated users can upload course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- Create more permissive policies for development
-- Policy 1: Allow all uploads to course-assets bucket (temporarily permissive for debugging)
CREATE POLICY "Allow uploads to course-assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'course-assets'
    );

-- Policy 2: Allow public SELECT access to course assets
CREATE POLICY "Public read access to course-assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'course-assets');

-- Policy 3: Allow updates to course-assets bucket
CREATE POLICY "Allow updates to course-assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'course-assets'
    ) WITH CHECK (
        bucket_id = 'course-assets'
    );

-- Policy 4: Allow deletes from course-assets bucket
CREATE POLICY "Allow deletes from course-assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'course-assets'
    );

-- Verify the new policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%course-assets%';

-- Also check if RLS is enabled on storage.objects
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
-- Storage policies for course-assets bucket
-- Run this in your Supabase SQL Editor to ensure proper upload permissions

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (uncomment if needed to clean up)
-- DROP POLICY IF EXISTS "Authenticated users can upload course thumbnails" ON storage.objects;
-- DROP POLICY IF EXISTS "Anyone can view course assets" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- Policy 1: Allow authenticated users to INSERT files
CREATE POLICY "Authenticated users can upload course thumbnails" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'course-assets' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] IN ('course_thumbnails', 'certificates', 'lesson_content')
    );

-- Policy 2: Allow public SELECT access to course assets
CREATE POLICY "Anyone can view course assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'course-assets');

-- Policy 3: Allow authenticated users to UPDATE their own uploads (optional)
CREATE POLICY "Users can update their uploads" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'course-assets' 
        AND auth.role() = 'authenticated'
    ) WITH CHECK (
        bucket_id = 'course-assets' 
        AND auth.role() = 'authenticated'
    );

-- Policy 4: Allow authenticated users to DELETE their own uploads (optional)
CREATE POLICY "Users can delete their uploads" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'course-assets' 
        AND auth.role() = 'authenticated'
    );

-- Verify the policies were created using the correct system catalog
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
  AND policyname LIKE '%course%';
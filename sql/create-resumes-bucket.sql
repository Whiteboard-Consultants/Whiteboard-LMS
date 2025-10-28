-- Create resumes storage bucket setup
-- NOTE: Storage buckets and policies must be created via Supabase Dashboard
-- SQL commands for storage don't work in all Supabase instances

-- STEP 1: Create Bucket via Dashboard
-- 1. Go to: https://supabase.com/dashboard
-- 2. Select your project: lqezaljvpiycbeakndby
-- 3. Navigate to: Storage (left sidebar)
-- 4. Click: "New Bucket"
-- 5. Configure:
--    - Bucket name: resumes
--    - Public bucket: ✅ Enable
--    - File size limit: 10 MB
--    - Allowed MIME types (copy exactly as shown below):
--      application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- STEP 2: Set Bucket Policies via Dashboard
-- After creating the bucket:
-- 1. Click on the "resumes" bucket
-- 2. Go to "Policies" tab
-- 3. Add these policies:

-- Policy 1: Allow Public Uploads
-- - Policy name: Allow resume uploads
-- - Allowed operation: INSERT
-- - Policy definition: bucket_id = 'resumes'

-- Policy 2: Allow Admin Read Access  
-- - Policy name: Allow admin read access
-- - Allowed operation: SELECT
-- - Policy definition: bucket_id = 'resumes'

-- Policy 3: Allow Admin Delete Access
-- - Policy name: Allow admin delete access  
-- - Allowed operation: DELETE
-- - Policy definition: bucket_id = 'resumes'

-- STEP 3: Run the resume_submissions table SQL
-- Execute the commands in create-resume-submissions-table.sql

-- Verification queries (run after setup):
-- Check if bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'resumes';

-- Check bucket policies:
-- SELECT * FROM storage.policies WHERE bucket_id = 'resumes';
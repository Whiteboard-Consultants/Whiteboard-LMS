-- Test if you can disable RLS temporarily using service role
-- This should be run as a service role user (admin)

-- Check if you have the right permissions
SELECT current_user, session_user;

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- If you're using service role, you can try:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
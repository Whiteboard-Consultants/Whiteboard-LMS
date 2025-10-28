-- TEMPORARY: Disable RLS on storage.objects for testing
-- ⚠️ WARNING: This makes your storage publicly writable - only use for testing!
-- ⚠️ Re-enable RLS and set up proper policies for production!

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Temporarily disable RLS (TESTING ONLY!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable RLS with:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
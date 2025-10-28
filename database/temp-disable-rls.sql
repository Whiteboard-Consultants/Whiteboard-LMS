-- Temporary fix: Disable RLS to test if that's the issue
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS on users table to test
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- After this, try logging in. If it works, then we know the issue is with RLS policies
-- If it still doesn't work, the issue is elsewhere

-- To re-enable RLS later, run:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
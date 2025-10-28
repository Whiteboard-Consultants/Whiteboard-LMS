-- TEMPORARY: Disable RLS completely to allow login while we debug
-- Run this in Supabase SQL Editor as a quick fix

-- Disable RLS on users table temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- This will allow the login to work immediately
-- After login works, we can gradually re-enable RLS with proper policies

-- To verify RLS is disabled:
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public';
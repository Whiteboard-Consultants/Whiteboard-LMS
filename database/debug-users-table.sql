-- Test query to verify users table and policies are working
-- Run this in Supabase SQL Editor to check current state

-- Check if users table exists and has data
SELECT COUNT(*) as user_count FROM public.users;

-- Check current policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- Check if there are any users in auth.users but not in public.users
SELECT 
    auth_users.id,
    auth_users.email,
    public_users.id as profile_exists
FROM auth.users auth_users
LEFT JOIN public.users public_users ON auth_users.id = public_users.id
WHERE public_users.id IS NULL;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
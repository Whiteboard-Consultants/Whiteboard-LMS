-- Check user status and auth configuration
-- Run this in your Supabase SQL Editor to debug login issues

-- 1. Check if users exist in auth.users
SELECT 'Users in auth.users:' as info;
SELECT id, email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Check if users exist in public.users  
SELECT 'Users in public.users:' as info;
SELECT id, email, name, role, status, created_at FROM public.users ORDER BY created_at DESC LIMIT 5;

-- 3. Check for any orphaned records
SELECT 'Auth users without public profile:' as info;
SELECT au.id, au.email, au.email_confirmed_at 
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 4. Check for public users without auth
SELECT 'Public users without auth:' as info;
SELECT pu.id, pu.email, pu.name
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;

SELECT 'User status check complete' as result;
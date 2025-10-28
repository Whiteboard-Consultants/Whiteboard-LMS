-- Simple count queries to check database state
-- Run these one by one in your Supabase SQL Editor

-- Query 1: Count users in auth.users
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Query 2: Count users in public.users
SELECT COUNT(*) as public_users_count FROM public.users;

-- Query 3: Show recent auth users (if any)
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- Query 4: Show recent public users (if any)
SELECT id, email, name, role, status, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 3;
-- Confirm the registration success
-- Run this to see the newly created user

SELECT 'Recent registrations:' as info;

-- Check auth users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 2;

-- Check public users  
SELECT id, email, name, role, status, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 2;

SELECT 'Registration verification complete' as result;
-- Set your user as admin for testing
-- Run this in Supabase SQL Editor

-- Update your user to have admin role
UPDATE public.users 
SET role = 'admin' 
WHERE id = '94388a0c-4b55-401e-85c6-02e67614ba1e';

-- Verify your admin status
SELECT id, name, email, role, status FROM public.users WHERE id = '94388a0c-4b55-401e-85c6-02e67614ba1e';
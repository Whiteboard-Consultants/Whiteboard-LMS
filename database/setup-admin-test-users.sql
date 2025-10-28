-- Add status column to users table and create sample users for admin testing
-- Run this in Supabase SQL Editor

-- First drop any existing check constraint that might be too restrictive
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_status_check;

-- Add status column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- Add the correct check constraint with all valid status values
ALTER TABLE public.users ADD CONSTRAINT users_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Update existing users to have approved status
UPDATE public.users SET status = 'approved' WHERE status IS NULL;

-- Create some sample users for testing admin functionality
-- (These will be test users to demonstrate the admin interface)

-- Sample pending user (for registration requests)
INSERT INTO public.users (id, email, name, role, status) 
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'pending.student@example.com',
    'Pending Student',
    'student',
    'pending'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Sample pending instructor (for registration requests)
INSERT INTO public.users (id, email, name, role, status) 
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'pending.instructor@example.com',
    'Pending Instructor',
    'instructor',
    'pending'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Sample approved student
INSERT INTO public.users (id, email, name, role, status) 
VALUES (
    '55555555-5555-5555-5555-555555555555',
    'approved.student@example.com',
    'Approved Student',
    'student',
    'approved'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Sample suspended user
INSERT INTO public.users (id, email, name, role, status) 
VALUES (
    '66666666-6666-6666-6666-666666666666',
    'suspended.user@example.com',
    'Suspended User',
    'student',
    'suspended'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Verify the users were created
SELECT name, email, role, status, created_at FROM public.users ORDER BY created_at DESC;
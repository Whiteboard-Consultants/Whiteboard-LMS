-- Fix the status check constraint to include 'approved'
-- Run this in Supabase SQL Editor

-- First, let's see what the current constraints exist
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
AND contype = 'c';

-- Check current status values in the table
SELECT DISTINCT status FROM public.users WHERE status IS NOT NULL;

-- Drop the existing check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_status_check;

-- First, fix any invalid status values
UPDATE public.users SET status = 'approved' WHERE status IS NULL OR status = '';
UPDATE public.users SET status = 'approved' WHERE status NOT IN ('pending', 'approved', 'rejected', 'suspended');

-- Now add the correct check constraint with all valid status values
ALTER TABLE public.users ADD CONSTRAINT users_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Verify the constraint was updated
SELECT conname, contype
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
AND contype = 'c';

-- Check final status values
SELECT DISTINCT status FROM public.users;
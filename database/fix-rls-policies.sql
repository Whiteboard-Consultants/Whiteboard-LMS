-- Fix for infinite recursion in users RLS policies
-- Run this in Supabase SQL Editor to fix the existing policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Public user profiles for instructors" ON public.users;

-- Create corrected RLS policies without recursion
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (
    auth.uid() = id
);

CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (
    auth.uid() = id
);

CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (
    auth.uid() = id
);

CREATE POLICY "Public user profiles for instructors" ON public.users FOR SELECT USING (
    role = 'instructor'
);

-- For admin access, we'll handle this at the application level rather than in RLS
-- to avoid recursion issues. Alternatively, you can use a separate admin role check
-- that doesn't query the users table itself.
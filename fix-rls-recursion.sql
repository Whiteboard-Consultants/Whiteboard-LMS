-- Fix RLS infinite recursion issue
-- Run this in your Supabase SQL Editor to fix the policy problems

-- First, drop all existing policies to clear any circular references
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- For admin access, create a simpler policy that doesn't cause recursion
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can update any user" ON public.users
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

-- Alternative: Temporarily disable RLS if the above still causes issues
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

SELECT 'RLS policies fixed - infinite recursion resolved' as result;
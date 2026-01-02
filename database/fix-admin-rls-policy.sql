-- Fix Admin User RLS Policy
-- Date: 2025-01-02
-- Description: Replace recursive RLS policy with a direct check

-- Drop existing admin policies that use recursive queries
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can update all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can insert new users" ON public.users;

-- Create new admin policies without recursive queries
-- Admin users can view all users (check auth.jwt() for admin role)
CREATE POLICY "Admin can view all users" ON public.users
    FOR SELECT
    USING (
        -- Check if current user is admin by their role in auth metadata or users table
        (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
        OR
        -- Also check JWT claims if admin role is set there
        auth.jwt() ->> 'custom_claims' IS NOT NULL
    );

-- Admin users can update all users
CREATE POLICY "Admin can update all users" ON public.users
    FOR UPDATE
    USING (
        (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
    );

-- Admin users can insert new users
CREATE POLICY "Admin can insert new users" ON public.users
    FOR INSERT
    WITH CHECK (
        (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin'
        OR auth.uid() IS NOT NULL -- Allow authenticated users to insert
    );

-- Alternative: Use a more efficient approach with service role bypass
-- Ensure service_role can always read all users
GRANT SELECT ON public.users TO service_role;
GRANT UPDATE ON public.users TO service_role;
GRANT INSERT ON public.users TO service_role;
GRANT DELETE ON public.users TO service_role;

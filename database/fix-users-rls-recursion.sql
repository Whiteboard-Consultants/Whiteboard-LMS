-- Fix Infinite Recursion in Users Table RLS Policies
-- Date: 2025-01-02
-- Description: Replace recursive RLS policies with non-recursive versions

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can update all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can insert new users" ON public.users;
DROP POLICY IF EXISTS "Users can register themselves" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Admin can insert new users" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create simple non-recursive policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy 4: Service role can do anything (for backend operations)
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Additional policy for admins - use a simpler check without recursion
-- This policy allows admins to view all users by checking the auth.jwt() claims
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT
    USING (
        -- Check if user has admin role in their JWT claims
        auth.jwt() ->> 'user_role' = 'admin'
        OR
        -- Fallback: service role always has access
        auth.role() = 'service_role'
    );

-- Policy for admins to update users
CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE
    USING (
        auth.jwt() ->> 'user_role' = 'admin'
        OR auth.role() = 'service_role'
    );

-- Grant necessary permissions explicitly
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;

GRANT ALL ON public.users TO service_role;

-- ============================================================================
-- Summary of Changes
-- ============================================================================
-- Removed all recursive policies that were causing infinite recursion errors
-- Replaced with simple, non-recursive policies:
-- ✓ Users can only view/update/insert their own profiles
-- ✓ Service role has full access for backend operations
-- ✓ Admins can view/update all users via JWT claims (no recursion)
--
-- The infinite recursion issue is now resolved

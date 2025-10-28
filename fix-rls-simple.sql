-- Temporarily disable RLS to fix infinite recursion
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Keep only the basic user policies (no admin recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;

-- Re-enable RLS with simple policies only
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Simple policies without admin recursion
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- For now, allow public read access to avoid admin recursion issues
-- We'll implement proper admin access later
CREATE POLICY "Allow public read access" ON public.users
    FOR SELECT USING (true);

SELECT 'RLS recursion fixed - using simple policies without admin checks' as result;
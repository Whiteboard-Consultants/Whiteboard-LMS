-- Comprehensive fix for RLS policies - Force clean and recreate
-- Run this in Supabase SQL Editor

-- First, completely disable RLS to clear any cached policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on users table (this will remove any we might have missed)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.users';
    END LOOP;
END $$;

-- Verify all policies are gone
SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public';

-- Re-enable RLS with fresh state
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "users_own_profile_select" ON public.users FOR SELECT USING (
    auth.uid() = id
);

CREATE POLICY "users_own_profile_update" ON public.users FOR UPDATE USING (
    auth.uid() = id
);

CREATE POLICY "users_own_profile_insert" ON public.users FOR INSERT WITH CHECK (
    auth.uid() = id
);

-- Allow anyone to see instructor profiles (for course listings)
CREATE POLICY "public_instructor_profiles" ON public.users FOR SELECT USING (
    role = 'instructor'
);

-- Verify the new policies are created
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public';
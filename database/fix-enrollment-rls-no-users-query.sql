-- ============================================================================
-- CRITICAL FIX: Fix Enrollment RLS Policy - Remove auth.users query
-- ============================================================================
-- The existing RLS policy tries to query auth.users table which causes:
-- ERROR: permission denied for table users (42501)
-- 
-- This happens because the SELECT policy in enrollments table is trying to 
-- access auth.users, but client connections don't have permission to query that.
--
-- Solution: Use auth.jwt() to check admin role instead of querying auth.users
-- ============================================================================

-- Step 1: Drop the broken policies
DROP POLICY IF EXISTS "Users can view their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Instructors can update enrollments" ON public.enrollments;

-- Step 2: Create fixed policies that use auth.jwt() instead of auth.users query
-- SELECT Policy: Users can see their own enrollments, or enrollments for courses they teach
CREATE POLICY "Users can view their enrollments" ON public.enrollments 
    FOR SELECT 
    USING (
        -- Students can see their own enrollments
        auth.uid() = user_id OR 
        -- Instructors can see enrollments where they are listed as the instructor
        auth.uid() = instructor_id OR
        -- Admins can see all enrollments (check JWT role claim instead of querying auth.users)
        (auth.jwt() ->> 'role') = 'admin'
    );

-- UPDATE Policy: Instructors can update enrollments for their courses  
CREATE POLICY "Instructors can update enrollments" ON public.enrollments 
    FOR UPDATE 
    USING (
        -- Instructors can update enrollments for courses they teach
        auth.uid() = instructor_id OR
        -- Admins can update any enrollment (check JWT role claim)
        (auth.jwt() ->> 'role') = 'admin'
    );

-- Step 3: Verify the policies are in place
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename = 'enrollments' AND schemaname = 'public';

-- Note: If you need to test this, make sure:
-- 1. The user is authenticated 
-- 2. The JWT token contains the 'role' claim (admin, student, instructor)
-- 3. You have proper enrollments data for the user_id

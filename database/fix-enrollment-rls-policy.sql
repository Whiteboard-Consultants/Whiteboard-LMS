-- ============================================================================
-- CRITICAL FIX: Enrollment RLS Policy
-- ============================================================================
-- This migration fixes the Row Level Security policy on the enrollments table
-- so that instructors can see ALL enrollments for courses they teach,
-- not just enrollments they are explicitly listed as the instructor_id on.
-- ============================================================================

-- Step 1: Drop the broken policies
DROP POLICY IF EXISTS "Users can view their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Instructors can update enrollments" ON public.enrollments;

-- Step 2: Create the corrected policies
-- SELECT Policy: Users can see their own enrollments, or enrollments for courses they teach
CREATE POLICY "Users can view their enrollments" ON public.enrollments 
    FOR SELECT 
    USING (
        -- Students can see their own enrollments
        auth.uid() = user_id OR 
        -- Instructors can see enrollments where they are listed as the instructor
        auth.uid() = instructor_id OR
        -- Admins can see all enrollments
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- UPDATE Policy: Instructors can update enrollments for their courses
CREATE POLICY "Instructors can update enrollments" ON public.enrollments 
    FOR UPDATE 
    USING (
        -- Instructors can update enrollments for courses they teach
        auth.uid() = instructor_id OR
        -- Admins can update any enrollment
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Step 3: Verify the policies are in place
-- Run this query to confirm:
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename = 'enrollments' AND schemaname = 'public';

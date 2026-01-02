-- Fix RLS Configuration Issues
-- Date: 2025-01-02
-- Description: Enable RLS on tables that are missing it and add appropriate policies

-- ============================================================================
-- 1. Enable RLS on course_skills table
-- ============================================================================

ALTER TABLE public.course_skills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view course skills" ON public.course_skills;
DROP POLICY IF EXISTS "Admins can manage course skills" ON public.course_skills;
DROP POLICY IF EXISTS "Admins can update course skills" ON public.course_skills;
DROP POLICY IF EXISTS "Admins can delete course skills" ON public.course_skills;
DROP POLICY IF EXISTS "Service role can manage course skills" ON public.course_skills;

-- Policy: Anyone can view course skills (public data about what skills each course teaches)
CREATE POLICY "Public can view course skills" ON public.course_skills
    FOR SELECT
    USING (true);

-- Policy: Admin/instructors can manage course skills
CREATE POLICY "Admins can manage course skills" ON public.course_skills
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "Admins can update course skills" ON public.course_skills
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "Admins can delete course skills" ON public.course_skills
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

-- Service role can manage course skills
CREATE POLICY "Service role can manage course skills" ON public.course_skills
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 2. Enable RLS on lesson_segments table
-- ============================================================================

ALTER TABLE public.lesson_segments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view lesson segments" ON public.lesson_segments;
DROP POLICY IF EXISTS "Admins can manage lesson segments" ON public.lesson_segments;
DROP POLICY IF EXISTS "Admins can update lesson segments" ON public.lesson_segments;
DROP POLICY IF EXISTS "Admins can delete lesson segments" ON public.lesson_segments;
DROP POLICY IF EXISTS "Service role can manage lesson segments" ON public.lesson_segments;

-- Policy: Anyone can view lesson segments (public educational content)
CREATE POLICY "Public can view lesson segments" ON public.lesson_segments
    FOR SELECT
    USING (true);

-- Policy: Admin/instructors can manage lesson segments
CREATE POLICY "Admins can manage lesson segments" ON public.lesson_segments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "Admins can update lesson segments" ON public.lesson_segments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "Admins can delete lesson segments" ON public.lesson_segments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

-- Service role can manage lesson segments
CREATE POLICY "Service role can manage lesson segments" ON public.lesson_segments
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 3. Enable RLS on lesson_variants table
-- ============================================================================

ALTER TABLE public.lesson_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view lesson variants" ON public.lesson_variants;
DROP POLICY IF EXISTS "Admins can manage lesson variants" ON public.lesson_variants;
DROP POLICY IF EXISTS "Admins can update lesson variants" ON public.lesson_variants;
DROP POLICY IF EXISTS "Admins can delete lesson variants" ON public.lesson_variants;
DROP POLICY IF EXISTS "Service role can manage lesson variants" ON public.lesson_variants;

-- Policy: Anyone can view lesson variants (public educational content)
CREATE POLICY "Public can view lesson variants" ON public.lesson_variants
    FOR SELECT
    USING (true);

-- Policy: Admin/instructors can manage lesson variants
CREATE POLICY "Admins can manage lesson variants" ON public.lesson_variants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "Admins can update lesson variants" ON public.lesson_variants
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "Admins can delete lesson variants" ON public.lesson_variants
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

-- Service role can manage lesson variants
CREATE POLICY "Service role can manage lesson variants" ON public.lesson_variants
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 4. Verify and ensure users table RLS is properly enabled
-- ============================================================================

-- IMPORTANT: Explicitly enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop problematic recursive policy if it exists and replace with simpler version
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Drop other existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Create clean RLS policies for users table
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can insert their own profile during signup
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update any user
CREATE POLICY "Admins can update any user" ON public.users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Service role can manage all user data
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- Summary of Changes
-- ============================================================================
-- RLS has been enabled on:
-- ✓ public.course_skills (was missing RLS)
-- ✓ public.lesson_segments (was missing RLS)
-- ✓ public.lesson_variants (was missing RLS)
-- ✓ public.users (already had RLS, but improved the insert policy)
--
-- All public-facing tables now have:
-- - Public SELECT access (for viewing educational content)
-- - Admin-only INSERT/UPDATE/DELETE (for content management)
-- - Service role access for backend operations

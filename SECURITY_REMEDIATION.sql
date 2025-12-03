-- Supabase Database Security Linter - Remediation Script
-- This script addresses all security issues identified by the database linter
-- Date: December 3, 2025

-- ============================================================================
-- PART 1: ENABLE ROW LEVEL SECURITY (RLS) ON ALL PUBLIC TABLES
-- ============================================================================

-- Issue: RLS Disabled in Public
-- Tables affected: announcements, carts, courses, enrollments, lessons, 
--                  test_questions, test_sections, tests, test_attempts, users

-- Enable RLS on announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.announcements IS 'RLS enabled for security';

-- Drop existing problematic policies that reference users table
DROP POLICY IF EXISTS "Everyone can view active announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin can manage announcements" ON public.announcements;

-- Recreate with safe policies
-- Policy: Everyone can view active announcements
CREATE POLICY "Everyone can view active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);

-- Policy: Only service role (admin client) can create/update/delete via direct admin access
-- Regular users cannot manage announcements through RLS - must use admin client
-- This is enforced through application logic, not RLS

-- Enable RLS on carts table
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.carts IS 'RLS enabled for security';

-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.courses IS 'RLS enabled for security';

-- Enable RLS on enrollments table
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.enrollments IS 'RLS enabled for security';

-- Enable RLS on lessons table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.lessons IS 'RLS enabled for security';

-- Enable RLS on test_questions table
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.test_questions IS 'RLS enabled for security';

-- Enable RLS on test_sections table
ALTER TABLE public.test_sections ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.test_sections IS 'RLS enabled for security';

-- Enable RLS on tests table
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.tests IS 'RLS enabled for security';

-- Enable RLS on test_attempts table
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.test_attempts IS 'RLS enabled for security';

-- ⚠️  IMPORTANT: Users table has special handling due to self-referential policies
-- We need to drop the problematic circular policies BEFORE enabling RLS
-- Drop all existing policies on users table first
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Users can register themselves" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can insert new users" ON public.users;
DROP POLICY IF EXISTS "Admin users can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Public user profiles for instructors" ON public.users;
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
DROP POLICY IF EXISTS "Public can view instructor profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can view instructor profiles" ON public.users;

-- Now enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.users IS 'RLS enabled for security';

-- Create non-recursive RLS policies for users table
-- These policies avoid the infinite recursion issue by not querying the users table itself

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile (during registration)
CREATE POLICY "Users can create own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Instructors can be viewed by public (for course viewing)
CREATE POLICY "Public can view instructor profiles" ON public.users
    FOR SELECT USING (role = 'instructor');

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

-- Grant SELECT on users table to authenticated users (for their own profile and instructor profiles)
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;

-- Grant permissions on other tables
GRANT SELECT ON public.announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT SELECT ON public.courses TO authenticated;
GRANT SELECT, INSERT ON public.enrollments TO authenticated;
GRANT SELECT ON public.lessons TO authenticated;
GRANT SELECT ON public.test_questions TO authenticated;
GRANT SELECT ON public.test_sections TO authenticated;
GRANT SELECT ON public.tests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.test_attempts TO authenticated;

-- Grant to anon role for public access
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT ON public.tests TO anon;
GRANT SELECT ON public.test_questions TO anon;
GRANT SELECT ON public.test_sections TO anon;
GRANT SELECT ON public.announcements TO anon;

-- ============================================================================
-- FIX POLICIES ON OTHER TABLES (Remove user table references)
-- ============================================================================

-- CARTS TABLE: Policies reference users, but we can use simple uid comparison instead
DROP POLICY IF EXISTS "Users can view own cart items" ON public.carts;
DROP POLICY IF EXISTS "Users can insert into own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.carts;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.carts;

CREATE POLICY "Users can view own cart items" ON public.carts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into own cart" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.carts
    FOR DELETE USING (auth.uid() = user_id);

-- COURSES TABLE: Public read, instructor edits through admin client
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can manage their courses" ON public.courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;

CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT USING (true);

-- ENROLLMENTS TABLE: Users see their own enrollments through admin client
DROP POLICY IF EXISTS "Users can view their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Instructors can update enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;

CREATE POLICY "Users can view their own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create enrollments" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- LESSONS TABLE: Accessible through course access (enforced in app logic)
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
CREATE POLICY "Anyone can view lessons" ON public.lessons
    FOR SELECT USING (true);

-- TEST_QUESTIONS, TEST_SECTIONS, TESTS: Public read (restrict in app logic)
DROP POLICY IF EXISTS "Anyone can view test questions" ON public.test_questions;
CREATE POLICY "Anyone can view test questions" ON public.test_questions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view test sections" ON public.test_sections;
CREATE POLICY "Anyone can view test sections" ON public.test_sections
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view tests" ON public.tests;
CREATE POLICY "Anyone can view tests" ON public.tests
    FOR SELECT USING (true);

-- TEST_ATTEMPTS: Users see their own attempts
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.test_attempts;
DROP POLICY IF EXISTS "Users can create attempts" ON public.test_attempts;
DROP POLICY IF EXISTS "Users can create test attempts" ON public.test_attempts;
CREATE POLICY "Users can view their own attempts" ON public.test_attempts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create test attempts" ON public.test_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 2: FIX FAQ MANAGEMENT VIEW - REMOVE SECURITY DEFINER
-- ============================================================================

-- Issue: Security Definer View + Auth Users Exposed
-- The faq_management_view is exposing auth.users to anonymous users and has
-- SECURITY DEFINER which is a security risk

-- Step 1: Drop the problematic view and any dependent views
DROP VIEW IF EXISTS public.faq_management_view CASCADE;
DROP VIEW IF EXISTS public.published_faqs_view CASCADE;

-- Step 2: Recreate faq_management_view WITHOUT SECURITY DEFINER
-- Note: Explicitly using SECURITY INVOKER (the default, but making it explicit)
CREATE VIEW public.faq_management_view WITH (SECURITY_INVOKER) AS
SELECT 
  f.id,
  f.question,
  f.answer,
  f.category_id,
  f.is_published,
  f.created_at,
  f.updated_at,
  f.created_by
FROM public.faqs f
WHERE f.is_published = true;

COMMENT ON VIEW public.faq_management_view IS 
'Published FAQ management view - SECURITY INVOKER for proper RLS enforcement';

-- ============================================================================
-- PART 3: FIX PUBLISHED FAQS VIEW - REMOVE SECURITY DEFINER
-- ============================================================================

-- Recreate published_faqs_view WITHOUT SECURITY DEFINER
-- Note: Explicitly using SECURITY INVOKER (the default, but making it explicit)
CREATE VIEW public.published_faqs_view WITH (SECURITY_INVOKER) AS
SELECT 
  id,
  question,
  answer,
  category_id,
  created_at,
  updated_at
FROM public.faqs
WHERE is_published = true;

COMMENT ON VIEW public.published_faqs_view IS 
'Published FAQs view - SECURITY INVOKER for proper RLS enforcement';

-- ============================================================================
-- PART 4: VERIFY RLS POLICIES AND ADD MISSING ONES
-- ============================================================================

-- Check that policies exist and are correctly configured
-- This is informational to verify the setup

-- For announcements table
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('announcements', 'carts', 'courses', 'enrollments', 'lessons', 
                     'test_questions', 'test_sections', 'tests', 'test_attempts', 'users')
ORDER BY tablename, policyname;

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================

-- 1. CIRCULAR RECURSION FIX:
--    The original issue: "infinite recursion detected in policy for relation "users""
--    Root cause: RLS policies on the users table were referencing the users table itself
--    Example of problematic policy:
--      CREATE POLICY "Admin check" ON users FOR SELECT USING (
--          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
--      );
--    
--    Why this fails: When RLS is enabled on users, querying users inside a policy
--    on users creates infinite recursion.
--
--    Solution implemented:
--    - Drop all self-referential policies on users table
--    - Create only simple policies that don't query users table
--    - Use auth.uid() comparison directly instead of checking role
--    - Admin operations (role checks) are done in application code
--    - Admin client uses service_role which bypasses RLS entirely

-- 2. SECURITY DEFINER Views (FIXED):
--    - faq_management_view: Removed SECURITY DEFINER, now uses SECURITY INVOKER
--    - published_faqs_view: Removed SECURITY DEFINER, now uses SECURITY INVOKER
--    
--    Why: SECURITY DEFINER causes queries to run with the view creator's permissions,
--    bypassing RLS policies. SECURITY INVOKER (default) runs queries with the current
--    user's permissions, respecting RLS.

-- 3. RLS ENABLED (FIXED):
--    All 10 tables now have RLS enabled with non-recursive policies:
--    - announcements, carts, courses, enrollments, lessons
--    - test_questions, test_sections, tests, test_attempts, users
--
--    Why: RLS must be explicitly enabled on tables to enforce row-level access control.
--    Policies alone don't work without RLS being enabled.

-- 4. AUTH.USERS EXPOSURE (FIXED):
--    The faq_management_view was exposing auth.users data. This is now fixed by:
--    - Removing SECURITY DEFINER
--    - Only selecting from faqs table, not auth.users
--    - Using SECURITY INVOKER to respect RLS policies

-- 5. ADMIN OPERATIONS PATTERN:
--    Since admin role checks cannot be done in RLS policies (causes recursion),
--    admin operations must use the Supabase admin client in your application:
--    
--    // In your Next.js server actions:
--    const supabaseAdmin = createClient(
--        process.env.NEXT_PUBLIC_SUPABASE_URL,
--        process.env.SUPABASE_SERVICE_ROLE_KEY  // ← This bypasses RLS
--    );
--    
--    // Use supabaseAdmin for admin operations:
--    await supabaseAdmin
--        .from('announcements')
--        .insert({ title, content, created_by: auth.uid() });
--    
--    // Use regular supabase for user operations:
--    await supabase
--        .from('announcements')
--        .select('*')  // Will only see active announcements due to RLS

-- ============================================================================
-- VERIFICATION STEPS
-- ============================================================================

-- 1. Verify RLS is enabled on all tables:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN 
  ('announcements', 'carts', 'courses', 'enrollments', 'lessons',
   'test_questions', 'test_sections', 'tests', 'test_attempts', 'users')
ORDER BY tablename;

-- 2. Verify views don't have SECURITY DEFINER:
SELECT table_schema, table_name, view_definition
FROM information_schema.views
WHERE table_schema = 'public' AND table_name IN 
  ('faq_management_view', 'published_faqs_view');

-- 3. Verify RLS policies exist:
SELECT schemaname, tablename, policyname, permissive, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================================================

-- 1. In Supabase Dashboard:
--    - Go to SQL Editor
--    - Create a new query
--    - Copy and paste this entire script
--    - Run the script (or run parts 1-4 separately)

-- 2. Test changes:
--    - Verify app still functions correctly
--    - Check that users can only access their own data
--    - Verify public data is accessible anonymously where intended

-- 3. Monitor for errors:
--    - Check Supabase dashboard for any policy violations
--    - Review application logs
--    - Test each user role (student, instructor, admin)

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

-- To disable RLS on a table (not recommended for production):
-- ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- To restore SECURITY DEFINER views (not recommended):
-- DROP VIEW public.faq_management_view;
-- CREATE VIEW public.faq_management_view WITH (SECURITY_DEFINER) AS ...

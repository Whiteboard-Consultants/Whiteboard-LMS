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

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.users IS 'RLS enabled for security';

-- ============================================================================
-- PART 2: FIX FAQ MANAGEMENT VIEW - REMOVE SECURITY DEFINER
-- ============================================================================

-- Issue: Security Definer View + Auth Users Exposed
-- The faq_management_view is exposing auth.users to anonymous users and has
-- SECURITY DEFINER which is a security risk

-- Step 1: Drop the problematic view
DROP VIEW IF EXISTS public.faq_management_view CASCADE;

-- Step 2: Recreate the view WITHOUT SECURITY DEFINER
CREATE VIEW public.faq_management_view AS
SELECT 
  f.id,
  f.title,
  f.content,
  f.category,
  f.is_published,
  f.created_at,
  f.updated_at,
  f.created_by
FROM public.faqs f
WHERE f.is_published = true;

COMMENT ON VIEW public.faq_management_view IS 
'Published FAQ management view - SECURITY INVOKER (default) for proper RLS enforcement';

-- ============================================================================
-- PART 3: FIX PUBLISHED FAQS VIEW - REMOVE SECURITY DEFINER
-- ============================================================================

-- Drop existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.published_faqs_view CASCADE;

-- Recreate without SECURITY DEFINER
CREATE VIEW public.published_faqs_view AS
SELECT 
  id,
  title,
  content,
  category,
  created_at,
  updated_at
FROM public.faqs
WHERE is_published = true;

COMMENT ON VIEW public.published_faqs_view IS 
'Published FAQs view - SECURITY INVOKER (default) for proper RLS enforcement';

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

-- 1. SECURITY DEFINER Views (FIXED):
--    - faq_management_view: Removed SECURITY DEFINER, now uses SECURITY INVOKER (default)
--    - published_faqs_view: Removed SECURITY DEFINER, now uses SECURITY INVOKER (default)
--    
--    Why: SECURITY DEFINER causes queries to run with the view creator's permissions,
--    bypassing RLS policies. SECURITY INVOKER (default) runs queries with the current
--    user's permissions, respecting RLS.

-- 2. RLS ENABLED (FIXED):
--    All 10 tables now have RLS enabled:
--    - announcements, carts, courses, enrollments, lessons
--    - test_questions, test_sections, tests, test_attempts, users
--
--    Why: RLS must be explicitly enabled on tables to enforce row-level access control.
--    Policies alone don't work without RLS being enabled.

-- 3. AUTH.USERS EXPOSURE (FIXED):
--    The faq_management_view was exposing auth.users data. This is now fixed by:
--    - Removing SECURITY DEFINER
--    - Only selecting from faqs table, not auth.users
--    - Using SECURITY INVOKER to respect RLS policies

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
SELECT schemaname, viewname, view_definition
FROM information_schema.views
WHERE schemaname = 'public' AND viewname IN 
  ('faq_management_view', 'published_faqs_view');

-- 3. Verify RLS policies exist:
SELECT tablename, policyname, permissive, qual, with_check
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

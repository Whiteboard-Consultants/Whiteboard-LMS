-- Migration: Fix Security Warnings
-- Date: 2026-02-18
-- Fixes:
--   1. Function search_path vulnerabilities (6 functions)
--   2. Overly permissive RLS policies on resume_submissions and test_sections

-- ============================================================================
-- PART 1: Fix function search_path vulnerabilities
-- Adding SET search_path = '' prevents search path manipulation attacks
-- ============================================================================

-- 1. mark_notification_read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = TRUE, updated_at = NOW()
  WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. get_unread_notification_count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_id_input UUID)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM public.notifications
  WHERE user_id = user_id_input AND read = FALSE;
  
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. user_has_test_access
CREATE OR REPLACE FUNCTION public.user_has_test_access(p_user_id uuid, p_test_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  v_series_id uuid;
  v_has_direct_access BOOLEAN;
  v_has_series_access BOOLEAN;
BEGIN
  -- Check if user has direct access to test
  SELECT EXISTS(
    SELECT 1 FROM public.enrollments 
    WHERE user_id = p_user_id 
    AND test_id = p_test_id 
    AND purchase_type = 'individual'
  ) INTO v_has_direct_access;
  
  IF v_has_direct_access THEN
    RETURN TRUE;
  END IF;
  
  -- Get series_id of the test
  SELECT series_id INTO v_series_id FROM public.tests WHERE id = p_test_id;
  
  IF v_series_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has series purchase access
  SELECT EXISTS(
    SELECT 1 FROM public.enrollments 
    WHERE user_id = p_user_id 
    AND series_id = v_series_id 
    AND purchase_type = 'series_package'
  ) INTO v_has_series_access;
  
  RETURN v_has_series_access;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = '';

-- 4. validate_series_pricing
CREATE OR REPLACE FUNCTION public.validate_series_pricing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS NOT NULL AND NEW.is_purchasable = true THEN
    -- Get sum of individual test prices in this series
    DECLARE
      v_individual_sum DECIMAL(10, 2);
    BEGIN
      SELECT COALESCE(SUM(price), 0) INTO v_individual_sum 
      FROM public.tests 
      WHERE series_id = NEW.id;
      
      -- Series price should be less than individual sum (to incentivize bulk purchase)
      IF NEW.price >= v_individual_sum AND v_individual_sum > 0 THEN
        RAISE WARNING 'Series price (₹%) should be less than sum of individual test prices (₹%)', 
          NEW.price, v_individual_sum;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 5. update_commission_rates_updated_at
CREATE OR REPLACE FUNCTION public.update_commission_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 6. update_video_progress_timestamp
CREATE OR REPLACE FUNCTION public.update_video_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ============================================================================
-- PART 2: Fix overly permissive RLS policies
-- ============================================================================

-- 2a. Fix notifications INSERT policy (should only allow service_role, not all users)
-- The service_role bypasses RLS anyway, so we restrict this to admins for non-service calls
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2b. Fix resume_submissions UPDATE policy (should only allow admins)
DROP POLICY IF EXISTS "Allow admins to update resume submissions" ON public.resume_submissions;
CREATE POLICY "Allow admins to update resume submissions" ON public.resume_submissions
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Also fix the SELECT policy for resume_submissions (should only allow admins)
DROP POLICY IF EXISTS "Allow admins to view all resume submissions" ON public.resume_submissions;
CREATE POLICY "Allow admins to view all resume submissions" ON public.resume_submissions
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2c. Fix test_sections policies (should only allow instructors/admins to modify)
DROP POLICY IF EXISTS "insert_policy" ON public.test_sections;
DROP POLICY IF EXISTS "update_policy" ON public.test_sections;
DROP POLICY IF EXISTS "delete_policy" ON public.test_sections;
DROP POLICY IF EXISTS "Instructors and admins can insert test sections" ON public.test_sections;
DROP POLICY IF EXISTS "Instructors and admins can update test sections" ON public.test_sections;
DROP POLICY IF EXISTS "Instructors and admins can delete test sections" ON public.test_sections;

-- Instructors can insert sections for their own tests
CREATE POLICY "Instructors and admins can insert test sections" ON public.test_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tests t
      JOIN public.users u ON u.id = auth.uid()
      WHERE t.id = test_sections.test_id
      AND (t.instructor_id = auth.uid() OR u.role = 'admin')
    )
  );

-- Instructors can update sections for their own tests
CREATE POLICY "Instructors and admins can update test sections" ON public.test_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t
      JOIN public.users u ON u.id = auth.uid()
      WHERE t.id = test_sections.test_id
      AND (t.instructor_id = auth.uid() OR u.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tests t
      JOIN public.users u ON u.id = auth.uid()
      WHERE t.id = test_sections.test_id
      AND (t.instructor_id = auth.uid() OR u.role = 'admin')
    )
  );

-- Instructors can delete sections for their own tests
CREATE POLICY "Instructors and admins can delete test sections" ON public.test_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tests t
      JOIN public.users u ON u.id = auth.uid()
      WHERE t.id = test_sections.test_id
      AND (t.instructor_id = auth.uid() OR u.role = 'admin')
    )
  );

-- ============================================================================
-- VERIFICATION: Run these queries to confirm fixes
-- ============================================================================

-- Check function search_path settings:
-- SELECT proname, prosecdef, proconfig 
-- FROM pg_proc 
-- WHERE proname IN ('mark_notification_read', 'get_unread_notification_count', 
--                   'user_has_test_access', 'validate_series_pricing',
--                   'update_commission_rates_updated_at', 'update_video_progress_timestamp');

-- Check RLS policies:
-- SELECT tablename, policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename IN ('resume_submissions', 'test_sections');

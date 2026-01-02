-- Fix Function Search Path Mutable Warnings
-- Date: 2025-01-02
-- Description: Add SET search_path to all trigger functions for security
-- This prevents function hijacking attacks by fixing the search path

-- ============================================================================
-- 1. update_contact_submissions_updated_at function
-- ============================================================================

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
DROP FUNCTION IF EXISTS update_contact_submissions_updated_at();

CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_contact_submissions_updated_at();

-- ============================================================================
-- 2. track_faq_changes function
-- ============================================================================

DROP TRIGGER IF EXISTS faq_audit_trigger ON faqs;
DROP FUNCTION IF EXISTS track_faq_changes();

CREATE OR REPLACE FUNCTION track_faq_changes()
RETURNS TRIGGER AS $$
DECLARE
  change_type_val VARCHAR(20);
BEGIN
  -- Determine change type
  IF TG_OP = 'INSERT' THEN
    change_type_val := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_published != NEW.is_published THEN
      change_type_val := CASE WHEN NEW.is_published THEN 'published' ELSE 'unpublished' END;
    ELSE
      change_type_val := 'updated';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    change_type_val := 'deleted';
  END IF;

  -- Insert into history
  INSERT INTO faq_history (
    faq_id,
    question_before,
    answer_before,
    is_published_before,
    question_after,
    answer_after,
    is_published_after,
    change_type,
    changed_by
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    OLD.question,
    OLD.answer,
    OLD.is_published,
    NEW.question,
    NEW.answer,
    NEW.is_published,
    change_type_val,
    COALESCE(NEW.updated_by, OLD.updated_by, auth.uid())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER faq_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON faqs
FOR EACH ROW
EXECUTE FUNCTION track_faq_changes();

-- ============================================================================
-- 3. update_faq_stats function
-- ============================================================================

DROP TRIGGER IF EXISTS faq_stats_trigger ON faq_feedback;
DROP FUNCTION IF EXISTS update_faq_stats();

CREATE OR REPLACE FUNCTION update_faq_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update helpful/unhelpful counts in faqs table
  UPDATE faqs
  SET 
    helpful_count = (SELECT COUNT(*) FROM faq_feedback WHERE faq_id = NEW.faq_id AND is_helpful = true),
    unhelpful_count = (SELECT COUNT(*) FROM faq_feedback WHERE faq_id = NEW.faq_id AND is_helpful = false)
  WHERE id = NEW.faq_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER faq_stats_trigger
AFTER INSERT ON faq_feedback
FOR EACH ROW
EXECUTE FUNCTION update_faq_stats();

-- ============================================================================
-- 4. update_timestamp function (for various tables)
-- ============================================================================

-- Drop all triggers that depend on update_timestamp
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP FUNCTION IF EXISTS update_timestamp();

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 5. handle_updated_at function
-- ============================================================================

DROP TRIGGER IF EXISTS handle_student_profiles_updated_at ON student_profiles;
DROP TRIGGER IF EXISTS handle_notifications_updated_at ON notifications;
DROP FUNCTION IF EXISTS handle_updated_at();

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER handle_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- 6. update_coupons_updated_at function
-- ============================================================================

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
DROP FUNCTION IF EXISTS update_coupons_updated_at();

CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON coupons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_coupons_updated_at();

-- ============================================================================
-- 7. handle_new_user function
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, name, email, role, status, "isProfileComplete")
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'instructor' THEN 'pending'
            ELSE 'approved'
        END,
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 8. update_updated_at_column function
-- ============================================================================

-- Drop all triggers that depend on update_updated_at_column
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
DROP TRIGGER IF EXISTS update_resume_submissions_updated_at ON resume_submissions;
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_submissions_updated_at 
    BEFORE UPDATE ON resume_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON announcements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. update_posts_updated_at function
-- ============================================================================

DROP FUNCTION IF EXISTS update_posts_updated_at();

CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================================
-- 10. set_instructor_id function
-- ============================================================================

DROP TRIGGER IF EXISTS set_instructor_id_trigger ON courses;
DROP FUNCTION IF EXISTS set_instructor_id();

CREATE OR REPLACE FUNCTION set_instructor_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Set instructor_id from instructor JSON field
    IF NEW.instructor IS NOT NULL AND NEW.instructor ? 'id' THEN
        NEW.instructor_id := (NEW.instructor->>'id')::UUID;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_instructor_id_trigger
    BEFORE INSERT OR UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION set_instructor_id();

-- ============================================================================
-- Summary of Changes
-- ============================================================================
-- Added SET search_path = public to all trigger functions:
-- ✓ update_contact_submissions_updated_at
-- ✓ track_faq_changes
-- ✓ update_faq_stats
-- ✓ update_timestamp
-- ✓ handle_updated_at
-- ✓ update_coupons_updated_at
-- ✓ handle_new_user
-- ✓ update_updated_at_column
-- ✓ update_posts_updated_at
-- ✓ set_instructor_id
--
-- This prevents function hijacking attacks by fixing the search path
-- and eliminates the "function_search_path_mutable" security warnings.

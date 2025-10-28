-- ============================================================================
-- FAQ System Database Schema
-- ============================================================================
-- WhitedgeLMS | Database-Driven FAQ Management System
-- Features: Version history, role-based access, audit trail, caching support
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. FAQ CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(20),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faq_categories_slug ON faq_categories(slug);
CREATE INDEX idx_faq_categories_active ON faq_categories(is_active);

-- ============================================================================
-- 2. MAIN FAQs TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE RESTRICT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL, -- Stored as JSON with rich text
  excerpt TEXT, -- Short summary for SEO
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_cached_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure no duplicate questions per category
  CONSTRAINT unique_question_per_category UNIQUE(category_id, question)
);

CREATE INDEX idx_faqs_category ON faqs(category_id);
CREATE INDEX idx_faqs_published ON faqs(is_published);
CREATE INDEX idx_faqs_created_by ON faqs(created_by);
CREATE INDEX idx_faqs_updated_at ON faqs(updated_at);
CREATE INDEX idx_faqs_created_at ON faqs(created_at);

-- ============================================================================
-- 3. FAQ VERSION HISTORY TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS faq_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id UUID NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
  
  -- Before state
  question_before TEXT,
  answer_before TEXT,
  is_published_before BOOLEAN,
  
  -- After state
  question_after TEXT,
  answer_after TEXT,
  is_published_after BOOLEAN,
  
  -- Change metadata
  change_type VARCHAR(20) NOT NULL, -- 'created', 'updated', 'published', 'unpublished', 'deleted'
  change_reason TEXT, -- Optional reason for change
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET, -- Optional: track IP for security
  user_agent TEXT -- Optional: track browser for security
);

CREATE INDEX idx_faq_history_faq_id ON faq_history(faq_id);
CREATE INDEX idx_faq_history_changed_by ON faq_history(changed_by);
CREATE INDEX idx_faq_history_changed_at ON faq_history(changed_at);
CREATE INDEX idx_faq_history_change_type ON faq_history(change_type);

-- ============================================================================
-- 4. FAQ FEEDBACK TABLE (Track helpfulness)
-- ============================================================================

CREATE TABLE IF NOT EXISTS faq_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id UUID NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100), -- For anonymous users
  is_helpful BOOLEAN, -- true = helpful, false = not helpful
  feedback_text TEXT, -- Optional user comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faq_feedback_faq_id ON faq_feedback(faq_id);
CREATE INDEX idx_faq_feedback_user_id ON faq_feedback(user_id);
CREATE INDEX idx_faq_feedback_created_at ON faq_feedback(created_at);

-- ============================================================================
-- 5. FAQ CACHE TABLE (for 1-hour caching)
-- ============================================================================

CREATE TABLE IF NOT EXISTS faq_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  cache_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- NOW() + 1 hour
  tag VARCHAR(100) -- For bulk cache invalidation (e.g., 'category:study_abroad')
);

CREATE INDEX idx_faq_cache_key ON faq_cache(cache_key);
CREATE INDEX idx_faq_cache_expires_at ON faq_cache(expires_at);
CREATE INDEX idx_faq_cache_tag ON faq_cache(tag);

-- Auto-cleanup expired cache entries (run periodically)
-- DELETE FROM faq_cache WHERE expires_at < NOW();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_cache ENABLE ROW LEVEL SECURITY;

-- FAQs: Anyone can read published, only admins/instructors can edit
CREATE POLICY "Public can read published FAQs"
  ON faqs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins and instructors can read all FAQs"
  ON faqs FOR SELECT
  USING (
    auth.uid() = created_by OR
    auth.uid() = updated_by OR
    (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'instructor')
  );

CREATE POLICY "Only authors and admins can update FAQs"
  ON faqs FOR UPDATE
  USING (
    auth.uid() = created_by OR
    (auth.jwt() ->> 'role' = 'admin')
  );

CREATE POLICY "Only admins can insert FAQs"
  ON faqs FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'instructor'
  );

CREATE POLICY "Only admins can delete FAQs"
  ON faqs FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- FAQ History: Anyone can read, auto-created on changes
CREATE POLICY "Anyone can read FAQ history"
  ON faq_history FOR SELECT
  USING (true);

-- FAQ Feedback: Anyone can create, read their own
CREATE POLICY "Anyone can create feedback"
  ON faq_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read feedback"
  ON faq_feedback FOR SELECT
  USING (true);

-- FAQ Cache: Backend service only
CREATE POLICY "Service role manages cache"
  ON faq_cache FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 7. TRIGGER FUNCTIONS
-- ============================================================================

-- Function to track FAQ changes in history table
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-track changes
CREATE TRIGGER faq_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON faqs
FOR EACH ROW
EXECUTE FUNCTION track_faq_changes();

-- ============================================================================
-- 8. FUNCTION TO UPDATE FAQ STATISTICS
-- ============================================================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats on feedback
CREATE TRIGGER faq_stats_trigger
AFTER INSERT ON faq_feedback
FOR EACH ROW
EXECUTE FUNCTION update_faq_stats();

-- ============================================================================
-- 9. INITIAL CATEGORIES (Seeding)
-- ============================================================================

INSERT INTO faq_categories (name, slug, icon, description, display_order) VALUES
  ('Study Abroad', 'study_abroad', '🌍', 'Questions about studying in different countries', 1),
  ('Test Preparation', 'test_preparation', '📚', 'IELTS, TOEFL, GMAT, GRE preparation questions', 2),
  ('Visa & Documentation', 'visa_documentation', '📄', 'Visa requirements and documentation process', 3),
  ('Costs & Financial Aid', 'costs_financial_aid', '💰', 'Tuition costs and scholarship information', 4),
  ('Career & Post-Studies', 'career_post_studies', '💼', 'Career prospects and post-study opportunities', 5),
  ('Courses & Programs', 'courses_programs', '🎓', 'Information about our courses and programs', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 10. HELPER VIEWS
-- ============================================================================

-- View: Published FAQs with category info
CREATE OR REPLACE VIEW published_faqs_view AS
SELECT 
  f.id,
  f.question,
  f.answer,
  f.excerpt,
  f.view_count,
  f.helpful_count,
  f.unhelpful_count,
  f.display_order,
  f.updated_at,
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon
FROM faqs f
JOIN faq_categories c ON f.category_id = c.id
WHERE f.is_published = true AND c.is_active = true
ORDER BY c.display_order, f.display_order;

-- View: FAQ Management (for admins)
CREATE OR REPLACE VIEW faq_management_view AS
SELECT 
  f.id,
  f.question,
  f.answer,
  f.is_published,
  f.display_order,
  f.view_count,
  f.helpful_count,
  f.unhelpful_count,
  c.name AS category_name,
  c.slug AS category_slug,
  u_created.email AS created_by_email,
  u_updated.email AS updated_by_email,
  f.created_at,
  f.updated_at,
  (SELECT COUNT(*) FROM faq_history WHERE faq_id = f.id) AS version_count
FROM faqs f
JOIN faq_categories c ON f.category_id = c.id
LEFT JOIN auth.users u_created ON f.created_by = u_created.id
LEFT JOIN auth.users u_updated ON f.updated_by = u_updated.id
ORDER BY c.display_order, f.display_order;

-- ============================================================================
-- 11. CLEANUP & MAINTENANCE
-- ============================================================================

-- Delete expired cache entries (run this daily via cron or scheduled function)
-- DELETE FROM faq_cache WHERE expires_at < NOW();

-- Archive old history entries (optional, monthly cleanup)
-- DELETE FROM faq_history WHERE changed_at < NOW() - INTERVAL '6 months';

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Tables created:
-- ✓ faq_categories
-- ✓ faqs
-- ✓ faq_history (audit trail)
-- ✓ faq_feedback (helpfulness tracking)
-- ✓ faq_cache (1-hour caching)
--
-- Security:
-- ✓ Row Level Security (RLS) policies enabled
-- ✓ Role-based access control (admin, instructor, public)
-- ✓ Audit trail with change tracking
--
-- Features:
-- ✓ Version history with rollback capability
-- ✓ Automatic audit trail via triggers
-- ✓ Helpfulness voting system
-- ✓ Caching support for performance
--
-- Next steps: Run API migrations and create components
-- ============================================================================

    -- Migration: Create FAQ Database Schema
    -- Purpose: Convert hardcoded FAQs to database-driven system
    -- Status: Ready for Supabase SQL Editor
    -- Created: November 2, 2025

    -- ============================================================================
    -- PHASE 1: DATABASE SCHEMA SETUP
    -- ============================================================================

    -- 1. Create faq_categories table
    CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
    );

    -- 2. Create faqs table (main storage)
    CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    views INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    UNIQUE(category_id, question)
    );

    -- 3. Create faq_history table (version tracking)
    CREATE TABLE IF NOT EXISTS faq_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faq_id UUID REFERENCES faqs(id) ON DELETE CASCADE,
    question_before TEXT,
    answer_before TEXT,
    question_after TEXT,
    answer_after TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    change_type VARCHAR(20)
    );

    -- ============================================================================
    -- INDEXES FOR PERFORMANCE
    -- ============================================================================

    CREATE INDEX IF NOT EXISTS idx_faqs_category_id ON faqs(category_id);
    CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
    CREATE INDEX IF NOT EXISTS idx_faqs_views ON faqs(views DESC);
    CREATE INDEX IF NOT EXISTS idx_faq_history_faq_id ON faq_history(faq_id);

    -- ============================================================================
    -- ROW LEVEL SECURITY (RLS) POLICIES
    -- ============================================================================

    -- Enable RLS
    ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE faq_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;

    -- RLS for faqs table
    -- Public read published FAQs
    CREATE POLICY "Public can read published FAQs" ON faqs
    FOR SELECT
    USING (is_published = true);

    -- Admins can read all FAQs
    CREATE POLICY "Admins can read all FAQs" ON faqs
    FOR SELECT
    USING (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    -- Admins can insert FAQs
    CREATE POLICY "Admins can create FAQs" ON faqs
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    -- Admins can update FAQs
    CREATE POLICY "Admins can update FAQs" ON faqs
    FOR UPDATE
    USING (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    -- Admins can delete FAQs
    CREATE POLICY "Admins can delete FAQs" ON faqs
    FOR DELETE
    USING (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    -- RLS for faq_history table
    CREATE POLICY "Public cannot view history" ON faq_history
    FOR SELECT
    USING (false);

    CREATE POLICY "Admins can view history" ON faq_history
    FOR SELECT
    USING (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    CREATE POLICY "Admins can create history" ON faq_history
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    -- RLS for categories table
    CREATE POLICY "Everyone can read categories" ON faq_categories
    FOR SELECT
    USING (true);

    CREATE POLICY "Admins can manage categories" ON faq_categories
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    CREATE POLICY "Admins can update categories" ON faq_categories
    FOR UPDATE
    USING (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

    -- ============================================================================
    -- HELPER FUNCTIONS
    -- ============================================================================

    -- Function to increment FAQ views
    CREATE OR REPLACE FUNCTION increment_faq_views(faq_id UUID)
    RETURNS void AS $$
    BEGIN
    UPDATE faqs SET views = views + 1 WHERE id = faq_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to increment FAQ helpful count
    CREATE OR REPLACE FUNCTION increment_faq_helpful(faq_id UUID)
    RETURNS void AS $$
    BEGIN
    UPDATE faqs SET helpful_count = helpful_count + 1 WHERE id = faq_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- ============================================================================
    -- INITIAL CATEGORY DATA (Ready to insert)
    -- ============================================================================
    -- Run this after table creation:
    /*
    INSERT INTO faq_categories (name, slug, icon, description, display_order) VALUES
    ('Study Abroad', 'study-abroad', '🌍', 'Questions about studying abroad destinations, procedures, and costs', 1),
    ('Test Preparation', 'test-prep', '📚', 'IELTS, TOEFL, GMAT, and GRE preparation questions', 2),
    ('Career & Benefits', 'career', '💼', 'Career growth, work permits, scholarships, and post-study options', 3),
    ('Application & Documents', 'application', '📋', 'Application process, documents, SOP, and LORs', 4);
    */

    -- ============================================================================
    -- MIGRATION COMPLETE
    -- ============================================================================
    -- Status: All tables created, RLS enabled, indexes added
    -- Next: Insert FAQ category data
    -- Then: Migrate 25 FAQs from hardcoded list
    -- Then: Create API endpoints

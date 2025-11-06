-- Migration: Create FAQ Database Schema (FIXED VERSION)
-- Purpose: Convert hardcoded FAQs to database-driven system
-- Status: Simplified - removes complex RLS that may fail
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
-- MIGRATION COMPLETE
-- ============================================================================
-- Status: Tables created with indexes
-- Skipped: RLS policies (can be added later)
-- Skipped: Helper functions (can be added later)
-- Next: Run 002_seed_faqs.sql to insert data

-- Migration: Add published column to tests table
-- This allows tests to be in draft/unpublished state
-- Existing tests default to published=true to maintain current visibility

-- Add published column if it doesn't exist
ALTER TABLE IF EXISTS tests 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN tests.published IS 'Whether the test is published and visible to students. Unpublished tests are drafts only visible to instructors and admins.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tests_published ON tests(published);

-- Migration: Add published column to courses table
-- This allows courses to be in draft/unpublished state
-- Existing courses default to published=true to maintain current visibility

-- Add published column if it doesn't exist
ALTER TABLE IF EXISTS courses 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN courses.published IS 'Whether the course is published and visible to students. Unpublished courses are drafts only visible to instructors and admins.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published);

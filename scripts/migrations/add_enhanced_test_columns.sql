-- Migration: Add enhanced test columns to tests table
-- This adds the columns needed for Practice Tests and Final Tests functionality

-- Add new columns to tests table
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'assessment' CHECK (type IN ('practice', 'final', 'assessment', 'quiz')),
ADD COLUMN IF NOT EXISTS is_time_limited BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 80 CHECK (passing_score >= 0 AND passing_score <= 100),
ADD COLUMN IF NOT EXISTS max_attempts INTEGER CHECK (max_attempts > 0),
ADD COLUMN IF NOT EXISTS show_results BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS course_title TEXT;

-- Add index for better performance when querying by type
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);

-- Add index for course queries
CREATE INDEX IF NOT EXISTS idx_tests_course_id ON tests(course_id);

-- Update existing tests to have default values
UPDATE tests SET 
  type = 'assessment',
  is_time_limited = true,
  passing_score = 80,
  show_results = true,
  allow_review = true
WHERE type IS NULL;

-- Add comment to table
COMMENT ON TABLE tests IS 'Enhanced tests table supporting Practice Tests, Final Tests, Assessments, and Quizzes with timing and attempt limitations';

-- Add comments to new columns
COMMENT ON COLUMN tests.type IS 'Type of test: practice, final, assessment, or quiz';
COMMENT ON COLUMN tests.is_time_limited IS 'Whether the test has a time limit';
COMMENT ON COLUMN tests.passing_score IS 'Minimum score required to pass (0-100)';
COMMENT ON COLUMN tests.max_attempts IS 'Maximum number of attempts allowed (null = unlimited)';
COMMENT ON COLUMN tests.show_results IS 'Whether to show results to students after completion';
COMMENT ON COLUMN tests.allow_review IS 'Whether students can review their answers after submission';
COMMENT ON COLUMN tests.course_title IS 'Cached course title for display purposes';
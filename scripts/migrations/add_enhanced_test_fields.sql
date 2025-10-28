-- Migration to add enhanced test fields for Practice Tests and Final Tests
-- This adds support for test types, timing controls, attempt limits, and result configurations

-- Add new columns to the tests table
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'quiz',
ADD COLUMN IF NOT EXISTS is_time_limited BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER,
ADD COLUMN IF NOT EXISTS show_results BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT true;

-- Add a check constraint for test type
ALTER TABLE tests 
ADD CONSTRAINT tests_type_check 
CHECK (type IN ('practice', 'final', 'assessment', 'quiz'));

-- Add a check constraint for passing score (0-100)
ALTER TABLE tests 
ADD CONSTRAINT tests_passing_score_check 
CHECK (passing_score >= 0 AND passing_score <= 100);

-- Add a check constraint for max attempts (positive integer)
ALTER TABLE tests 
ADD CONSTRAINT tests_max_attempts_check 
CHECK (max_attempts > 0);

-- Update existing tests to have proper type based on course association
-- Tests without course_id are likely standalone practice tests
UPDATE tests 
SET type = CASE 
    WHEN course_id IS NULL THEN 'practice'
    ELSE 'assessment'
END
WHERE type = 'quiz';

-- Create an index on test type for faster filtering
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);

-- Create an index on course_id and type for efficient queries
CREATE INDEX IF NOT EXISTS idx_tests_course_type ON tests(course_id, type);

-- Update test_attempts table to support new test types (if needed)
-- Note: The test_attempts table should already work with the enhanced system
-- as it references tests by ID

COMMENT ON COLUMN tests.type IS 'Type of test: practice (standalone practice), final (course final exam), assessment (course quiz/assignment), quiz (legacy type)';
COMMENT ON COLUMN tests.is_time_limited IS 'Whether the test has a time limit';
COMMENT ON COLUMN tests.passing_score IS 'Minimum percentage score required to pass (0-100)';
COMMENT ON COLUMN tests.max_attempts IS 'Maximum number of attempts allowed per student (null = unlimited)';
COMMENT ON COLUMN tests.show_results IS 'Whether to show results immediately after completion';
COMMENT ON COLUMN tests.allow_review IS 'Whether students can review their answers after completion';
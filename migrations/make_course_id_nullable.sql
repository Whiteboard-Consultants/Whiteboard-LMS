-- Migration to make course_id nullable in tests table
-- This allows tests to be created without associating them to a course

ALTER TABLE tests 
ALTER COLUMN course_id DROP NOT NULL;

-- Add comment explaining the nullable field
COMMENT ON COLUMN tests.course_id IS 'Optional course association. NULL means test is not tied to a specific course.';

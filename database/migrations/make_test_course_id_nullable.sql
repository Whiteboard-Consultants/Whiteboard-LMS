-- Migration: Make course_id nullable in tests table
-- Purpose: Allow tests to be created without being linked to a course
-- This enables tests to be purchased separately or as part of course enrollment

BEGIN;

-- Alter the tests table to make course_id nullable
ALTER TABLE public.tests 
ALTER COLUMN course_id DROP NOT NULL;

-- Drop and recreate the foreign key constraint to allow NULL values
ALTER TABLE public.tests
DROP CONSTRAINT IF EXISTS tests_course_id_fkey;

ALTER TABLE public.tests
ADD CONSTRAINT tests_course_id_fkey 
  FOREIGN KEY (course_id) 
  REFERENCES public.courses(id) 
  ON DELETE SET NULL;

-- Add comment to document the new behavior
COMMENT ON COLUMN public.tests.course_id IS 'Optional: Link test to a course. If set, enrolled students get free access. If NULL, test must be purchased separately.';

COMMIT;

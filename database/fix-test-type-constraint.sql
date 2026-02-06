-- Fix: Ensure type column has correct CHECK constraint for all valid values
-- This fixes the "tests_type_check" constraint error

-- Drop existing constraint if it exists
ALTER TABLE public.tests DROP CONSTRAINT IF EXISTS tests_type_check;

-- Add proper constraint with all valid values
ALTER TABLE public.tests ADD CONSTRAINT tests_type_check CHECK (type IN ('practice', 'final', 'assessment', 'quiz', 'mock'));

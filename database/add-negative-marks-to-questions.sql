-- ============================================================================
-- Add negative_marks column to test_questions table
-- ============================================================================
-- This column stores the penalty for incorrect answers in MCQ questions

-- Check if column exists, if not add it
ALTER TABLE public.test_questions
ADD COLUMN IF NOT EXISTS negative_marks DECIMAL(5,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.test_questions.negative_marks IS 'Penalty marks deducted for incorrect answers in MCQ (enter as positive number, e.g., 0.5 for -0.5 marks)';

-- Ensure all existing records have a default value
UPDATE public.test_questions 
SET negative_marks = 0 
WHERE negative_marks IS NULL;

-- Add constraint to ensure negative_marks is non-negative
ALTER TABLE public.test_questions
ADD CONSTRAINT check_negative_marks_non_negative CHECK (negative_marks >= 0);

-- Create index for queries filtering by negative_marks (optional for performance)
CREATE INDEX IF NOT EXISTS idx_test_questions_negative_marks ON public.test_questions(negative_marks);

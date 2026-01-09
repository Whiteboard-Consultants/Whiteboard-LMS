-- Migration: Add grading columns to quiz_attempts table
-- Purpose: Support instructor grading and feedback for descriptive questions
-- Created: 2026-01-09

-- Add columns to quiz_attempts table
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS grading_status TEXT CHECK (grading_status IN ('pending', 'reviewed', 'graded')) DEFAULT 'pending';
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS instructor_feedback TEXT;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS instructor_score INTEGER;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_grading_status ON public.quiz_attempts(grading_status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_graded_by ON public.quiz_attempts(graded_by);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id_status ON public.quiz_attempts(user_id, grading_status);

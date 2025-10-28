-- Fix questions table column name issue
-- Run this in Supabase SQL Editor

-- First, check if the table exists and what columns it has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'questions'
ORDER BY ordinal_position;

-- Drop the table if it exists with wrong structure
DROP TABLE IF EXISTS public.questions CASCADE;

-- Recreate the table with the correct structure
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
    options JSONB, -- For multiple choice questions
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    question_order INTEGER DEFAULT 0,  -- Using question_order instead of sort_order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_questions_test_id ON public.questions(test_id);
CREATE INDEX idx_questions_order ON public.questions(question_order);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Instructors can manage questions for their tests" ON public.questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tests t 
            WHERE t.id = questions.test_id 
            AND t.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Students can view questions for enrolled tests" ON public.questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tests t
            JOIN public.courses c ON t.course_id = c.id
            JOIN public.enrollments e ON c.id = e.course_id
            WHERE t.id = questions.test_id 
            AND e.user_id = auth.uid()
            AND e.status = 'approved'
        )
    );

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'questions'
ORDER BY ordinal_position;
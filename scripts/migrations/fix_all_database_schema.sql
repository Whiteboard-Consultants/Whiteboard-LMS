-- Comprehensive database migration to fix all schema issues
-- This migration addresses:
-- 1. Missing columns in tests table (duration, allow_review, etc.)
-- 2. Missing columns in test_attempts table (lesson_id, status)
-- 3. Creates proper quiz_attempts table for lesson quizzes

-- First, let's check and fix the tests table
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Add duration column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'duration'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN duration INTEGER DEFAULT 30;
    END IF;
    
    -- Add type column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'type'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN type VARCHAR(20) DEFAULT 'assessment' CHECK (type IN ('practice', 'final', 'assessment', 'quiz'));
    END IF;
    
    -- Add is_time_limited column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'is_time_limited'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN is_time_limited BOOLEAN DEFAULT true;
    END IF;
    
    -- Add passing_score column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'passing_score'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN passing_score INTEGER DEFAULT 80 CHECK (passing_score >= 0 AND passing_score <= 100);
    END IF;
    
    -- Add max_attempts column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'max_attempts'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN max_attempts INTEGER CHECK (max_attempts > 0);
    END IF;
    
    -- Add show_results column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'show_results'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN show_results BOOLEAN DEFAULT true;
    END IF;
    
    -- Add allow_review column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'allow_review'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN allow_review BOOLEAN DEFAULT true;
    END IF;
    
    -- Add course_title column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'course_title'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN course_title TEXT;
    END IF;
    
    -- Add question_count column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'tests' AND column_name = 'question_count'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE tests ADD COLUMN question_count INTEGER DEFAULT 0;
    END IF;
END
$$;

-- Now let's check and fix the test_attempts table
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Add lesson_id column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'test_attempts' AND column_name = 'lesson_id'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE test_attempts ADD COLUMN lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
    
    -- Add status column if it doesn't exist
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'test_attempts' AND column_name = 'status'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE test_attempts ADD COLUMN status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted', 'graded'));
    END IF;
END
$$;

-- Create quiz_attempts table if it doesn't exist (for lesson quizzes)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    score NUMERIC(5,2) DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);

-- Create indexes for tests table if they don't exist
CREATE INDEX IF NOT EXISTS idx_tests_instructor_id ON tests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_tests_course_id ON tests(course_id);
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);

-- Enable Row Level Security on quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_attempts table

-- Users can see their own quiz attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own quiz attempts
CREATE POLICY "Users can create quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own quiz attempts
CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
    FOR UPDATE USING (user_id = auth.uid());

-- Instructors can view quiz attempts for lessons in their courses
CREATE POLICY "Instructors can view quiz attempts for their courses" ON quiz_attempts
    FOR SELECT USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            INNER JOIN courses c ON l.course_id = c.id
            WHERE c.instructor_id = auth.uid()
        )
    );

-- Admins can do everything with quiz attempts
CREATE POLICY "Admins can manage all quiz attempts" ON quiz_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Add comments to tables and columns
COMMENT ON TABLE quiz_attempts IS 'Quiz attempts for lesson quizzes (separate from test_attempts for standalone tests)';
COMMENT ON COLUMN quiz_attempts.answers IS 'JSON array of user answers and question data';
COMMENT ON COLUMN quiz_attempts.status IS 'Current status: in_progress, completed, or submitted';

-- Show final table structures
SELECT 'tests table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tests' 
ORDER BY ordinal_position;

SELECT 'test_attempts table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'test_attempts' 
ORDER BY ordinal_position;

SELECT 'quiz_attempts table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;
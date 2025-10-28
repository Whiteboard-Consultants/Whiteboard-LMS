-- Safe migration that handles existing quiz_attempts table
-- First, let's add missing columns to existing tables

-- Add missing columns to tests table 
ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 0;

-- Add missing status column to test_attempts table
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Add check constraint for test_attempts status
ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS test_attempts_status_check;
ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_status_check CHECK (status IN ('in_progress', 'completed', 'submitted', 'graded'));

-- Handle quiz_attempts table - add missing columns to existing table
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add check constraint for quiz_attempts status
ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_status_check;
ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_status_check CHECK (status IN ('in_progress', 'completed', 'submitted'));

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);

CREATE INDEX IF NOT EXISTS idx_tests_instructor_id ON tests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_tests_course_id ON tests(course_id);
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);

-- Enable RLS on quiz_attempts if not already enabled
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can create quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update their own quiz attempts" ON quiz_attempts;

-- Create RLS policies
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
    FOR UPDATE USING (user_id = auth.uid());

-- Show current quiz_attempts table structure
SELECT 'Current quiz_attempts table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' AND table_schema = 'public'
ORDER BY ordinal_position;
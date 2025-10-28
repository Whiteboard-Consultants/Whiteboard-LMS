-- Simple migration to add missing columns one by one
-- This avoids the complex DO blocks that might be causing issues

-- Add missing columns to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'assessment';
ALTER TABLE tests ADD COLUMN IF NOT EXISTS is_time_limited BOOLEAN DEFAULT true;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 80;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS max_attempts INTEGER;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS show_results BOOLEAN DEFAULT true;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT true;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS course_title TEXT;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 0;

-- Add check constraints
ALTER TABLE tests DROP CONSTRAINT IF EXISTS tests_type_check;
ALTER TABLE tests ADD CONSTRAINT tests_type_check CHECK (type IN ('practice', 'final', 'assessment', 'quiz'));

ALTER TABLE tests DROP CONSTRAINT IF EXISTS tests_passing_score_check;
ALTER TABLE tests ADD CONSTRAINT tests_passing_score_check CHECK (passing_score >= 0 AND passing_score <= 100);

ALTER TABLE tests DROP CONSTRAINT IF EXISTS tests_max_attempts_check;
ALTER TABLE tests ADD CONSTRAINT tests_max_attempts_check CHECK (max_attempts > 0);

-- Add missing columns to test_attempts table
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS lesson_id UUID;
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Add foreign key constraint for lesson_id (if lessons table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lessons') THEN
        -- Drop constraint if it exists, then add it
        ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS fk_test_attempts_lesson_id;
        ALTER TABLE test_attempts ADD CONSTRAINT fk_test_attempts_lesson_id 
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Add check constraint for status
ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS test_attempts_status_check;
ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_status_check CHECK (status IN ('in_progress', 'completed', 'submitted', 'graded'));

-- Create quiz_attempts table if it doesn't exist (for lesson quizzes)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL,
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

-- Add foreign key for quiz_attempts if lessons table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lessons') THEN
        -- Drop constraint if it exists, then add it
        ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS fk_quiz_attempts_lesson_id;
        ALTER TABLE quiz_attempts ADD CONSTRAINT fk_quiz_attempts_lesson_id 
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Create indexes
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
DROP POLICY IF EXISTS "Instructors can view quiz attempts for their courses" ON quiz_attempts;
DROP POLICY IF EXISTS "Admins can manage all quiz attempts" ON quiz_attempts;

-- Create RLS policies
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
    FOR UPDATE USING (user_id = auth.uid());

-- Show final table structures
SELECT 'tests table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tests' AND table_schema = 'public'
ORDER BY ordinal_position;
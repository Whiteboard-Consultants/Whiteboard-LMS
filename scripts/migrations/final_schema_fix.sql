-- Corrected migration based on actual database structure
-- The tests table already has most columns we need, just missing a few

-- Add missing columns to tests table (only the ones that don't exist)
ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 0;

-- The test_attempts table already has lesson_id as UUID, but missing status
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Add check constraint for status in test_attempts
ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS test_attempts_status_check;
ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_status_check CHECK (status IN ('in_progress', 'completed', 'submitted', 'graded'));

-- Create quiz_attempts table (using correct UUID types to match lessons.id)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);

CREATE INDEX IF NOT EXISTS idx_tests_instructor_id ON tests(instructor_id);
CREATE INDEX IF NOT EXISTS idx_tests_course_id ON tests(course_id);
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);

-- Enable RLS on quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Show what we added
SELECT 'Updated tests table - new columns:' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tests' 
AND column_name IN ('duration', 'question_count')
ORDER BY column_name;
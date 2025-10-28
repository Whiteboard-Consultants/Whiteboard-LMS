-- Create test_questions table if it doesn't exist
-- This table stores questions associated with tests

CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
    options JSONB DEFAULT '[]', -- For multiple choice options
    correct_answer TEXT, -- The correct answer or answer key
    explanation TEXT, -- Optional explanation for the answer
    points INTEGER DEFAULT 1 CHECK (points > 0),
    order_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_order ON test_questions(test_id, order_number);

-- Enable Row Level Security
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_questions table

-- Instructors can manage questions for their own tests
CREATE POLICY "Instructors can manage questions for their tests" ON test_questions
    FOR ALL USING (
        test_id IN (
            SELECT id FROM tests WHERE instructor_id = auth.uid()
        )
    );

-- Note: Admin policy commented out since user_roles table doesn't exist
-- CREATE POLICY "Admins can manage all test questions" ON test_questions
--     FOR ALL USING (auth.uid() IS NOT NULL);

-- Students can view questions for tests in their enrolled courses (during test taking)
CREATE POLICY "Students can view questions for enrolled course tests" ON test_questions
    FOR SELECT USING (
        test_id IN (
            SELECT t.id FROM tests t
            WHERE t.course_id IN (
                SELECT course_id 
                FROM enrollments 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Add comments
COMMENT ON TABLE test_questions IS 'Questions associated with tests for the enhanced testing system';
COMMENT ON COLUMN test_questions.question_type IS 'Type of question: multiple_choice, true_false, short_answer, or essay';
COMMENT ON COLUMN test_questions.options IS 'JSON array of multiple choice options';
COMMENT ON COLUMN test_questions.correct_answer IS 'The correct answer or answer key';
COMMENT ON COLUMN test_questions.points IS 'Points awarded for correct answer';
COMMENT ON COLUMN test_questions.order_number IS 'Display order of question in test';

-- Show the created table structure
SELECT 'test_questions table created with structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'test_questions' AND table_schema = 'public'
ORDER BY ordinal_position;
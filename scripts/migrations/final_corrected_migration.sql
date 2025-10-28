-- Final corrected migration based on actual table structures
-- Handle the lesson_id type mismatch in quiz_attempts

-- Add missing columns to tests table 
ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 0;

-- Add missing status column to test_attempts table
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Add check constraint for test_attempts status
ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS test_attempts_status_check;
ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_status_check CHECK (status IN ('in_progress', 'completed', 'submitted', 'graded'));

-- Handle quiz_attempts table - add missing columns
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0;

-- Add check constraint for quiz_attempts status
ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_status_check;
ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_status_check CHECK (status IN ('in_progress', 'completed', 'submitted'));

-- Fix the lesson_id type mismatch - convert text to uuid if possible
-- First, let's see if we can convert existing data
DO $$
DECLARE
    rec RECORD;
    has_data BOOLEAN := FALSE;
BEGIN
    -- Check if there's any data in quiz_attempts
    SELECT EXISTS(SELECT 1 FROM quiz_attempts LIMIT 1) INTO has_data;
    
    IF NOT has_data THEN
        -- No data, safe to change column type
        ALTER TABLE quiz_attempts ALTER COLUMN lesson_id TYPE UUID USING lesson_id::UUID;
    ELSE
        -- There is data, let's check if it can be converted to UUID
        BEGIN
            -- Try to convert existing lesson_id values to UUID format
            -- This will fail if any lesson_id is not a valid UUID
            FOR rec IN SELECT DISTINCT lesson_id FROM quiz_attempts WHERE lesson_id IS NOT NULL LOOP
                PERFORM rec.lesson_id::UUID;
            END LOOP;
            
            -- If we get here, all lesson_id values are valid UUIDs
            ALTER TABLE quiz_attempts ALTER COLUMN lesson_id TYPE UUID USING lesson_id::UUID;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- If conversion fails, we'll leave lesson_id as text and skip foreign key
                RAISE NOTICE 'Cannot convert lesson_id to UUID format, leaving as text. Foreign key constraint will be skipped.';
        END;
    END IF;
END
$$;

-- Try to add foreign key constraint only if lesson_id is now UUID
DO $$
DECLARE
    lesson_id_type TEXT;
BEGIN
    -- Get the current type of lesson_id column
    SELECT data_type INTO lesson_id_type
    FROM information_schema.columns 
    WHERE table_name = 'quiz_attempts' 
    AND column_name = 'lesson_id'
    AND table_schema = 'public';
    
    -- Only add foreign key if lesson_id is UUID type
    IF lesson_id_type = 'uuid' THEN
        ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS fk_quiz_attempts_lesson_id;
        ALTER TABLE quiz_attempts ADD CONSTRAINT fk_quiz_attempts_lesson_id 
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Skipping foreign key constraint due to type mismatch: lesson_id is %, lessons.id is uuid', lesson_id_type;
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

-- Create RLS policies
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
    FOR UPDATE USING (user_id = auth.uid());

-- Show final quiz_attempts table structure
SELECT 'Final quiz_attempts table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' AND table_schema = 'public'
ORDER BY ordinal_position;
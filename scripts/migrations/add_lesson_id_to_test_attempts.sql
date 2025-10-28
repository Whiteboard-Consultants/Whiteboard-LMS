-- Quick fix: Add missing lesson_id column to test_attempts table
-- This resolves the "Could not find the 'lesson_id' column" error

-- Add lesson_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'test_attempts' 
        AND column_name = 'lesson_id'
    ) THEN
        ALTER TABLE test_attempts ADD COLUMN lesson_id UUID;
    END IF;
END $$;

-- Add foreign key constraint to lessons table if it exists and constraint doesn't exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'test_attempts_lesson_id_fkey') THEN
            ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Create index for lesson_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_test_attempts_lesson_id ON test_attempts(lesson_id);

-- Add comment
COMMENT ON COLUMN test_attempts.lesson_id IS 'Reference to lesson for quiz attempts within lessons';
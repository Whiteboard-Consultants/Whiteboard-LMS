-- Create or update test_attempts table to ensure compatibility with current code
-- This resolves the "quiz_attempts not found" error

-- Check if test_attempts table exists, create it if it doesn't
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    test_id UUID,
    course_id UUID,
    lesson_id UUID,
    instructor_id UUID,
    enrollment_id UUID,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    total_marks INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    unattempted INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]'::jsonb,
    time_left INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key to users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'test_attempts_user_id_fkey') THEN
        ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key to tests table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tests') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'test_attempts_test_id_fkey') THEN
            ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_test_id_fkey 
            FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Add foreign key to courses table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'test_attempts_course_id_fkey') THEN
            ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Add foreign key to lessons table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'test_attempts_lesson_id_fkey') THEN
            ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Add foreign key to enrollments table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'test_attempts_enrollment_id_fkey') THEN
            ALTER TABLE test_attempts ADD CONSTRAINT test_attempts_enrollment_id_fkey 
            FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_course_id ON test_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_lesson_id ON test_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_enrollment_id ON test_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_test_attempts_submitted_at ON test_attempts(submitted_at);

-- Enable Row Level Security
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for test_attempts
-- Policy for users to read their own test attempts
DROP POLICY IF EXISTS "Users can view their own test attempts" ON test_attempts;
CREATE POLICY "Users can view their own test attempts"
    ON test_attempts FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to insert their own test attempts
DROP POLICY IF EXISTS "Users can insert their own test attempts" ON test_attempts;
CREATE POLICY "Users can insert their own test attempts"
    ON test_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own test attempts
DROP POLICY IF EXISTS "Users can update their own test attempts" ON test_attempts;
CREATE POLICY "Users can update their own test attempts"
    ON test_attempts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for instructors to view test attempts for their courses
DROP POLICY IF EXISTS "Instructors can view test attempts for their courses" ON test_attempts;
CREATE POLICY "Instructors can view test attempts for their courses"
    ON test_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = test_attempts.course_id 
            AND courses.instructor_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM tests 
            WHERE tests.id = test_attempts.test_id 
            AND tests.instructor_id = auth.uid()
        )
    );

-- Admin policy to view all test attempts
DROP POLICY IF EXISTS "Admins can view all test attempts" ON test_attempts;
CREATE POLICY "Admins can view all test attempts"
    ON test_attempts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Drop the old quiz_attempts table if it exists (this might be causing the confusion)
DROP TABLE IF EXISTS quiz_attempts CASCADE;

-- Add helpful comments
COMMENT ON TABLE test_attempts IS 'Stores test/quiz attempt data for students';
COMMENT ON COLUMN test_attempts.status IS 'Status of the attempt: in-progress, completed, or abandoned';
COMMENT ON COLUMN test_attempts.answers IS 'JSON array of student answers';
COMMENT ON COLUMN test_attempts.time_left IS 'Time remaining in seconds for timed tests';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON test_attempts TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
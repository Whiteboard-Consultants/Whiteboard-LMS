-- Create separate quiz_attempts table for lesson quizzes
-- This separates lesson quiz attempts from standalone test attempts

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL,
    course_id UUID NOT NULL,
    lesson_id TEXT NOT NULL,  -- Using TEXT since lesson IDs might be strings
    user_id UUID NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
DO $$ 
BEGIN
    -- Add foreign key to users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'quiz_attempts_user_id_fkey') THEN
        ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key to courses table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'quiz_attempts_course_id_fkey') THEN
            ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key to enrollments table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'quiz_attempts_enrollment_id_fkey') THEN
            ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_enrollment_id_fkey 
            FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment_id ON quiz_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_submitted_at ON quiz_attempts(submitted_at);

-- Enable Row Level Security
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quiz_attempts
-- Policy for users to read their own quiz attempts
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can view their own quiz attempts"
    ON quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to insert their own quiz attempts
DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can insert their own quiz attempts"
    ON quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own quiz attempts
DROP POLICY IF EXISTS "Users can update their own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can update their own quiz attempts"
    ON quiz_attempts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for instructors to view quiz attempts for their courses
DROP POLICY IF EXISTS "Instructors can view quiz attempts for their courses" ON quiz_attempts;
CREATE POLICY "Instructors can view quiz attempts for their courses"
    ON quiz_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = quiz_attempts.course_id 
            AND courses.instructor_id = auth.uid()
        )
    );

-- Admin policy to view all quiz attempts
DROP POLICY IF EXISTS "Admins can view all quiz attempts" ON quiz_attempts;
CREATE POLICY "Admins can view all quiz attempts"
    ON quiz_attempts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Add helpful comments
COMMENT ON TABLE quiz_attempts IS 'Stores quiz attempt data for lesson quizzes within courses';
COMMENT ON COLUMN quiz_attempts.lesson_id IS 'ID of the lesson containing the quiz';
COMMENT ON COLUMN quiz_attempts.answers IS 'JSON array of student answers (indices)';
COMMENT ON COLUMN quiz_attempts.questions IS 'JSON array of quiz questions for reference';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON quiz_attempts TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
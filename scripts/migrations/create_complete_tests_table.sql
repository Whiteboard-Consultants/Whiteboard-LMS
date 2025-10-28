-- Complete tests table creation/migration
-- This ensures all necessary columns exist

-- Drop and recreate tests table with complete structure
DROP TABLE IF EXISTS tests CASCADE;

CREATE TABLE tests (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 30, -- Duration in minutes
    instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    question_count INTEGER DEFAULT 0,
    type VARCHAR(20) DEFAULT 'assessment' CHECK (type IN ('practice', 'final', 'assessment', 'quiz')),
    is_time_limited BOOLEAN DEFAULT true,
    passing_score INTEGER DEFAULT 80 CHECK (passing_score >= 0 AND passing_score <= 100),
    max_attempts INTEGER CHECK (max_attempts > 0),
    show_results BOOLEAN DEFAULT true,
    allow_review BOOLEAN DEFAULT true,
    course_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tests_instructor_id ON tests(instructor_id);
CREATE INDEX idx_tests_course_id ON tests(course_id);
CREATE INDEX idx_tests_type ON tests(type);

-- Enable Row Level Security
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tests table

-- Instructors can see their own tests
CREATE POLICY "Instructors can view their own tests" ON tests
    FOR SELECT USING (instructor_id = auth.uid());

-- Instructors can create tests
CREATE POLICY "Instructors can create tests" ON tests
    FOR INSERT WITH CHECK (instructor_id = auth.uid());

-- Instructors can update their own tests
CREATE POLICY "Instructors can update their own tests" ON tests
    FOR UPDATE USING (instructor_id = auth.uid());

-- Instructors can delete their own tests
CREATE POLICY "Instructors can delete their own tests" ON tests
    FOR DELETE USING (instructor_id = auth.uid());

-- Admins can do everything with tests
CREATE POLICY "Admins can manage all tests" ON tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Students can view tests assigned to their courses (through enrollments)
CREATE POLICY "Students can view tests for their enrolled courses" ON tests
    FOR SELECT USING (
        course_id IN (
            SELECT course_id 
            FROM enrollments 
            WHERE user_id = auth.uid()
        )
    );

-- Add comment to table
COMMENT ON TABLE tests IS 'Tests table supporting Practice Tests, Final Tests, Assessments, and Quizzes with timing and attempt limitations';

-- Add comments to columns
COMMENT ON COLUMN tests.type IS 'Type of test: practice, final, assessment, or quiz';
COMMENT ON COLUMN tests.is_time_limited IS 'Whether the test has a time limit';
COMMENT ON COLUMN tests.duration IS 'Test duration in minutes';
COMMENT ON COLUMN tests.passing_score IS 'Minimum score required to pass (0-100)';
COMMENT ON COLUMN tests.max_attempts IS 'Maximum number of attempts allowed (null = unlimited)';
COMMENT ON COLUMN tests.show_results IS 'Whether to show results to students after completion';
COMMENT ON COLUMN tests.allow_review IS 'Whether students can review their answers after submission';
COMMENT ON COLUMN tests.course_title IS 'Cached course title for display purposes';
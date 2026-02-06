-- Migration: Create Test Series Support Tables
-- Purpose: Enable mock test series with dynamic topics and individual pricing
-- Date: 2026-01-24

-- ============================================================================
-- 1. Create test_series table (container for multiple tests by topic/difficulty)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.test_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    topic_area TEXT NOT NULL, -- e.g., "Campus Recruitment", "IELTS", "GMAT"
    instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_test_series_instructor_id ON public.test_series(instructor_id);
CREATE INDEX IF NOT EXISTS idx_test_series_topic_area ON public.test_series(topic_area);
CREATE INDEX IF NOT EXISTS idx_test_series_published ON public.test_series(is_published);

-- ============================================================================
-- 2. Alter tests table to add series support
-- ============================================================================
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.test_series(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS topic TEXT; -- e.g., "QA", "VA", "LRDI"
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Medium', 'Medium-Hard', 'Hard')) DEFAULT 'Medium';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS order_within_topic INTEGER;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS type TEXT; -- 'practice', 'final', 'assessment', 'quiz', 'mock'

-- Make course_id nullable since tests can exist in series without being part of a course
ALTER TABLE public.tests ALTER COLUMN course_id DROP NOT NULL;

-- Indexes for series-based queries
CREATE INDEX IF NOT EXISTS idx_tests_series_id ON public.tests(series_id);
CREATE INDEX IF NOT EXISTS idx_tests_topic ON public.tests(topic);
CREATE INDEX IF NOT EXISTS idx_tests_difficulty ON public.tests(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_tests_price ON public.tests(price);

-- ============================================================================
-- 3. Modify enrollments table to support test-specific enrollments
-- ============================================================================
-- Make course_id nullable to support test-only enrollments
ALTER TABLE public.enrollments ALTER COLUMN course_id DROP NOT NULL;

-- Add test_id column to enrollments
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE;

-- Add columns to track test-specific data
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS test_score DECIMAL(5,2);
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS test_attempts INTEGER DEFAULT 0;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS is_test_purchase BOOLEAN DEFAULT false;

-- Index for test enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_test_id ON public.enrollments(test_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_is_test_purchase ON public.enrollments(is_test_purchase);

-- ============================================================================
-- 4. Create test_attempt table for detailed test performance tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('in-progress', 'completed', 'abandoned')) DEFAULT 'in-progress',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5,2),
    total_marks INTEGER,
    correct_answers INTEGER,
    incorrect_answers INTEGER,
    unattempted INTEGER,
    time_spent INTEGER, -- in seconds
    answers JSONB, -- store all answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for test attempts
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON public.test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_test_attempts_enrollment_id ON public.test_attempts(enrollment_id);

-- ============================================================================
-- 5. Enable RLS for new tables
-- ============================================================================
ALTER TABLE public.test_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. Create RLS Policies
-- ============================================================================

-- Drop existing policies if they exist (PostgreSQL doesn't support IF NOT EXISTS on CREATE POLICY)
DROP POLICY IF EXISTS "Anyone can view published test series" ON public.test_series;
DROP POLICY IF EXISTS "Instructors can view their test series" ON public.test_series;
DROP POLICY IF EXISTS "Instructors can create test series" ON public.test_series;
DROP POLICY IF EXISTS "Instructors can update their test series" ON public.test_series;
DROP POLICY IF EXISTS "Users can view their test attempts" ON public.test_attempts;
DROP POLICY IF EXISTS "Instructors can view attempts on their tests" ON public.test_attempts;
DROP POLICY IF EXISTS "Users can create test attempts" ON public.test_attempts;
DROP POLICY IF EXISTS "Users can update their test attempts" ON public.test_attempts;

-- Test Series: Published series visible to all, instructors can manage their own
CREATE POLICY "Anyone can view published test series" ON public.test_series 
    FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can view their test series" ON public.test_series 
    FOR SELECT USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can create test series" ON public.test_series 
    FOR INSERT WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their test series" ON public.test_series 
    FOR UPDATE USING (auth.uid() = instructor_id);

-- Test Attempts: Users can see their own attempts, instructors can see student attempts
CREATE POLICY "Users can view their test attempts" ON public.test_attempts 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view attempts on their tests" ON public.test_attempts 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tests 
            WHERE tests.id = test_attempts.test_id 
            AND tests.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Users can create test attempts" ON public.test_attempts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their test attempts" ON public.test_attempts 
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. Seed data (optional test series for demo)
-- ============================================================================
-- Uncomment to seed initial data:
/*
INSERT INTO public.test_series (title, description, topic_area, instructor_id, is_published)
SELECT 
    'Campus Recruitment Training',
    'Complete mock test series for campus recruitment with QA, VA, and LRDI',
    'Campus Recruitment',
    (SELECT id FROM auth.users WHERE email LIKE '%instructor%' LIMIT 1),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.test_series WHERE title = 'Campus Recruitment Training'
);
*/

-- ============================================================================
-- 8. Add comment for documentation
-- ============================================================================
COMMENT ON TABLE public.test_series IS 'Container for organizing multiple tests by topic area and difficulty level';
COMMENT ON TABLE public.test_attempts IS 'Detailed tracking of student test attempts with answers and scores';
COMMENT ON COLUMN public.tests.series_id IS 'References the test series this test belongs to (null for standalone tests)';
COMMENT ON COLUMN public.tests.difficulty_level IS 'Difficulty level: Easy, Medium, Medium-Hard, Hard';
COMMENT ON COLUMN public.tests.price IS 'Individual test price for marketplace/purchase';
COMMENT ON COLUMN public.enrollments.test_id IS 'For test-specific enrollments (individual test purchases)';
COMMENT ON COLUMN public.enrollments.is_test_purchase IS 'Flag to distinguish test purchases from course enrollments';

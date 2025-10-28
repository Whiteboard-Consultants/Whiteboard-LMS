-- Ensure the enrollments table has all the required columns for the new enrollment system
-- Run this in your Supabase SQL Editor

-- Check existing columns first with:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'enrollments' ORDER BY ordinal_position;

-- Add missing columns if they don't exist
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_lessons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certificate_status TEXT DEFAULT 'not_eligible',
ADD COLUMN IF NOT EXISTS certificate_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS certificate_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS certificate_rejected_at TIMESTAMPTZ;

-- Update any existing columns that might need type changes
-- (Only run these if the columns exist but have different types)

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON enrollments(user_id, status);

-- Add constraints to ensure data integrity
-- Note: PostgreSQL doesn't support IF NOT EXISTS with ADD CONSTRAINT
-- If constraint already exists, these will fail safely

DO $$ 
BEGIN
    -- Add enrollments_status_check constraint
    BEGIN
        ALTER TABLE enrollments 
        ADD CONSTRAINT enrollments_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add enrollments_payment_status_check constraint
    BEGIN
        ALTER TABLE enrollments 
        ADD CONSTRAINT enrollments_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'free', 'failed'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add enrollments_certificate_status_check constraint
    BEGIN
        ALTER TABLE enrollments 
        ADD CONSTRAINT enrollments_certificate_status_check 
        CHECK (certificate_status IN ('not_eligible', 'eligible', 'requested', 'approved', 'rejected'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Create test_attempts table for assessment results (Supabase migration)
CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    answers INTEGER[] NOT NULL DEFAULT '{}',
    answer_details JSONB NOT NULL DEFAULT '[]',
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_taken INTEGER, -- in seconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance on test_attempts
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_course_id ON test_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_enrollment_id ON test_attempts(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_submitted_at ON test_attempts(submitted_at);

-- First, let's check for duplicate enrollments
-- Uncomment the following to see duplicates before cleanup:
-- SELECT user_id, course_id, COUNT(*) as enrollment_count, 
--        array_agg(id ORDER BY enrolled_at DESC NULLS LAST) as enrollment_ids
-- FROM enrollments 
-- GROUP BY user_id, course_id 
-- HAVING COUNT(*) > 1;

-- Add constraints for test_attempts and enrollments
DO $$ 
BEGIN
    -- Add test_attempts_percentage_check constraint
    BEGIN
        ALTER TABLE test_attempts 
        ADD CONSTRAINT test_attempts_percentage_check 
        CHECK (percentage >= 0 AND percentage <= 100);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Add test_attempts_score_check constraint
    BEGIN
        ALTER TABLE test_attempts 
        ADD CONSTRAINT test_attempts_score_check 
        CHECK (score >= 0 AND score <= total_questions);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Clean up duplicate enrollments before adding unique constraint
    -- Keep the most recent enrollment for each user-course combination
    BEGIN
        DELETE FROM enrollments e1
        WHERE e1.id NOT IN (
            SELECT DISTINCT ON (user_id, course_id) id
            FROM enrollments e2
            ORDER BY user_id, course_id, enrolled_at DESC NULLS LAST
        );
    EXCEPTION
        WHEN OTHERS THEN 
            RAISE NOTICE 'Could not clean up duplicate enrollments: %', SQLERRM;
    END;

    -- Add unique constraint to prevent duplicate enrollments
    BEGIN
        ALTER TABLE enrollments 
        ADD CONSTRAINT unique_user_course_enrollment 
        UNIQUE (user_id, course_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN unique_violation THEN 
            RAISE NOTICE 'Duplicate enrollments still exist. Manual cleanup may be required.';
    END;
END $$;

-- Note: If you encounter any errors, it might be because:
-- 1. The columns already exist
-- 2. There's existing data that conflicts with the constraints
-- 3. The table structure is different than expected

-- You can check the current table structure with:
-- \d enrollments
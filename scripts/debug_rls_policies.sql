-- Temporary debugging: Make RLS policy more permissive to test access
-- This will help us understand if the issue is with the RLS policy or something else

-- Drop the existing policy
DROP POLICY IF EXISTS "Instructors can manage questions for their tests" ON test_questions;

-- Create a more permissive policy for debugging
CREATE POLICY "Debug: Instructors can manage questions for their tests" ON test_questions
    FOR ALL USING (
        -- For debugging, let's also log what auth.uid() returns
        EXISTS (
            SELECT 1 FROM tests 
            WHERE tests.id = test_questions.test_id 
            AND tests.instructor_id = auth.uid()
        )
    );

-- Add a temporary policy to allow reading all questions for debugging
CREATE POLICY "Debug: Allow reading all questions" ON test_questions
    FOR SELECT USING (true);

-- Show current auth context for debugging
SELECT 
    'Current auth context:' as info,
    auth.uid() as current_user_id,
    current_user as db_user;

-- Show test_questions and their associated tests
SELECT 
    'Test questions with test info:' as info;
    
SELECT 
    tq.id as question_id,
    tq.test_id,
    tq.question_text,
    t.title as test_title,
    t.instructor_id,
    auth.uid() as current_auth_uid,
    (t.instructor_id = auth.uid()) as instructor_match
FROM test_questions tq
LEFT JOIN tests t ON tq.test_id = t.id
ORDER BY tq.created_at DESC
LIMIT 10;
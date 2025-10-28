-- Temporarily disable RLS to test if that's the issue
ALTER TABLE test_questions DISABLE ROW LEVEL SECURITY;

-- Check if questions exist
SELECT 
    'All test questions (RLS disabled):' as info,
    COUNT(*) as total_questions
FROM test_questions;

SELECT 
    id,
    test_id,
    question_text,
    created_at
FROM test_questions
ORDER BY created_at DESC
LIMIT 5;
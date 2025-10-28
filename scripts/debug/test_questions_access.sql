-- Simple test to verify test_questions table access
-- Run this to check if the table is accessible and what permissions exist

-- Check if test_questions table exists and is accessible
SELECT COUNT(*) as total_questions FROM test_questions;

-- Check the structure again
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'test_questions' 
AND table_schema = 'public';

-- Try to insert a simple test record (you can delete it after)
INSERT INTO test_questions (test_id, question_text, question_type, order_number) 
VALUES ('2d2bef0d-277d-4423-8d46-026f54de866d', 'Test question', 'multiple_choice', 1)
RETURNING id;
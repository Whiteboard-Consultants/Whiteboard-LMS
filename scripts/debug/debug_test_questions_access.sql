-- Debug test_questions access and RLS policies
-- Run this to check what's happening with the query

-- First, check if the question exists (as admin/service role)
SELECT COUNT(*) as total_questions FROM test_questions;

-- Check the specific question we created
SELECT * FROM test_questions WHERE test_id = '2d2bef0d-277d-4423-8d46-026f54de866d';

-- Check RLS policies on test_questions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'test_questions';

-- Try to query as if we're the authenticated user (this might be blocked by RLS)
-- Note: This may not work in SQL editor since it doesn't have the auth context
SET role authenticated;
SELECT * FROM test_questions WHERE test_id = '2d2bef0d-277d-4423-8d46-026f54de866d';
RESET role;
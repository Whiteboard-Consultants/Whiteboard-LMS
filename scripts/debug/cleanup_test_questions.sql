-- Clean up test data and check current state
DELETE FROM test_questions WHERE test_id = '2d2bef0d-277d-4423-8d46-026f54de866d';

-- Verify the table is now clean for this test
SELECT COUNT(*) as question_count FROM test_questions WHERE test_id = '2d2bef0d-277d-4423-8d46-026f54de866d';

-- Check all questions in the table
SELECT id, test_id, question_text, order_number FROM test_questions;
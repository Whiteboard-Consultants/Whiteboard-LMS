-- Check if series exists with the ID from logs
SELECT id, title, instructor_id FROM test_series WHERE id = '42b64874-5047-4f7b-8a5d-a0f164f46d66';

-- Show sample series that DO exist
SELECT id, title, instructor_id FROM test_series LIMIT 5;

-- Check if this ID exists as a test instead
SELECT id, title, series_id FROM tests WHERE id = '42b64874-5047-4f7b-8a5d-a0f164f46d66';

-- Check what's in the test_carts for this user
SELECT id, test_id, series_id, test_type FROM test_carts WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570';

-- Check current structure of test_attempts table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'test_attempts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also show a sample of data if any exists
SELECT * FROM test_attempts LIMIT 5;
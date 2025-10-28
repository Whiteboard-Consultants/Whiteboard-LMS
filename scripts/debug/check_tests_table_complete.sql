-- Check the complete structure of the tests table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'tests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'tests'
);

-- Show sample data if any exists
SELECT COUNT(*) as row_count FROM tests;
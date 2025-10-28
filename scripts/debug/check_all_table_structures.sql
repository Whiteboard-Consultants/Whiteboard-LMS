-- Check the structure of all relevant tables
SELECT 'lessons table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'tests table structure:' as info;
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

SELECT 'test_attempts table structure:' as info;
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

SELECT 'quiz_attempts table structure (if exists):' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what tables exist
SELECT 'All tables in public schema:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
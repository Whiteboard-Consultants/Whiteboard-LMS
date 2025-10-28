-- Check Current Posts Table Structure
-- Run this first to see what columns already exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there are any existing posts
SELECT 
    'Existing posts count:' as info,
    count(*) as count
FROM public.posts;

-- Show sample of existing data structure
SELECT 
    id,
    title,
    CASE 
        WHEN LENGTH(content) > 100 THEN LEFT(content, 100) || '...'
        ELSE content
    END as content_preview,
    created_at
FROM public.posts 
LIMIT 3;
-- Quick Diagnostic Queries
-- Run these to understand what's in your database

-- Test 1: Do the tables exist?
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('faq_categories', 'faqs', 'faq_history')
ORDER BY table_name;

-- Test 2: What columns does the faqs table have?
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'faqs'
ORDER BY ordinal_position;

-- Test 3: Does the views column exist?
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'faqs' AND column_name = 'views';

-- Test 4: How many indexes exist on faqs table?
SELECT indexname FROM pg_indexes 
WHERE tablename = 'faqs';

-- Test 5: Any data in the tables?
SELECT 'categories' as table_name, COUNT(*) as row_count FROM faq_categories
UNION ALL
SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL
SELECT 'history', COUNT(*) FROM faq_history;

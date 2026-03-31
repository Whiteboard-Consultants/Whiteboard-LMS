-- Migration: Set all existing courses and tests as published
-- This ensures backward compatibility - existing courses and tests remain visible

-- Update all courses to published = true
-- This preserves the current behavior where all courses are visible to the public
UPDATE courses 
SET published = true 
WHERE published IS NULL OR published = false;

-- Log migration info
SELECT 
  'Courses migrated to published state' as migration_info,
  COUNT(*) as total_courses
FROM courses;

-- Update all tests to published = true
-- This preserves the current behavior where all tests are visible to the public
UPDATE tests 
SET published = true 
WHERE published IS NULL OR published = false;

-- Log migration info
SELECT 
  'Tests migrated to published state' as migration_info,
  COUNT(*) as total_tests
FROM tests;

-- Verify migration results
SELECT 
  'Courses' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN published = true THEN 1 ELSE 0 END) as published_count,
  SUM(CASE WHEN published = false THEN 1 ELSE 0 END) as draft_count
FROM courses
UNION ALL
SELECT 
  'Tests' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN published = true THEN 1 ELSE 0 END) as published_count,
  SUM(CASE WHEN published = false THEN 1 ELSE 0 END) as draft_count
FROM tests;

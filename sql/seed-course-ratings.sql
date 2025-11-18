-- Seed default ratings for courses
-- This script adds realistic review counts and ratings to courses
-- Updated: November 18, 2025

-- Rating Distribution:
-- Language Skills Courses: 55-80 reviews @ 4.6-4.9 rating
-- Test Prep Courses (popular): 35-40 reviews @ 4.7-4.9 rating
-- Test Prep Courses (mid-tier): 25-35 reviews @ 4.6-4.8 rating
-- Career Development: 15-25 reviews @ 4.5-4.7 rating

-- Update courses with default ratings based on category
UPDATE courses
SET 
  rating_count = CASE
    -- Language Skills Courses (highest engagement) - 55-80 reviews
    WHEN title ILIKE '%grammar%' OR category = 'Language Skills' THEN 68
    WHEN title ILIKE '%english%' AND category = 'Language Skills' THEN 75
    WHEN title ILIKE '%spoken%' AND category = 'Language Skills' THEN 62
    
    -- Popular Test Prep Courses - 35-40 reviews
    WHEN title ILIKE '%IELTS%' OR title ILIKE '%ielts%' THEN 38
    WHEN title ILIKE '%GRE%' OR title ILIKE '%gre%' THEN 35
    WHEN title ILIKE '%SAT%' OR title ILIKE '%sat%' THEN 32
    
    -- Mid-tier Test Prep - 25-35 reviews
    WHEN title ILIKE '%TOEFL%' OR title ILIKE '%toefl%' THEN 32
    WHEN title ILIKE '%GMAT%' OR title ILIKE '%gmat%' THEN 29
    
    -- Career Development - 15-25 reviews
    WHEN category = 'Career Development' THEN 20
    
    -- Default for others
    ELSE 18
  END,
  
  rating = CASE
    -- Language Skills Courses - Higher ratings (4.8-4.9)
    WHEN title ILIKE '%grammar%' OR category = 'Language Skills' THEN 4.8
    WHEN title ILIKE '%english%' AND category = 'Language Skills' THEN 4.9
    WHEN title ILIKE '%spoken%' AND category = 'Language Skills' THEN 4.7
    
    -- Popular Test Prep - 4.7-4.9
    WHEN title ILIKE '%IELTS%' OR title ILIKE '%ielts%' THEN 4.8
    WHEN title ILIKE '%GRE%' OR title ILIKE '%gre%' THEN 4.8
    WHEN title ILIKE '%SAT%' OR title ILIKE '%sat%' THEN 4.7
    
    -- Mid-tier Test Prep - 4.6-4.8
    WHEN title ILIKE '%TOEFL%' OR title ILIKE '%toefl%' THEN 4.7
    WHEN title ILIKE '%GMAT%' OR title ILIKE '%gmat%' THEN 4.9
    
    -- Career Development - 4.5-4.7
    WHEN category = 'Career Development' THEN 4.6
    
    -- Default
    ELSE 4.5
  END,
  
  total_rating = rating_count * rating
  
WHERE rating_count = 0 OR rating_count IS NULL;

-- Log the changes
SELECT 
  title,
  category,
  rating_count,
  rating,
  total_rating,
  student_count
FROM courses
ORDER BY category, title;

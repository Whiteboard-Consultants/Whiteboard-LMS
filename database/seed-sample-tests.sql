-- Seed sample test series and tests for campus recruitment/mock tests
-- Run this to populate the database with buyable tests

-- Step 0: First, list available users to find an instructor or use any user
-- SELECT id, email FROM auth.users LIMIT 5;

-- Step 1: Create a test series for Campus Recruitment
-- Uses the first available user as instructor (fallback if no instructor role exists)
INSERT INTO public.test_series (title, description, topic_area, instructor_id, is_published, price, is_purchasable, discount_percentage)
SELECT 
  'Campus Recruitment Full Mock Series',
  'Complete mock test series for campus recruitment with Quantitative Aptitude, Verbal Ability, and Logical Reasoning',
  'Campus Recruitment',
  COALESCE(
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)  -- Fallback to any user if no instructor exists
  ),
  true,
  588.00,
  true,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM public.test_series WHERE title = 'Campus Recruitment Full Mock Series'
);

-- Step 2: Get the just-created series ID and instructor ID
WITH series_data AS (
  SELECT id FROM public.test_series WHERE title = 'Campus Recruitment Full Mock Series' LIMIT 1
),
instructor_data AS (
  SELECT COALESCE(
    (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1)
  ) as id
)
-- Step 3: Create individual tests under this series
INSERT INTO public.tests (
  title, description, series_id, topic, difficulty_level, 
  price, is_free, order_within_topic, type, instructor_id, 
  is_published, duration, total_marks, pass_marks
)
SELECT 
  'Quantitative Aptitude - Mock 1', 
  'Mock test for quantitative aptitude with focus on fundamental concepts',
  sd.id,
  'Quantitative Aptitude',
  'Medium',
  199.00,
  false,
  1,
  'mock',
  id_data.id,
  true,
  90,
  100,
  70
FROM series_data sd, instructor_data id_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.tests WHERE title = 'Quantitative Aptitude - Mock 1' AND series_id = sd.id
);

INSERT INTO public.tests (
  title, description, series_id, topic, difficulty_level, 
  price, is_free, order_within_topic, type, instructor_id, 
  is_published, duration, total_marks, pass_marks
)
SELECT 
  'Verbal Ability - Mock 1', 
  'Mock test for verbal ability including reading comprehension and vocabulary',
  sd.id,
  'Verbal Ability',
  'Medium',
  199.00,
  false,
  1,
  'mock',
  id_data.id,
  true,
  60,
  100,
  70
FROM (SELECT id FROM public.test_series WHERE title = 'Campus Recruitment Full Mock Series' LIMIT 1) sd,
     (SELECT COALESCE((SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1), (SELECT id FROM auth.users LIMIT 1)) as id) id_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.tests WHERE title = 'Verbal Ability - Mock 1' AND series_id = sd.id
);

INSERT INTO public.tests (
  title, description, series_id, topic, difficulty_level, 
  price, is_free, order_within_topic, type, instructor_id, 
  is_published, duration, total_marks, pass_marks
)
SELECT 
  'Logical Reasoning - Mock 1', 
  'Mock test for logical reasoning with various types of puzzles and arrangements',
  sd.id,
  'Logical Reasoning',
  'Medium',
  199.00,
  false,
  1,
  'mock',
  id_data.id,
  true,
  75,
  100,
  70
FROM (SELECT id FROM public.test_series WHERE title = 'Campus Recruitment Full Mock Series' LIMIT 1) sd,
     (SELECT COALESCE((SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1), (SELECT id FROM auth.users LIMIT 1)) as id) id_data
WHERE NOT EXISTS (
  SELECT 1 FROM public.tests WHERE title = 'Logical Reasoning - Mock 1' AND series_id = sd.id
);

-- Step 5: Verify the data was created
SELECT 
  'Created test series:' as info,
  t.title,
  t.price,
  t.is_publishable,
  (SELECT COUNT(*) FROM public.tests WHERE series_id = t.id) as test_count
FROM public.test_series t
WHERE title = 'Campus Recruitment Full Mock Series';

SELECT 
  'Created tests:' as info,
  t.title,
  t.price,
  t.topic,
  t.difficulty_level
FROM public.tests t
WHERE series_id = (
  SELECT id FROM public.test_series WHERE title = 'Campus Recruitment Full Mock Series' LIMIT 1
)
ORDER BY t.order_within_topic;

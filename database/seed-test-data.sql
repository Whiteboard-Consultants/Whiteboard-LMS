-- ============================================================================
-- WhitedgeLMS - Sample Data Seed Script
-- ============================================================================
-- This script creates test data for development and demonstration.
-- Run this in Supabase SQL Editor after the database is set up.
--
-- IMPORTANT: Update the user IDs below with actual user IDs from your auth.users table
-- ============================================================================

-- Step 1: Get the current user IDs
-- First, check what users exist:
-- SELECT id, email FROM auth.users;
-- Copy the IDs and replace below

-- Step 2: Create Test Courses (replace instructor_id with actual ID)
-- You can find your instructor ID by running: SELECT id FROM auth.users WHERE email LIKE '%instructor%' OR email LIKE '%admin%';

INSERT INTO courses (
  title, 
  description, 
  category, 
  level, 
  price, 
  original_price, 
  instructor_id, 
  duration_weeks,
  image_url,
  created_at, 
  updated_at
) VALUES 
(
  'Web Development Fundamentals',
  'Master the fundamentals of web development including HTML, CSS, JavaScript, and responsive design. Perfect for beginners looking to start their web development journey.',
  'technology',
  'beginner',
  1999,
  2999,
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1),
  8,
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  NOW(),
  NOW()
),
(
  'Advanced React Patterns',
  'Deep dive into advanced React patterns, hooks, state management, and performance optimization. Ideal for developers with React experience.',
  'technology',
  'advanced',
  2999,
  3999,
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1),
  10,
  'https://images.unsplash.com/photo-1633356713697-4be7e4dd7313?w=400',
  NOW(),
  NOW()
),
(
  'Digital Marketing Essentials',
  'Learn the core concepts of digital marketing including SEO, social media, email marketing, and analytics.',
  'marketing',
  'beginner',
  1499,
  2299,
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1),
  6,
  'https://images.unsplash.com/photo-1460925895917-adf4198f5e28?w=400',
  NOW(),
  NOW()
),
(
  'Python for Data Science',
  'Learn Python programming with a focus on data science libraries like Pandas, NumPy, and Matplotlib.',
  'technology',
  'intermediate',
  2499,
  3499,
  (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'instructor' LIMIT 1),
  12,
  'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a83f?w=400',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Step 3: Get course IDs for enrollment
WITH course_ids AS (
  SELECT id FROM courses 
  WHERE title IN ('Web Development Fundamentals', 'Advanced React Patterns', 'Digital Marketing Essentials')
  ORDER BY created_at DESC 
  LIMIT 3
),
student_id AS (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'student' 
  OR email ILIKE '%navnit%'
  LIMIT 1
),
instructor_id AS (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'instructor' 
  LIMIT 1
)
-- Step 4: Create Enrollments (enroll student in all test courses)
INSERT INTO enrollments (
  user_id,
  course_id,
  instructor_id,
  status,
  progress,
  completed,
  payment_status,
  enrolled_at,
  enrolled_original_price,
  enrolled_price,
  created_at,
  updated_at
)
SELECT 
  s.id as user_id,
  c.id as course_id,
  i.id as instructor_id,
  'active' as status,
  0 as progress,
  false as completed,
  'paid' as payment_status,
  NOW() as enrolled_at,
  c.original_price as enrolled_original_price,
  c.price as enrolled_price,
  NOW() as created_at,
  NOW() as updated_at
FROM course_ids c
CROSS JOIN student_id s
CROSS JOIN instructor_id i
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Step 5: Create Sample Message Threads (optional - for messaging demo)
WITH enrollment_data AS (
  SELECT 
    e.id as enrollment_id,
    e.user_id as student_id,
    e.course_id,
    e.instructor_id
  FROM enrollments e
  LIMIT 3
)
INSERT INTO message_threads (
  course_id,
  enrollment_id,
  student_id,
  instructor_id,
  title,
  description,
  is_closed,
  created_at,
  updated_at
)
SELECT
  ed.course_id,
  ed.enrollment_id,
  ed.student_id,
  ed.instructor_id,
  'Question about Module 1',
  'I have a doubt about the concepts covered in the first module. Can you clarify?',
  false,
  NOW(),
  NOW()
FROM enrollment_data ed
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify the data was created correctly:

-- Check courses created:
-- SELECT id, title, price, instructor_id FROM courses WHERE title IN (
--   'Web Development Fundamentals',
--   'Advanced React Patterns', 
--   'Digital Marketing Essentials',
--   'Python for Data Science'
-- );

-- Check enrollments:
-- SELECT e.id, u.email as student_email, c.title as course_title, e.status, e.payment_status
-- FROM enrollments e
-- JOIN auth.users u ON e.user_id = u.id
-- JOIN courses c ON e.course_id = c.id
-- ORDER BY e.created_at DESC;

-- Check message threads:
-- SELECT t.id, c.title as course_title, u.email as student_email, t.title as thread_title
-- FROM message_threads t
-- JOIN courses c ON t.course_id = c.id
-- JOIN auth.users u ON t.student_id = u.id
-- ORDER BY t.created_at DESC;

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. Make sure you have at least one instructor user created before running this
-- 2. The student user should be the one logged in (you can check the email in the dashboard)
-- 3. If you want to use different users, replace the subqueries with specific UUIDs
-- 4. All timestamps are set to NOW() - adjust as needed for testing
-- 5. This script uses ON CONFLICT DO NOTHING to prevent duplicate errors if run multiple times

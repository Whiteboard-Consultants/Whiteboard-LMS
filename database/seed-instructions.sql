-- ============================================================================
-- AUTO SEED: Create Test Data (No Manual ID Replacement Needed!)
-- ============================================================================
-- This script will automatically:
-- 1. Find the student user (Navnit)
-- 2. Find an instructor user
-- 3. Create a course
-- 4. Enroll the student
-- 5. Create a message thread
--
-- Just copy and paste this entire script into Supabase SQL Editor - no changes needed!
-- ============================================================================

-- Create a test course
WITH instructor AS (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'instructor'
  LIMIT 1
)
INSERT INTO public.courses (
  title,
  description,
  category,
  level,
  price,
  original_price,
  instructor_id,
  duration,
  type,
  has_certificate,
  created_at
) SELECT
  'Introduction to Web Development',
  'Learn HTML, CSS, and JavaScript from scratch. This beginner-friendly course covers all the fundamentals you need to start building websites.',
  'technology',
  'Beginner',
  1999,
  2999,
  instructor.id,
  '8 weeks',
  'paid',
  true,
  NOW()
FROM instructor;

-- Enroll the student in the course
WITH student AS (
  SELECT id FROM auth.users 
  WHERE email ILIKE '%navnit%' OR raw_user_meta_data->>'full_name' ILIKE '%navnit%'
  LIMIT 1
),
course AS (
  SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1
),
instructor AS (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'instructor'
  LIMIT 1
)
INSERT INTO public.enrollments (
  user_id,
  course_id,
  instructor_id,
  status,
  progress,
  completed,
  enrolled_at
) SELECT
  student.id,
  course.id,
  instructor.id,
  'approved',
  0,
  false,
  NOW()
FROM student, course, instructor;

-- Create a sample message thread
WITH student AS (
  SELECT id FROM auth.users 
  WHERE email ILIKE '%navnit%' OR raw_user_meta_data->>'full_name' ILIKE '%navnit%'
  LIMIT 1
),
course AS (
  SELECT id FROM courses WHERE title = 'Introduction to Web Development' LIMIT 1
),
enrollment AS (
  SELECT id FROM enrollments WHERE course_id = (SELECT id FROM course) LIMIT 1
),
instructor AS (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'instructor'
  LIMIT 1
)
INSERT INTO public.message_threads (
  course_id,
  enrollment_id,
  student_id,
  instructor_id,
  title,
  description,
  is_closed,
  created_at
) SELECT
  course.id,
  enrollment.id,
  student.id,
  instructor.id,
  'Question about CSS Flexbox',
  'I am having trouble understanding CSS Flexbox. Can you explain the difference between justify-content and align-items?',
  false,
  NOW()
FROM course, enrollment, student, instructor;

-- Add a sample message to the thread
WITH message_thread AS (
  SELECT id FROM message_threads WHERE title = 'Question about CSS Flexbox' LIMIT 1
),
student AS (
  SELECT id FROM auth.users 
  WHERE email ILIKE '%navnit%' OR raw_user_meta_data->>'full_name' ILIKE '%navnit%'
  LIMIT 1
)
INSERT INTO public.messages (
  thread_id,
  sender_id,
  body,
  is_read,
  created_at
) SELECT
  message_thread.id,
  student.id,
  'Hi instructor, I was working through the CSS module and got stuck on the Flexbox section. The concepts of justify-content and align-items seem similar to me. When should I use each one?',
  false,
  NOW()
FROM message_thread, student;

-- ============================================================================
-- Verify data was created
-- ============================================================================

-- Check if course was created:
SELECT id, title, price FROM courses WHERE title = 'Introduction to Web Development';

-- Check if enrollment was created:
SELECT e.id, u.email, c.title, e.status 
FROM enrollments e
JOIN auth.users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE c.title = 'Introduction to Web Development';

-- Check if message thread was created:
SELECT t.id, t.title, t.description
FROM message_threads t
WHERE t.title = 'Question about CSS Flexbox';

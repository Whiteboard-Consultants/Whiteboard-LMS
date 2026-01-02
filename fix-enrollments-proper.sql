-- STEP 1: Delete all bad enrollments (where user doesn't exist)
DELETE FROM enrollments WHERE user_id NOT IN (SELECT id FROM users);

-- STEP 2: Get real student IDs and create valid enrollments
-- This version gets actual student IDs from the users table
WITH real_students AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as student_num
  FROM users
  WHERE role = 'student'
  LIMIT 3  -- Get up to 3 students
),
real_courses AS (
  SELECT id, instructor_id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as course_num
  FROM courses
  LIMIT 4  -- Get up to 4 courses
)
INSERT INTO public.enrollments (
  user_id,
  course_id,
  instructor_id,
  progress,
  completed,
  payment_status,
  enrolled_at
)
-- Mix and match real students with real courses
SELECT 
  s.id as user_id,
  c.id as course_id,
  c.instructor_id,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY s.id, c.id) % 3 = 0 THEN 100
       WHEN ROW_NUMBER() OVER (ORDER BY s.id, c.id) % 3 = 1 THEN 50
       ELSE 0 END as progress,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY s.id, c.id) % 3 = 0 THEN true ELSE false END as completed,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY s.id, c.id) % 2 = 0 THEN 'paid' ELSE 'free' END as payment_status,
  NOW() - (ROW_NUMBER() OVER (ORDER BY s.id, c.id) || ' days')::INTERVAL as enrolled_at
FROM real_students s
CROSS JOIN real_courses c
LIMIT 8
ON CONFLICT (user_id, course_id) DO NOTHING;

-- STEP 3: Verify the result
SELECT 
  e.id,
  u.name as student_name,
  c.title as course_title,
  e.progress,
  e.completed,
  e.payment_status,
  e.enrolled_at
FROM enrollments e
JOIN users u ON u.id = e.user_id
JOIN courses c ON c.id = e.course_id
ORDER BY e.enrolled_at DESC
LIMIT 10;

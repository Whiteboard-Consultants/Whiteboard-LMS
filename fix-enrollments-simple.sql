-- STEP 1: First, let's see what we're working with
SELECT COUNT(*) as total_enrollments, 
       COUNT(DISTINCT user_id) as unique_users,
       COUNT(*) FILTER (WHERE user_id IN (SELECT id FROM users)) as valid_enrollments
FROM enrollments;

-- STEP 2: Delete ALL enrollments (they're all test data anyway)
TRUNCATE TABLE enrollments CASCADE;

-- STEP 3: Get the first 3 student IDs (real students from the system)
WITH student_ids AS (
  SELECT id FROM users WHERE role = 'student' LIMIT 3
),
-- Get the first 4 course IDs
course_ids AS (
  SELECT id, instructor_id FROM courses LIMIT 4
)
-- Create 8 enrollments by pairing students with courses
INSERT INTO enrollments (user_id, course_id, instructor_id, progress, completed, payment_status, enrolled_at)
SELECT 
  (ARRAY(SELECT id FROM student_ids))[((row_num - 1) % 3) + 1] as user_id,
  c.id as course_id,
  c.instructor_id,
  CASE 
    WHEN row_num % 3 = 1 THEN 100
    WHEN row_num % 3 = 2 THEN 50
    ELSE 0
  END as progress,
  CASE WHEN row_num % 3 = 1 THEN true ELSE false END as completed,
  CASE WHEN row_num % 2 = 0 THEN 'paid' ELSE 'free' END as payment_status,
  NOW() - (row_num || ' days')::INTERVAL as enrolled_at
FROM (
  SELECT generate_series(1, 8) as row_num
) nums
CROSS JOIN (SELECT id, instructor_id FROM courses LIMIT 4) c
ON CONFLICT (user_id, course_id) DO NOTHING;

-- STEP 4: Verify the new enrollments
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
ORDER BY e.enrolled_at DESC;

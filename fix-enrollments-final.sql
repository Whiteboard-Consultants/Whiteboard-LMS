-- ABSOLUTE FINAL FIX: Delete all bad enrollments and create fresh ones
-- Step 1: Remove all existing enrollments (start clean)
DELETE FROM enrollments;

-- Step 2: Verify we have students and courses
-- Check how many students exist
SELECT COUNT(*) as student_count FROM users WHERE role = 'student';

-- Check how many courses exist  
SELECT COUNT(*) as course_count FROM courses;

-- Step 3: Get actual student and course IDs and create enrollments
INSERT INTO enrollments (user_id, course_id, instructor_id, progress, completed, payment_status, enrolled_at)
WITH student_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as student_num
  FROM users 
  WHERE role = 'student'
  LIMIT 3
),
course_ids AS (
  SELECT id, instructor_id, ROW_NUMBER() OVER (ORDER BY id) as course_num
  FROM courses
  LIMIT 4
),
combinations AS (
  SELECT 
    s.id as student_id,
    c.id as course_id,
    c.instructor_id,
    ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id) as row_num
  FROM student_ids s
  CROSS JOIN course_ids c
)
SELECT
  student_id,
  course_id,
  instructor_id,
  CASE WHEN row_num = 1 THEN 100 WHEN row_num = 2 THEN 50 ELSE 0 END,
  CASE WHEN row_num = 1 THEN true ELSE false END,
  CASE WHEN row_num % 2 = 0 THEN 'paid' ELSE 'free' END,
  NOW() - (row_num || ' days')::INTERVAL
FROM combinations
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Step 4: Verify with explicit column check
SELECT 
  e.id as enrollment_id,
  e.user_id,
  u.name as student_name,
  u.id as users_table_id,
  e.course_id,
  c.title as course_title,
  c.id as courses_table_id,
  e.progress,
  e.completed,
  e.payment_status,
  e.enrolled_at
FROM enrollments e
INNER JOIN users u ON u.id = e.user_id AND u.role = 'student'
INNER JOIN courses c ON c.id = e.course_id
ORDER BY u.name, e.enrolled_at DESC;

-- Step 5: Final check - count valid enrollments
SELECT 
  COUNT(*) as total_enrollments,
  COUNT(DISTINCT user_id) as unique_students,
  COUNT(DISTINCT course_id) as unique_courses
FROM enrollments e
WHERE EXISTS (SELECT 1 FROM users WHERE id = e.user_id AND role = 'student')
AND EXISTS (SELECT 1 FROM courses WHERE id = e.course_id);

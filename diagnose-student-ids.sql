-- DIAGNOSTIC QUERY: What are the actual student user IDs?
SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM users 
WHERE role = 'student'
ORDER BY created_at
LIMIT 5;

-- Check enrollments and their user references
SELECT 
  e.id as enrollment_id,
  e.user_id as enrollment_user_id,
  e.course_id,
  u.id as actual_user_id,
  u.name as user_name,
  u.role as user_role,
  CASE WHEN u.id IS NULL THEN 'INVALID - USER NOT FOUND' ELSE 'VALID' END as validation
FROM enrollments e
LEFT JOIN users u ON u.id = e.user_id
ORDER BY e.enrolled_at DESC
LIMIT 12;

-- Count valid vs invalid enrollments
SELECT 
  COUNT(*) as total_enrollments,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_enrollments,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as invalid_enrollments
FROM enrollments e
LEFT JOIN users u ON u.id = e.user_id;

-- Check what the student_ids CTE would actually return
WITH student_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as student_num
  FROM users 
  WHERE role = 'student'
  LIMIT 3
)
SELECT 
  student_num,
  id as student_id,
  (SELECT name FROM users WHERE id = student_ids.id) as student_name
FROM student_ids;

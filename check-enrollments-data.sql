-- Check if there are enrollments in the database

-- Count total enrollments
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- Show sample enrollments
SELECT 
  id,
  user_id,
  course_id,
  payment_status,
  progress,
  created_at,
  enrolled_at
FROM enrollments
LIMIT 20;

-- Check if we can join enrollments with users and courses
SELECT 
  e.id as enrollment_id,
  u.id as user_id,
  u.name as student_name,
  c.id as course_id,
  c.title as course_title,
  e.progress,
  e.payment_status
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
LIMIT 20;

-- Check user count
SELECT COUNT(*) as total_users FROM users;

-- Check course count  
SELECT COUNT(*) as total_courses FROM courses;

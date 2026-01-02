-- Diagnostic queries to check if data exists in the database

-- Check if courses exist
SELECT COUNT(*) as course_count FROM courses;

-- Check if users exist  
SELECT COUNT(*) as user_count FROM users;

-- Check if enrollments exist
SELECT COUNT(*) as enrollment_count FROM enrollments;

-- Check enrollments with user and course details
SELECT 
  e.id as enrollment_id,
  e.user_id,
  e.course_id,
  e.payment_status,
  e.progress,
  c.title as course_title,
  u.name as student_name,
  u.email as student_email
FROM enrollments e
LEFT JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON e.user_id = u.id
LIMIT 20;

-- Check courses with instructor details
SELECT 
  c.id,
  c.title,
  c.instructor_id,
  u.name as instructor_name,
  c.student_count,
  c.price
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id
LIMIT 20;

-- Check specific user to see if instructor names exist
SELECT id, name, email, role FROM users WHERE role = 'instructor' LIMIT 5;

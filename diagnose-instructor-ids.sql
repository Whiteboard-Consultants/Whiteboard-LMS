-- Diagnostic queries to check instructor data

-- Check what instructor_ids are in the courses table
SELECT 
  id,
  title,
  instructor_id
FROM courses
LIMIT 10;

-- Check if those instructor_ids exist in the users table and what their names are
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  COUNT(c.id) as course_count
FROM users u
LEFT JOIN courses c ON u.id = c.instructor_id
WHERE u.role = 'instructor'
GROUP BY u.id, u.name, u.email, u.role;

-- Check for mismatches - courses with instructor_ids that don't exist in users
SELECT 
  c.id,
  c.title,
  c.instructor_id,
  u.id as user_exists
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id
WHERE c.instructor_id IS NOT NULL
LIMIT 10;

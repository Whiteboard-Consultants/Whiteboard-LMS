-- FINAL FIX: Create enrollments with VALID user IDs directly from users table
-- Delete all existing enrollments first
TRUNCATE TABLE enrollments CASCADE;

-- Insert enrollments linking real students to real courses
INSERT INTO enrollments (user_id, course_id, instructor_id, progress, completed, payment_status, enrolled_at)
SELECT 
  u.id as user_id,
  c.id as course_id,
  c.instructor_id,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY c.id) = 1 THEN 100
    WHEN ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY c.id) = 2 THEN 50
    ELSE 0
  END as progress,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY c.id) = 1 THEN true
    ELSE false
  END as completed,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY c.id) % 2 = 0 THEN 'paid'
    ELSE 'free'
  END as payment_status,
  NOW() - (ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY c.id) || ' days')::INTERVAL as enrolled_at
FROM (
  -- Get the first 3 students (real users with role='student')
  SELECT id FROM users WHERE role = 'student' LIMIT 3
) u
CROSS JOIN (
  -- Get the first 4 courses
  SELECT id, instructor_id FROM courses LIMIT 4
) c
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Verify the enrollments were created correctly with VALID references
SELECT 
  e.id,
  u.name as student_name,
  u.id as user_id_in_db,
  c.title as course_title,
  c.id as course_id_in_db,
  e.progress,
  e.completed,
  e.payment_status,
  e.enrolled_at
FROM enrollments e
JOIN users u ON u.id = e.user_id
JOIN courses c ON c.id = e.course_id
ORDER BY u.name, e.enrolled_at DESC;

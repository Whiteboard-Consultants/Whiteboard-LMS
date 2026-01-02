-- Delete any bad enrollments first
DELETE FROM enrollments WHERE user_id NOT IN (SELECT id FROM users);

-- Create sample enrollments for testing the General Reports page
-- This will link students to courses

-- Get course IDs and student IDs for use in inserts
WITH courses_list AS (
  SELECT id, instructor_id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM courses
  LIMIT 3
),
students AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM users
  WHERE role = 'student'
  LIMIT 2
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
SELECT 
  user_id,
  course_id,
  instructor_id,
  progress,
  completed,
  payment_status,
  enrolled_at
FROM (
  -- Student 1 enrollments
  SELECT (SELECT id FROM students WHERE rn = 1) as user_id, (SELECT id FROM courses_list WHERE rn = 1) as course_id, (SELECT instructor_id FROM courses_list WHERE rn = 1) as instructor_id, 45 as progress, false as completed, 'paid' as payment_status, NOW() - INTERVAL '30 days' as enrolled_at
  UNION ALL
  SELECT (SELECT id FROM students WHERE rn = 1), (SELECT id FROM courses_list WHERE rn = 2), (SELECT instructor_id FROM courses_list WHERE rn = 2), 80, true, 'paid', NOW() - INTERVAL '20 days'
  UNION ALL
  -- Student 2 enrollments
  SELECT (SELECT id FROM students WHERE rn = 2), (SELECT id FROM courses_list WHERE rn = 1), (SELECT instructor_id FROM courses_list WHERE rn = 1), 30, false, 'paid', NOW() - INTERVAL '25 days'
  UNION ALL
  SELECT (SELECT id FROM students WHERE rn = 2), (SELECT id FROM courses_list WHERE rn = 3), (SELECT instructor_id FROM courses_list WHERE rn = 3), 100, true, 'paid', NOW() - INTERVAL '10 days'
) data
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Verify the enrollments were created
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- Check the enrollments with student and course details
SELECT 
  e.id,
  u.name as student_name,
  c.title as course_title,
  e.progress,
  e.completed,
  e.payment_status
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.enrolled_at DESC;

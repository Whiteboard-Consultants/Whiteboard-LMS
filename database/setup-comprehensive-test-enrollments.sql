-- COMPREHENSIVE TEST DATA SETUP
-- Creates realistic test enrollments across multiple courses and instructors
-- This should be run ONCE in production to establish test scenarios

-- 1. Get all courses and their instructors
-- (This query helps us see what we're working with)
SELECT 'Available courses for testing:' as info;
SELECT 
  id, 
  name, 
  instructor_id,
  price,
  CASE WHEN price IS NULL OR price = 0 THEN 'FREE' ELSE 'PAID' END as type
FROM courses 
LIMIT 20;

-- 2. Create test enrollments for the test student (734137fc-18c8-4b29-8503-c1075f92d570)
-- Enroll them in multiple courses with different statuses
INSERT INTO enrollments (
    user_id,
    course_id,
    instructor_id,
    student_name,
    course_title,
    course_price,
    instructor_name,
    progress,
    completed_lessons,
    status,
    enrolled_at,
    certificate_status,
    average_score
) 
WITH courses_to_enroll AS (
  SELECT 
    id, 
    name, 
    instructor_id, 
    price,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM courses
  WHERE instructor_id IS NOT NULL
  LIMIT 3  -- Enroll in first 3 courses
)
SELECT
    '734137fc-18c8-4b29-8503-c1075f92d570'::uuid,
    cte.id,
    cte.instructor_id,
    'Navnit Daniel Alley',
    cte.name,
    COALESCE(cte.price, 0),
    (SELECT name FROM users u WHERE u.id = cte.instructor_id LIMIT 1),
    CASE WHEN cte.rn = 1 THEN 45 WHEN cte.rn = 2 THEN 75 ELSE 25 END,  -- Varying progress
    ARRAY[]::uuid[],
    CASE WHEN cte.rn = 1 THEN 'approved' WHEN cte.rn = 2 THEN 'approved' ELSE 'pending' END,  -- Mix of statuses
    NOW() - INTERVAL '14 days' + (cte.rn || ' days')::INTERVAL,
    CASE WHEN cte.rn = 1 THEN 'requested' ELSE 'not_eligible' END,
    CASE WHEN cte.rn = 1 THEN 78.5 WHEN cte.rn = 2 THEN 82.0 ELSE NULL END
FROM courses_to_enroll cte
ON CONFLICT DO NOTHING;

-- 3. Verify enrollments were created
SELECT 'Test student enrollments created:' as info;
SELECT 
  e.id,
  c.name as course_name,
  u.name as instructor_name,
  e.status,
  e.progress,
  e.enrolled_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON c.instructor_id = u.id
WHERE e.user_id = '734137fc-18c8-4b29-8503-c1075f92d570'
ORDER BY e.enrolled_at DESC;

-- 4. Show what the instructor would see in reports (only 'approved' status)
SELECT 'What instructor sees in reports (approved enrollments only):' as info;
SELECT 
  c.id as course_id,
  c.name as course_name,
  COUNT(e.id) as enrolled_students,
  COUNT(CASE WHEN e.status = 'approved' THEN 1 END) as approved_students
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name
HAVING COUNT(e.id) > 0
ORDER BY enrolled_students DESC;

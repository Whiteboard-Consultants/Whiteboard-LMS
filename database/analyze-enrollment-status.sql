-- Comprehensive enrollment status analysis
-- This will help us understand the enrollment situation across all students and instructors

-- 1. Count enrollments by status
SELECT 'Enrollments by status:' as info;
SELECT status, COUNT(*) as count FROM enrollments GROUP BY status ORDER BY count DESC;

-- 2. Count enrollments per instructor
SELECT 'Enrollments per instructor:' as info;
SELECT 
  c.instructor_id,
  u.name as instructor_name,
  COUNT(e.id) as total_enrollments,
  COUNT(CASE WHEN e.status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN e.status = 'pending' THEN 1 END) as pending_count
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON c.instructor_id = u.id
GROUP BY c.instructor_id, u.name
ORDER BY total_enrollments DESC;

-- 3. Check for orphaned enrollments (referencing non-existent courses)
SELECT 'Orphaned enrollments (course deleted):' as info;
SELECT COUNT(*) FROM enrollments e WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = e.course_id);

-- 4. Check courses with no enrollments
SELECT 'Courses with no enrollments:' as info;
SELECT 
  c.id,
  c.name,
  c.instructor_id,
  u.name as instructor_name,
  COUNT(e.id) as enrollment_count
FROM courses c
LEFT JOIN users u ON c.instructor_id = u.id
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name, c.instructor_id, u.name
HAVING COUNT(e.id) = 0
LIMIT 20;

-- 5. Check the specific instructor from the screenshot
SELECT 'Instructor 94388a0c-4b55-401e-85c6-02e67614ba1e details:' as info;
SELECT 
  c.id as course_id,
  c.name as course_name,
  COUNT(e.id) as total_enrollments,
  COUNT(CASE WHEN e.status = 'approved' THEN 1 END) as approved_enrollments,
  COUNT(CASE WHEN e.status = 'pending' THEN 1 END) as pending_enrollments
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE c.instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
GROUP BY c.id, c.name;

-- 6. Check test student's enrollments
SELECT 'Test student 734137fc-18c8-4b29-8503-c1075f92d570 enrollments:' as info;
SELECT 
  e.id,
  e.course_id,
  c.name as course_name,
  c.instructor_id,
  u.name as instructor_name,
  e.status,
  e.progress
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON c.instructor_id = u.id
WHERE e.user_id = '734137fc-18c8-4b29-8503-c1075f92d570';

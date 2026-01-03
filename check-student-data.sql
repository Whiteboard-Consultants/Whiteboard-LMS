-- Check student enrollments
SELECT 
  'Student ID: 734137fc-18c8-4b29-8503-c1075f92d570' as info,
  e.id as enrollment_id,
  e.course_id,
  e.status,
  e.enrolled_at,
  c.name as course_name,
  c.instructor_id
FROM enrollments e
LEFT JOIN courses c ON e.course_id = c.id
WHERE e.user_id = '734137fc-18c8-4b29-8503-c1075f92d570'
ORDER BY e.enrolled_at DESC;

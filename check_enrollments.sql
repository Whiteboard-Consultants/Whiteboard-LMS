-- Check all enrollments and their statuses
SELECT 
  e.id,
  e.user_id,
  u.name as student_name,
  e.course_id,
  c.title as course_title,
  e.status,
  e.created_at,
  e.enrolled_at,
  e.payment_id,
  e.instructor_id
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
ORDER BY e.created_at DESC
LIMIT 50;

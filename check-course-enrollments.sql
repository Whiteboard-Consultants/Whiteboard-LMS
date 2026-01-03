-- Check what enrollments exist for the course 2e16afb2-b718-4008-bfa7-81ddb3415b11
SELECT 
  e.id,
  e.course_id,
  e.user_id,
  e.status,
  e.student_name,
  e.enrolled_at,
  e.instructor_id,
  u.name as user_name,
  u.email
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
WHERE e.course_id = '2e16afb2-b718-4008-bfa7-81ddb3415b11'
ORDER BY e.created_at DESC;

-- Also check if there are ANY approved enrollments in the system
SELECT COUNT(*) as total_approved_enrollments
FROM enrollments
WHERE status = 'approved';

-- Check the course itself
SELECT id, title, instructor_id FROM courses WHERE id = '2e16afb2-b718-4008-bfa7-81ddb3415b11';

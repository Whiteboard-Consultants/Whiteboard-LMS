-- Check message threads for the current student
SELECT 
  mt.id,
  mt.title,
  mt.course_id,
  mt.instructor_id,
  mt.student_id,
  mt.status,
  mt.created_at,
  mt.updated_at
FROM message_threads mt
ORDER BY mt.updated_at DESC
LIMIT 10;

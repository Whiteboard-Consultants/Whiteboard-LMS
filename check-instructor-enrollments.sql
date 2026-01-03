-- Check enrollments for specific instructor
SELECT 
  c.id,
  c.name,
  c.instructor_id,
  COUNT(e.id) as student_count,
  COUNT(DISTINCT e.user_id) as unique_students
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE c.instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
GROUP BY c.id, c.name, c.instructor_id
ORDER BY c.name;

-- Check if any enrollments exist at all for this course
SELECT e.*, c.name as course_name, u.name as student_name
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON e.user_id = u.id
WHERE c.instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
LIMIT 20;

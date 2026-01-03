-- Check message threads for student
SELECT id, title, course_id, instructor_id, student_id, status, created_at FROM message_threads 
WHERE student_id = '734137fc-18c8-4b29-8503-c1075f92d570'
LIMIT 10;

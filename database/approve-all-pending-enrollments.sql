-- SYSTEMATIC FIX: Approve all pending enrollments
-- This allows instructors to see their students in reports and enables the full workflow

-- Step 1: Show current status
SELECT 'BEFORE - Enrollment status summary:' as step;
SELECT status, COUNT(*) as count FROM enrollments GROUP BY status ORDER BY count DESC;

-- Step 2: Show enrollments by instructor
SELECT 'BEFORE - Pending enrollments per instructor:' as step;
SELECT 
  c.instructor_id,
  u.name as instructor_name,
  COUNT(e.id) as pending_count,
  STRING_AGG(DISTINCT e.course_id::text, ', ') as course_ids
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON c.instructor_id = u.id
WHERE e.status = 'pending'
GROUP BY c.instructor_id, u.name
ORDER BY pending_count DESC;

-- Step 3: Approve all pending enrollments
UPDATE enrollments 
SET status = 'approved', enrolled_at = COALESCE(enrolled_at, NOW())
WHERE status = 'pending';

-- Step 4: Verify the update
SELECT 'AFTER - Enrollment status summary:' as step;
SELECT status, COUNT(*) as count FROM enrollments GROUP BY status ORDER BY count DESC;

-- Step 5: Show what instructors will now see
SELECT 'AFTER - Students per instructor (now visible in reports):' as step;
SELECT 
  c.instructor_id,
  u.name as instructor_name,
  COUNT(DISTINCT e.user_id) as student_count,
  COUNT(e.id) as enrollment_count
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON c.instructor_id = u.id
WHERE e.status = 'approved'
GROUP BY c.instructor_id, u.name
ORDER BY student_count DESC;

-- Step 6: Specific check for test instructor
SELECT 'Test instructor 94388a0c-4b55-401e-85c6-02e67614ba1e will now see:' as step;
SELECT 
  c.title as course_name,
  COUNT(e.id) as student_count,
  COUNT(CASE WHEN e.status = 'approved' THEN 1 END) as approved_count
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE c.instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
GROUP BY c.id, c.title;

-- Step 7: Specific check for test student
SELECT 'Test student 734137fc-18c8-4b29-8503-c1075f92d570 enrollments:' as step;
SELECT 
  c.title as course_name,
  u.name as instructor_name,
  e.status,
  e.progress
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON c.instructor_id = u.id
WHERE e.user_id = '734137fc-18c8-4b29-8503-c1075f92d570'
ORDER BY c.title;

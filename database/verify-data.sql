-- ============================================================================
-- Verify Test Data Was Created
-- ============================================================================

-- Check all courses:
SELECT id, title, price, instructor_id FROM courses LIMIT 5;

-- Check all enrollments:
SELECT id, user_id, course_id, status FROM enrollments LIMIT 5;

-- Check all message threads:
SELECT id, title, course_id, student_id FROM message_threads LIMIT 5;

-- Check all messages:
SELECT id, thread_id, sender_id, body FROM messages LIMIT 5;

-- Count totals:
SELECT 
  (SELECT COUNT(*) FROM courses) as total_courses,
  (SELECT COUNT(*) FROM enrollments) as total_enrollments,
  (SELECT COUNT(*) FROM message_threads) as total_threads,
  (SELECT COUNT(*) FROM messages) as total_messages;

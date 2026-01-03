-- ============================================================================
-- DEBUG & FIX: Enrollment Instructor ID Mismatch
-- ============================================================================
-- This script helps identify and fix enrollments where the instructor_id
-- in the enrollment doesn't match the course's instructor_id
-- ============================================================================

-- Step 1: Check the course that shows "no students"
-- Replace '2e16afb2-b718-4008-bfa7-81ddb3415b11' with your course ID from the URL
SELECT 
  c.id as course_id,
  c.title,
  c.instructor_id as course_instructor_id,
  cu.name as course_instructor_name
FROM public.courses c
LEFT JOIN public.users cu ON c.instructor_id = cu.id
WHERE c.id = '2e16afb2-b718-4008-bfa7-81ddb3415b11';

-- Step 2: Check enrollments for this course
SELECT 
  e.id as enrollment_id,
  e.user_id,
  u.name as student_name,
  e.course_id,
  e.instructor_id as enrollment_instructor_id,
  ei.name as enrollment_instructor_name,
  e.status,
  e.enrolled_at
FROM public.enrollments e
LEFT JOIN public.users u ON e.user_id = u.id
LEFT JOIN public.users ei ON e.instructor_id = ei.id
WHERE e.course_id = '2e16afb2-b718-4008-bfa7-81ddb3415b11';

-- Step 3: If there's a mismatch, update enrollments to use the course's instructor_id
-- This fixes enrollments where the instructor_id doesn't match the course instructor
UPDATE public.enrollments
SET instructor_id = (
  SELECT instructor_id FROM public.courses 
  WHERE courses.id = enrollments.course_id
)
WHERE course_id = '2e16afb2-b718-4008-bfa7-81ddb3415b11'
  AND instructor_id != (
    SELECT instructor_id FROM public.courses 
    WHERE courses.id = enrollments.course_id
  );

-- Step 4: Verify the fix worked
SELECT 
  e.id,
  e.user_id,
  u.name as student_name,
  e.status,
  e.instructor_id,
  c.instructor_id as course_instructor_id,
  (e.instructor_id = c.instructor_id) as instructor_match
FROM public.enrollments e
LEFT JOIN public.users u ON e.user_id = u.id
LEFT JOIN public.courses c ON e.course_id = c.id
WHERE e.course_id = '2e16afb2-b718-4008-bfa7-81ddb3415b11';

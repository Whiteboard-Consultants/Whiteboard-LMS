-- Create test enrollment for student 734137fc-18c8-4b29-8503-c1075f92d570
-- This student will enroll in a course taught by instructor 94388a0c-4b55-401e-85c6-02e67614ba1e

-- First, let's check what courses exist for the instructor
SELECT 
  'Courses for instructor 94388a0c-4b55-401e-85c6-02e67614ba1e:' as info;
SELECT id, name FROM courses WHERE instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e' LIMIT 5;

-- Create approved enrollment for the student in the first available instructor course
INSERT INTO enrollments (
    user_id,
    course_id,
    instructor_id,
    student_name,
    course_title,
    course_price,
    instructor_name,
    progress,
    completed_lessons,
    status,
    enrolled_at,
    certificate_status,
    average_score
) 
SELECT
    '734137fc-18c8-4b29-8503-c1075f92d570'::uuid,
    c.id,
    c.instructor_id,
    'Navnit Daniel Alley',
    c.name,
    c.price,
    'Navnit Alley',
    35,
    ARRAY[]::uuid[],
    'approved',
    NOW() - INTERVAL '5 days',
    'not_eligible',
    NULL
FROM courses c
WHERE c.instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verify the enrollment was created
SELECT 'Enrollment created:' as info;
SELECT e.id, e.user_id, e.course_id, c.name as course_name, e.status, e.progress
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.user_id = '734137fc-18c8-4b29-8503-c1075f92d570';

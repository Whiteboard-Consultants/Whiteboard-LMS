-- Create sample enrollments for test users
-- Run this in Supabase SQL Editor after setup-admin-test-users.sql

-- Create enrollments for the approved student
INSERT INTO public.enrollments (
    user_id,
    course_id,
    instructor_id,
    student_name,
    course_title,
    course_price,
    instructor_name,
    progress,
    status,
    enrolled_at
) VALUES 
(
    '55555555-5555-5555-5555-555555555555',  -- Approved Student
    (SELECT id FROM public.courses WHERE title = 'Sample IELTS Preparation Course' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Your instructor ID
    'Approved Student',
    'Sample IELTS Preparation Course',
    199.99,
    'Navnit Alley',
    75,
    'approved',
    NOW() - INTERVAL '10 days'
),
(
    '55555555-5555-5555-5555-555555555555',  -- Approved Student
    (SELECT id FROM public.courses WHERE title = 'Business Communication Skills' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Your instructor ID
    'Approved Student',
    'Business Communication Skills',
    0,
    'Navnit Alley',
    40,
    'approved',
    NOW() - INTERVAL '5 days'
),
(
    '66666666-6666-6666-6666-666666666666',  -- Suspended User
    (SELECT id FROM public.courses WHERE title = 'Sample IELTS Preparation Course' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Your instructor ID
    'Suspended User',
    'Sample IELTS Preparation Course',
    199.99,
    'Navnit Alley',
    15,
    'approved',
    NOW() - INTERVAL '15 days'
)
ON CONFLICT DO NOTHING;

-- Verify enrollments were created
SELECT 
    u.name as student_name,
    e.course_title,
    e.progress,
    e.status,
    e.enrolled_at
FROM public.enrollments e
JOIN public.users u ON e.user_id = u.id
WHERE u.id IN ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666')
ORDER BY e.enrolled_at DESC;
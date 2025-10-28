-- Create sample enrollment data for testing
-- Run this in Supabase SQL Editor

-- First, let's create a sample student user
INSERT INTO public.users (id, email, name, role) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'student@example.com',
    'Test Student',
    'student'
)
ON CONFLICT (id) DO NOTHING;

-- Get the course IDs for your courses
-- (We'll use the ones created in the previous script)

-- Create sample enrollments for your courses
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
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.courses WHERE title = 'Sample IELTS Preparation Course' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Test Student',
    'Sample IELTS Preparation Course',
    199.99,
    'Navnit Alley',
    25,
    'approved',
    NOW() - INTERVAL '3 days'
),
(
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM public.courses WHERE title = 'Business Communication Skills' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Test Student',
    'Business Communication Skills',
    0,
    'Navnit Alley',
    60,
    'approved',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT DO NOTHING;

-- Add another student from last week for the "new enrollments" count
INSERT INTO public.users (id, email, name, role) 
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'student2@example.com',
    'Another Student',
    'student'
)
ON CONFLICT (id) DO NOTHING;

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
    '22222222-2222-2222-2222-222222222222',
    (SELECT id FROM public.courses WHERE title = 'Sample IELTS Preparation Course' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Another Student',
    'Sample IELTS Preparation Course',
    199.99,
    'Navnit Alley',
    10,
    'approved',
    NOW() - INTERVAL '5 days'
)
ON CONFLICT DO NOTHING;

-- Check the enrollments were created
SELECT 
    student_name,
    course_title,
    status,
    progress,
    enrolled_at
FROM public.enrollments 
WHERE instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
ORDER BY enrolled_at DESC;
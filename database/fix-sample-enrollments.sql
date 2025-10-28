-- Fixed sample enrollment data - using your actual user ID
-- Run this in Supabase SQL Editor

-- Create sample enrollments using your actual user ID as a student
-- (This will simulate you enrolling in your own courses for testing)
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
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Using your actual user ID
    (SELECT id FROM public.courses WHERE title = 'Sample IELTS Preparation Course' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Navnit Alley',
    'Sample IELTS Preparation Course',
    199.99,
    'Navnit Alley',
    25,
    'approved',
    NOW() - INTERVAL '3 days'
),
(
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Using your actual user ID
    (SELECT id FROM public.courses WHERE title = 'Business Communication Skills' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Navnit Alley',
    'Business Communication Skills',
    0,
    'Navnit Alley',
    60,
    'approved',
    NOW() - INTERVAL '2 days'
),
(
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Using your actual user ID
    (SELECT id FROM public.courses WHERE title = 'Sample IELTS Preparation Course' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Test Enrollment',
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

-- Also check how many enrollments in the last 7 days
SELECT COUNT(*) as new_enrollments_count
FROM public.enrollments 
WHERE instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
AND status = 'approved'
AND enrolled_at >= NOW() - INTERVAL '7 days';
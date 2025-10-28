-- Debug and fix enrollment creation issue
-- Run this in Supabase SQL Editor

-- First, let's check what users currently exist
SELECT id, name, email, role, status FROM public.users ORDER BY created_at DESC;

-- Check if the foreign key constraint references auth.users instead of public.users
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='enrollments'
  AND kcu.column_name = 'user_id';

-- If the constraint references auth.users, we need to use your actual user ID
-- Let's create a simple enrollment using your existing user ID first
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
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Your actual user ID (exists in auth.users)
    (SELECT id FROM public.courses WHERE title = 'Sample IELTS Preparation Course' LIMIT 1),
    '94388a0c-4b55-401e-85c6-02e67614ba1e',  -- Your instructor ID
    'Test Enrollment',
    'Sample IELTS Preparation Course',
    199.99,
    'Navnit Alley',
    50,
    'approved',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT DO NOTHING;

-- Verify this enrollment worked
SELECT 
    user_id,
    student_name,
    course_title,
    status,
    enrolled_at
FROM public.enrollments 
WHERE user_id = '94388a0c-4b55-401e-85c6-02e67614ba1e'
ORDER BY enrolled_at DESC;
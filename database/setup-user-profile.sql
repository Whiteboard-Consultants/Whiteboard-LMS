-- Create/update user profile for successful login
-- Run this in Supabase SQL Editor

-- Create or update your user profile with instructor role
INSERT INTO public.users (id, email, name, role) 
VALUES (
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'navnit.alley@whiteboardconsultant.com',
    'Navnit Alley',
    'instructor'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verify the user profile
SELECT * FROM public.users WHERE id = '94388a0c-4b55-401e-85c6-02e67614ba1e';

-- Optional: Create some sample courses for testing (replace instructor info)
INSERT INTO public.courses (
    title, 
    description, 
    instructor, 
    instructor_id, 
    category, 
    type,
    price,
    level
) VALUES 
(
    'Sample IELTS Preparation Course',
    'Complete IELTS preparation with practice tests and speaking sessions',
    '{"id": "94388a0c-4b55-401e-85c6-02e67614ba1e", "name": "Navnit Alley"}',
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Test Prep',
    'paid',
    199.99,
    'Intermediate'
),
(
    'Business Communication Skills',
    'Improve your professional communication skills',
    '{"id": "94388a0c-4b55-401e-85c6-02e67614ba1e", "name": "Navnit Alley"}',
    '94388a0c-4b55-401e-85c6-02e67614ba1e',
    'Communication',
    'free',
    0,
    'Beginner'
)
ON CONFLICT DO NOTHING;

-- Check if courses were created
SELECT title, instructor_id, type, price FROM public.courses WHERE instructor_id = '94388a0c-4b55-401e-85c6-02e67614ba1e';
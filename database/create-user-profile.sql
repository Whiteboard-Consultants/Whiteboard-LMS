-- Manual user profile creation for troubleshooting
-- Run this in Supabase SQL Editor

-- First check if this specific user exists in public.users
SELECT * FROM public.users WHERE id = '94388a0c-4b55-401e-85c6-02e67614ba1e';

-- If the above returns no results, manually create the profile
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
    role = EXCLUDED.role;

-- Verify the user was created
SELECT * FROM public.users WHERE id = '94388a0c-4b55-401e-85c6-02e67614ba1e';
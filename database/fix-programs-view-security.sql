-- Fix SECURITY DEFINER issue on programs_with_courses view
-- This script removes the SECURITY DEFINER property and recreates the view properly
-- Date: January 15, 2026

-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.programs_with_courses;

-- Recreate the view with explicit SECURITY_INVOKER
-- This ensures the view respects the permissions of the querying user,
-- not the creator, and properly enforces RLS policies
CREATE OR REPLACE VIEW public.programs_with_courses WITH (SECURITY_INVOKER) AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.start_date,
    p.last_enrollment_date,
    p.batch_time,
    p.created_at,
    p.updated_at,
    COUNT(c.id) as course_count
FROM public.programs p
LEFT JOIN public.courses c ON c.program_id = p.id
GROUP BY p.id, p.name, p.description, p.start_date, p.last_enrollment_date, p.batch_time, p.created_at, p.updated_at;

-- Verify the view was created without SECURITY DEFINER
SELECT 
    table_schema,
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public' 
AND table_name = 'programs_with_courses';

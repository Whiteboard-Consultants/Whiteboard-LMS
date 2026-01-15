-- Supabase Migration: Fix SECURITY DEFINER on programs_with_courses view
-- Migration ID: 20260115_fix_programs_view_security
-- Description: Removes SECURITY DEFINER from programs_with_courses view to comply with security best practices
-- Date: January 15, 2026

-- First, ensure we have the underlying tables
-- (They should already exist, but this is defensive programming)

-- Drop the view completely to ensure clean recreation
DROP VIEW IF EXISTS public.programs_with_courses CASCADE;

-- Recreate with explicit SECURITY_INVOKER
-- This ensures the view respects the permissions of the querying user,
-- not the creator, and properly enforces RLS policies
CREATE VIEW public.programs_with_courses WITH (SECURITY_INVOKER) AS
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
LEFT JOIN public.courses c ON (c.program_id = p.id)
GROUP BY p.id, p.name, p.description, p.start_date, p.last_enrollment_date, p.batch_time, p.created_at, p.updated_at;

-- Add comment to document that this view respects user permissions
COMMENT ON VIEW public.programs_with_courses IS 'View showing programs with course counts. Respects querying user permissions and RLS policies.';

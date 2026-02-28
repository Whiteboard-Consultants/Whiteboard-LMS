-- Migration: Add Free Preview Lessons Feature
-- Date: 2024
-- Description: Adds is_free_preview column to lessons table and updates RLS policies

-- Step 1: Add is_free_preview column to lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false;

-- Step 2: Create index for faster queries on free preview lessons
CREATE INDEX IF NOT EXISTS idx_lessons_free_preview ON public.lessons(is_free_preview) WHERE is_free_preview = true;

-- Step 3: Drop existing lesson policies that we need to modify
DROP POLICY IF EXISTS "Public can view free preview lessons" ON public.lessons;
DROP POLICY IF EXISTS "Course access for lessons" ON public.lessons;

-- Step 4: Recreate the course access policy with free preview support
-- This allows:
--   - Anyone to view free preview lessons (is_free_preview = true)
--   - Enrolled students to view all lessons in their courses
--   - Instructors to view lessons in their courses
--   - Admins to view all lessons
CREATE POLICY "Course access for lessons" ON public.lessons FOR SELECT USING (
    is_free_preview = true OR
    EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = lessons.course_id AND enrollments.user_id = auth.uid() AND enrollments.status = 'approved') OR
    EXISTS (SELECT 1 FROM public.courses WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Verify the migration
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'lessons' AND column_name = 'is_free_preview';

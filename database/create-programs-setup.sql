-- Create programs table for managing online programs/certifications
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    last_enrollment_date DATE,
    batch_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add program_id to courses table if it doesn't exist
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL;

-- Add batch_time column if it doesn't exist
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS batch_time TEXT;

-- Create index for program_id
CREATE INDEX IF NOT EXISTS idx_courses_program_id ON public.courses(program_id);

-- Create a view to see programs with their course count
-- Use SECURITY_INVOKER to ensure the view respects querying user permissions (not creator)
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

-- Enable RLS on programs table
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read programs
CREATE POLICY "Anyone can read programs" ON public.programs
    FOR SELECT USING (true);

-- RLS Policy: Only admins can insert/update/delete programs
CREATE POLICY "Only admins can manage programs" ON public.programs
    FOR ALL USING (
        (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
    );

-- Grant permissions
GRANT SELECT ON public.programs TO authenticated;
GRANT ALL ON public.programs TO authenticated;
GRANT SELECT ON public.programs_with_courses TO authenticated;

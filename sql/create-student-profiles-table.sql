-- Create student_profiles table for structured profile data
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    education TEXT,
    passing_year INTEGER,
    improvement_areas TEXT[], -- Array of course categories
    career_plan TEXT,
    needs_interview_support BOOLEAN DEFAULT false,
    is_profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to student_profiles
CREATE TRIGGER handle_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for student_profiles
-- Students can only access their own profile
CREATE POLICY "Students can view own profile" ON public.student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile" ON public.student_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own profile" ON public.student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins and instructors can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.student_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_created_at ON public.student_profiles(created_at);
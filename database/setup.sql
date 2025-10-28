-- WhitedgeLMS Database Schema Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE -- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_instructor_id ON public.enrollments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_tests_course_id ON public.tests(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON public.questions(test_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;F NOT EXISTS "uuid-ossp";

-- Create users table for user profiles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    bio TEXT,
    phone TEXT,
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructor JSONB NOT NULL, -- {id: string, name: string}
    instructor_id UUID REFERENCES auth.users(id), -- For easier queries
    image_url TEXT,
    student_count INTEGER DEFAULT 0,
    lesson_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    total_rating INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT CHECK (type IN ('free', 'paid')) DEFAULT 'free',
    price DECIMAL(10,2) DEFAULT 0,
    original_price DECIMAL(10,2),
    category TEXT NOT NULL,
    has_certificate BOOLEAN DEFAULT false,
    certificate_url TEXT,
    program_outcome TEXT,
    course_structure TEXT,
    faqs TEXT,
    duration TEXT,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    tags TEXT[],
    final_assessment_id UUID
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    course_id UUID NOT NULL REFERENCES public.courses(id),
    instructor_id UUID NOT NULL REFERENCES auth.users(id),
    student_name TEXT,
    course_title TEXT,
    course_price DECIMAL(10,2),
    instructor_name TEXT,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('pending', 'approved')) DEFAULT 'pending',
    payment_id TEXT,
    order_id TEXT,
    amount DECIMAL(10,2),
    purchase_date TIMESTAMP WITH TIME ZONE,
    completed_lessons TEXT[],
    certificate_status TEXT CHECK (certificate_status IN ('eligible', 'not_eligible', 'requested', 'approved')) DEFAULT 'not_eligible',
    average_score DECIMAL(5,2),
    coupon_code TEXT
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('text', 'video', 'audio', 'document', 'embed', 'quiz', 'assignment')) NOT NULL,
    objectives TEXT,
    content TEXT NOT NULL,
    asset_url TEXT,
    course_id UUID NOT NULL REFERENCES public.courses(id),
    parent_id UUID REFERENCES public.lessons(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_number INTEGER NOT NULL,
    questions JSONB
);

-- Create tests table
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID NOT NULL REFERENCES public.courses(id),
    instructor_id UUID NOT NULL REFERENCES auth.users(id),
    time_limit INTEGER,
    total_marks INTEGER DEFAULT 0,
    pass_marks INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.tests(id),
    type TEXT CHECK (type IN ('mcq', 'descriptive')) DEFAULT 'mcq',
    question_text TEXT NOT NULL,
    options TEXT[],
    correct_answer_index INTEGER,
    explanation TEXT,
    marks INTEGER DEFAULT 1,
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    author_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_instructor_id ON public.enrollments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_tests_course_id ON public.tests(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON public.questions(test_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users: Users can see and update their own profile, admins can see all
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public user profiles for instructors" ON public.users FOR SELECT USING (role = 'instructor');

-- Courses: Readable by everyone, writable by instructors and admins
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Instructors can manage their courses" ON public.courses FOR ALL USING (
    auth.uid() = instructor_id OR 
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Enrollments: Users can see their own enrollments, instructors can see their course enrollments
CREATE POLICY "Users can view their enrollments" ON public.enrollments FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = instructor_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Users can create enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Instructors can update enrollments" ON public.enrollments FOR UPDATE USING (
    auth.uid() = instructor_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Lessons: Readable by enrolled students and course instructors
CREATE POLICY "Course access for lessons" ON public.lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = lessons.course_id AND enrollments.user_id = auth.uid() AND enrollments.status = 'approved') OR
    EXISTS (SELECT 1 FROM public.courses WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Instructors can manage lessons" ON public.lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Tests: Similar to lessons
CREATE POLICY "Course access for tests" ON public.tests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = tests.course_id AND enrollments.user_id = auth.uid() AND enrollments.status = 'approved') OR
    auth.uid() = instructor_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Instructors can manage tests" ON public.tests FOR ALL USING (
    auth.uid() = instructor_id OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Questions: Access through tests
CREATE POLICY "Test access for questions" ON public.questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tests WHERE tests.id = questions.test_id AND 
        (EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.course_id = tests.course_id AND enrollments.user_id = auth.uid() AND enrollments.status = 'approved') OR
         tests.instructor_id = auth.uid() OR
         EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')))
);
CREATE POLICY "Instructors can manage questions" ON public.questions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tests WHERE tests.id = questions.test_id AND 
        (tests.instructor_id = auth.uid() OR
         EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')))
);

-- Announcements: Readable by everyone, writable by admins
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.raw_user_meta_data->>'role' = 'admin')
);

-- Create function to automatically set instructor_id when inserting courses
CREATE OR REPLACE FUNCTION public.set_instructor_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Set instructor_id from instructor JSON field
    IF NEW.instructor IS NOT NULL AND NEW.instructor ? 'id' THEN
        NEW.instructor_id := (NEW.instructor->>'id')::UUID;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for courses
DROP TRIGGER IF EXISTS set_instructor_id_trigger ON public.courses;
CREATE TRIGGER set_instructor_id_trigger
    BEFORE INSERT OR UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_instructor_id();

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data (optional - remove if not needed)
-- You can uncomment these after creating some test users

/*
-- Sample course data (replace with actual instructor UUIDs)
INSERT INTO public.courses (title, description, instructor, instructor_id, category, type) VALUES
('Sample Course 1', 'A sample course for testing', '{"id": "your-instructor-uuid", "name": "Instructor Name"}', 'your-instructor-uuid', 'Test Prep', 'free'),
('Sample Course 2', 'Another sample course', '{"id": "your-instructor-uuid", "name": "Instructor Name"}', 'your-instructor-uuid', 'Communication', 'paid');
*/
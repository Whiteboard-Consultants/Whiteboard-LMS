-- =================================================================
-- WhitedgeLMS - Clean Database Setup for New Supabase Project
-- =================================================================
-- Run this in your new Supabase project's SQL Editor
-- =================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 1. USERS TABLE
-- =================================================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'deleted')),
    profile_picture TEXT,
    phone TEXT,
    bio TEXT,
    company TEXT,
    location TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update any user" ON public.users
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =================================================================
-- 2. CARTS TABLE
-- =================================================================

CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    course_title TEXT NOT NULL,
    course_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    course_image TEXT,
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on carts table
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carts
CREATE POLICY "Users can view own cart items" ON public.carts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own cart" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.carts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.carts
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- 3. ANNOUNCEMENTS TABLE
-- =================================================================

CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'instructors', 'admins')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
CREATE POLICY "Everyone can view active announcements" ON public.announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all announcements" ON public.announcements
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =================================================================
-- 4. AUTO-UPDATE TRIGGERS
-- =================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON public.carts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at 
    BEFORE UPDATE ON public.announcements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- 5. AUTH INTEGRATION SETUP
-- =================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- 6. INSERT SAMPLE DATA
-- =================================================================

-- Create admin user (you'll need to sign up with this email first)
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.users (id, email, name, role, status) VALUES 
(uuid_generate_v4(), 'admin@whitedgelms.com', 'Admin User', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Sample announcement
INSERT INTO public.announcements (title, content, type, target_audience, created_by) VALUES 
('Welcome to WhitedgeLMS!', 'Welcome to our new learning management system. Explore our courses and start your learning journey.', 'info', 'all', (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1));

-- =================================================================
-- SETUP COMPLETE
-- =================================================================

SELECT 'Database setup completed successfully! 🎉' as result;
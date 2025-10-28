-- Create posts table to fix build error
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT false,
    featured_image TEXT,
    tags TEXT[],
    category TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing public read access for published posts)
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (published = true);

CREATE POLICY "Authors can manage their own posts" ON public.posts
    FOR ALL USING (auth.uid() = author_id);

-- Insert some sample posts for testing
INSERT INTO public.posts (title, slug, content, excerpt, published, category, tags) VALUES
('Welcome to WhitedgeLMS', 'welcome-to-whitedgelms', 'Welcome to our comprehensive learning management system...', 'Get started with WhitedgeLMS and explore our features.', true, 'General', ARRAY['welcome', 'getting-started']),
('Study Tips for Success', 'study-tips-for-success', 'Here are some effective study strategies...', 'Proven techniques to improve your learning outcomes.', true, 'Education', ARRAY['study-tips', 'education']),
('Course Announcements', 'course-announcements', 'Stay updated with the latest course information...', 'Important updates about our courses and schedules.', true, 'Announcements', ARRAY['announcements', 'courses'])
ON CONFLICT (slug) DO NOTHING;
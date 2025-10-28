-- SQL to create the posts table in Supabase
-- Run this in your Supabase SQL Editor

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    author_id UUID REFERENCES public.users(id),
    author_name TEXT NOT NULL,
    category TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('published', 'draft')) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

-- Authors can view and manage their own posts
CREATE POLICY "Authors can manage their own posts" ON public.posts
    FOR ALL USING (auth.uid() = author_id);

-- Admin users can manage all posts
CREATE POLICY "Admin users can manage all posts" ON public.posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_posts_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;

-- Insert some sample blog posts (optional)
INSERT INTO public.posts (title, slug, author_name, category, excerpt, content, status, featured) VALUES
(
    'Welcome to Our New Blog',
    'welcome-to-our-new-blog',
    'Admin User',
    'Announcements',
    'We are excited to launch our new blog where we will share insights, tips, and updates about our educational platform.',
    '# Welcome to Our New Blog

We are thrilled to announce the launch of our new blog! This is where we will be sharing:

- Educational insights and tips
- Platform updates and new features  
- Success stories from our students
- Industry trends and analysis

Stay tuned for regular updates and valuable content that will help you on your learning journey.

## What to Expect

Our blog will cover a wide range of topics including:

1. **Study Tips** - Proven strategies to improve your learning
2. **Technology Updates** - Latest features and improvements
3. **Student Success Stories** - Inspiring journeys from our community
4. **Industry Insights** - Trends and opportunities in education

We look forward to sharing this journey with you!',
    'published',
    true
),
(
    'Effective Study Strategies for Online Learning',
    'effective-study-strategies-online-learning',
    'Admin User',
    'Education',
    'Discover proven techniques to maximize your learning effectiveness in online environments.',
    '# Effective Study Strategies for Online Learning

Online learning presents unique challenges and opportunities. Here are some proven strategies to help you succeed:

## 1. Create a Dedicated Study Space

Having a designated area for learning helps create the right mindset and minimizes distractions.

## 2. Establish a Routine

Consistency is key in online learning. Set regular study hours and stick to them.

## 3. Take Regular Breaks

Use techniques like the Pomodoro Technique to maintain focus and prevent burnout.

## 4. Engage Actively

Participate in discussions, ask questions, and interact with your peers and instructors.

## 5. Use Multiple Learning Resources

Combine videos, readings, quizzes, and practical exercises for a well-rounded learning experience.

Remember, the key to successful online learning is finding what works best for you and staying committed to your goals.',
    'published',
    false
),
(
    'Platform Updates Coming Soon',
    'platform-updates-coming-soon',
    'Admin User',
    'Updates',
    'Get a sneak peek at the exciting new features and improvements coming to our platform.',
    '# Platform Updates Coming Soon

We are constantly working to improve your learning experience. Here is what you can expect in our upcoming updates:

## New Features

- Enhanced video player with playback speed controls
- Interactive quizzes with instant feedback
- Progress tracking dashboard
- Mobile app improvements

## Performance Improvements

- Faster page loading times
- Better video streaming quality
- Improved search functionality
- Enhanced mobile responsiveness

## User Experience Enhancements

- Redesigned course interface
- Simplified navigation
- Better accessibility features
- Dark mode option

Stay tuned for these exciting updates!',
    'draft',
    false
)
ON CONFLICT (slug) DO NOTHING;
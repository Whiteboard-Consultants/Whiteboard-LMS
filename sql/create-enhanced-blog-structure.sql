-- Enhanced Blog Posts Table Structure for MetaApply-style Blog
-- Based on analysis of https://metaapply.io/blogs/most-demanding-courses-to-study-abroad/

-- First, let's check if posts table exists and modify it if needed
-- If the table exists, we'll add missing columns
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'status') THEN
        ALTER TABLE public.posts ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_bio') THEN
        ALTER TABLE public.posts ADD COLUMN author_bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_avatar_url') THEN
        ALTER TABLE public.posts ADD COLUMN author_avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'meta_description') THEN
        ALTER TABLE public.posts ADD COLUMN meta_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'meta_keywords') THEN
        ALTER TABLE public.posts ADD COLUMN meta_keywords TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured_image_url') THEN
        ALTER TABLE public.posts ADD COLUMN featured_image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured_image_alt') THEN
        ALTER TABLE public.posts ADD COLUMN featured_image_alt TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'published_at') THEN
        ALTER TABLE public.posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'scheduled_for') THEN
        ALTER TABLE public.posts ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'read_time_minutes') THEN
        ALTER TABLE public.posts ADD COLUMN read_time_minutes INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views_count') THEN
        ALTER TABLE public.posts ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'faq_section') THEN
        ALTER TABLE public.posts ADD COLUMN faq_section JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'related_post_ids') THEN
        ALTER TABLE public.posts ADD COLUMN related_post_ids UUID[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'social_sharing_enabled') THEN
        ALTER TABLE public.posts ADD COLUMN social_sharing_enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Handle existing columns that might need updates
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'imageurl') THEN
        -- Rename imageUrl to featured_image_url if it exists
        ALTER TABLE public.posts RENAME COLUMN imageurl TO featured_image_url;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'image_url') THEN
        -- Use existing image_url as featured_image_url
        UPDATE public.posts SET featured_image_url = image_url WHERE featured_image_url IS NULL;
    END IF;
    
END $$;

-- Create enhanced posts table (this will only run if table doesn't exist)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic post information
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Author information
    author_id UUID REFERENCES public.users(id),
    author_name TEXT NOT NULL,
    author_bio TEXT,
    author_avatar_url TEXT,
    
    -- Categorization & SEO
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Media
    featured_image_url TEXT,
    featured_image_alt TEXT,
    
    -- Publishing
    status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'scheduled')) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- Engagement
    featured BOOLEAN DEFAULT false,
    read_time_minutes INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    
    -- FAQ Section (JSON for structured FAQ data)
    faq_section JSONB DEFAULT '[]',
    
    -- Related content
    related_post_ids UUID[] DEFAULT '{}',
    
    -- Social sharing
    social_sharing_enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog categories table for better organization
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color_hex TEXT DEFAULT '#3B82F6',
    icon_name TEXT,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table for blog engagement
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_website TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'spam')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comprehensive indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON public.posts(views_count);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_faq_section ON public.posts USING GIN(faq_section);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts (drop existing policies first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admin users can manage all posts" ON public.posts;

CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published' AND (published_at IS NULL OR published_at <= NOW()));

CREATE POLICY "Authors can manage their own posts" ON public.posts
    FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admin users can manage all posts" ON public.posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for categories and tags
CREATE POLICY "Anyone can view categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.blog_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Admin can manage tags" ON public.blog_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for comments
CREATE POLICY "Anyone can view approved comments" ON public.blog_comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create comments" ON public.blog_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage all comments" ON public.blog_comments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_posts_updated_at();

-- Function to update post counts in categories
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.blog_categories 
        SET post_count = post_count + 1 
        WHERE name = NEW.category;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.category != NEW.category THEN
            UPDATE public.blog_categories 
            SET post_count = post_count - 1 
            WHERE name = OLD.category;
            UPDATE public.blog_categories 
            SET post_count = post_count + 1 
            WHERE name = NEW.category;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.blog_categories 
        SET post_count = post_count - 1 
        WHERE name = OLD.category;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_post_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_category_post_count();

-- Insert sample categories based on MetaApply structure
INSERT INTO public.blog_categories (name, slug, description, color_hex, icon_name) VALUES
('Study Abroad', 'study-abroad', 'Comprehensive guides for studying in international universities', '#3B82F6', 'GraduationCap'),
('Scholarships', 'scholarships', 'Scholarship opportunities and funding guides', '#10B981', 'Award'),
('Universities', 'universities', 'Top universities and institution guides', '#8B5CF6', 'Building'),
('Career Guidance', 'career-guidance', 'Career advice and professional development', '#F59E0B', 'Briefcase'),
('Visa & Immigration', 'visa-immigration', 'Visa processes and immigration guides', '#EF4444', 'Passport'),
('Country Guides', 'country-guides', 'Detailed country-specific study guides', '#06B6D4', 'Globe'),
('Course Selection', 'course-selection', 'Help choosing the right academic programs', '#84CC16', 'BookOpen'),
('Student Life', 'student-life', 'Tips for international student life', '#F97316', 'Users')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO public.blog_tags (name, slug) VALUES
('Computer Science', 'computer-science'),
('Medicine', 'medicine'),
('Business Management', 'business-management'),
('Engineering', 'engineering'),
('International Relations', 'international-relations'),
('Creative Arts', 'creative-arts'),
('Sustainability', 'sustainability'),
('Tourism', 'tourism'),
('Psychology', 'psychology'),
('USA', 'usa'),
('UK', 'uk'),
('Canada', 'canada'),
('Australia', 'australia'),
('Germany', 'germany'),
('France', 'france'),
('2025', '2025'),
('International Students', 'international-students'),
('Career Growth', 'career-growth')
ON CONFLICT (slug) DO NOTHING;

-- Insert enhanced sample blog post matching MetaApply structure
INSERT INTO public.posts (
    title, 
    slug, 
    author_name, 
    category, 
    excerpt, 
    content, 
    status, 
    featured,
    published_at,
    featured_image_url,
    featured_image_alt,
    meta_description,
    read_time_minutes,
    tags,
    faq_section,
    social_sharing_enabled
) VALUES (
    'Most Demanding Courses to Study Abroad in 2025: A Global Career Guide',
    'most-demanding-courses-to-study-abroad-2025',
    'Admin User',
    'Course Selection',
    'Discover the most in-demand courses for studying abroad in 2025. From Computer Science to Medicine, find your path to global career success.',
    '# Most Demanding Courses to Study Abroad in 2025: A Global Career Guide

Studying abroad is no longer just a dream, it has become a strategic career move for thousands of students worldwide. With international universities offering state-of-the-art programmes, top-notch facilities, and exposure to multicultural environments, studying in a foreign country is more popular than ever.

## Why Choose Demanding Courses Abroad?

Before we dive into the list, it''s important to understand what makes a course "demanding" and why international exposure gives you an edge.

## Most Demanding Courses to Study Abroad in 2025

### 1. Computer Science and IT

In today''s digital-first world, Computer Science is one of the most relevant global fields. From Silicon Valley to Berlin''s innovation districts, the demand for coders, AI professionals, cybersecurity experts, and cloud specialists continues to rise.

### 2. Medicine and Health

Healthcare remains one of the most essential and high-demand sectors worldwide, especially in the wake of pandemics and ageing populations.

### 3. Business and Management

Business degrees have always been popular, but their structure is evolving. Studying Business or Management Abroad now involves more than just spreadsheets and case studies.

### 4. Engineering

Engineering continues to power innovation in infrastructure, robotics, transportation, and aerospace.

### 5. International Relations and Law

Now more than ever, the world needs skilled negotiators, policy-makers, and legal professionals.

### 6. Creative Arts, Design, and Media

In a visually driven and interactive world, careers in creative industries are flourishing.

### 7. Sustainability and Environmental Science

As climate change becomes central to global policymaking, environmental and sustainability studies have become more important than ever.

### 8. Tourism and Hospitality Management

The global tourism and hospitality sector is bouncing back with a new focus on luxury, innovation, and safety.

### 9. Psychology and Behavioural Sciences

Mental health awareness is on the rise globally, making psychology and behavioural sciences increasingly relevant.

## Conclusion

Choosing the right course is no longer about following trends, it''s about aligning your personal interests with global demands and securing a strong future.',
    'published',
    true,
    NOW(),
    '/images/blog/most-demanding-courses-2025.webp',
    'Students studying abroad in a modern university setting',
    'Discover the most in-demand courses for studying abroad in 2025. Complete guide to Computer Science, Medicine, Business, and other high-demand fields.',
    12,
    '{"Computer Science", "Medicine", "Business Management", "Engineering", "International Students", "2025", "Career Growth"}',
    '[
        {
            "question": "What course is most desirable for employment opportunities in foreign countries?",
            "answer": "Computer Science and IT remain the most globally in-demand, followed by Medicine and Healthcare, Business Management, and Engineering. These fields offer strong employment prospects across multiple countries."
        },
        {
            "question": "What is the best country to study demanding courses?",
            "answer": "The best country depends on your chosen field. USA excels in Computer Science and Business, UK in Medicine and Law, Germany in Engineering, and Canada offers strong programs across multiple disciplines with favorable immigration policies."
        },
        {
            "question": "Will MetaApply IE help me determine the right course and university?",
            "answer": "Yes, MetaApply IE provides comprehensive counseling services to help you choose the right course and university based on your interests, career goals, and academic background."
        }
    ]',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;

GRANT SELECT ON public.blog_categories TO authenticated;
GRANT SELECT ON public.blog_categories TO anon;
GRANT ALL ON public.blog_categories TO service_role;

GRANT SELECT ON public.blog_tags TO authenticated;
GRANT SELECT ON public.blog_tags TO anon;
GRANT ALL ON public.blog_tags TO service_role;

GRANT SELECT ON public.blog_comments TO authenticated;
GRANT SELECT ON public.blog_comments TO anon;
GRANT ALL ON public.blog_comments TO service_role;
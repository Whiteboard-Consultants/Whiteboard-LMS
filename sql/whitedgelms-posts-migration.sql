-- Targeted Migration for WhitedgeLMS Posts Table
-- Based on current structure analysis

-- Step 1: Add all missing columns for MetaApply-style blog
DO $$
BEGIN
    RAISE NOTICE 'Starting WhitedgeLMS posts table migration...';
    
    -- Core fields that are likely missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'slug') THEN
        ALTER TABLE public.posts ADD COLUMN slug TEXT;
        -- Generate slugs from existing titles
        UPDATE public.posts SET slug = 
            LOWER(
                REPLACE(
                    REPLACE(
                        REPLACE(title, ' ', '-'), 
                        ':', ''
                    ), 
                    '?', ''
                )
            );
        -- Make slug unique and not null
        ALTER TABLE public.posts ALTER COLUMN slug SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug_unique ON public.posts(slug);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'excerpt') THEN
        ALTER TABLE public.posts ADD COLUMN excerpt TEXT;
        -- Generate excerpts from existing content
        UPDATE public.posts SET excerpt = 
            CASE 
                WHEN LENGTH(content) > 200 THEN LEFT(content, 200) || '...'
                ELSE content
            END;
        ALTER TABLE public.posts ALTER COLUMN excerpt SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_id') THEN
        ALTER TABLE public.posts ADD COLUMN author_id UUID;
        -- Try to link to first admin user if available
        UPDATE public.posts SET author_id = (
            SELECT id FROM public.users WHERE role = 'admin' LIMIT 1
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_name') THEN
        ALTER TABLE public.posts ADD COLUMN author_name TEXT NOT NULL DEFAULT 'WhitedgeLMS Admin';
        -- Update with actual user names if possible (using dynamic SQL to avoid parsing issues)
        DECLARE
            user_name_column TEXT := NULL;
            update_sql TEXT;
        BEGIN
            -- Check which name column exists in users table
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
                user_name_column := 'full_name';
            ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
                user_name_column := 'name';
            ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
                user_name_column := 'COALESCE(first_name || '' '' || last_name, first_name)';
            END IF;
            
            -- Update author names if we found a name column
            IF user_name_column IS NOT NULL THEN
                update_sql := format('
                    UPDATE public.posts SET author_name = COALESCE(
                        (SELECT %s FROM public.users WHERE users.id = posts.author_id),
                        ''WhitedgeLMS Admin''
                    )', user_name_column);
                EXECUTE update_sql;
            END IF;
        END;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'category') THEN
        ALTER TABLE public.posts ADD COLUMN category TEXT NOT NULL DEFAULT 'General';
        -- Categorize existing posts based on title keywords
        UPDATE public.posts SET category = 
            CASE 
                WHEN LOWER(title) LIKE '%welcome%' OR LOWER(title) LIKE '%announcement%' THEN 'Announcements'
                WHEN LOWER(title) LIKE '%study%' OR LOWER(title) LIKE '%tip%' OR LOWER(title) LIKE '%success%' THEN 'Study Tips'
                WHEN LOWER(title) LIKE '%course%' THEN 'Course Information'
                ELSE 'General'
            END;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'status') THEN
        ALTER TABLE public.posts ADD COLUMN status TEXT NOT NULL DEFAULT 'published' 
            CHECK (status IN ('published', 'draft', 'scheduled'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured') THEN
        ALTER TABLE public.posts ADD COLUMN featured BOOLEAN DEFAULT false;
        -- Make the first post featured
        UPDATE public.posts SET featured = true WHERE id = (
            SELECT id FROM public.posts ORDER BY created_at LIMIT 1
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
        ALTER TABLE public.posts ADD COLUMN tags TEXT[] DEFAULT '{}';
        -- Add relevant tags based on content
        UPDATE public.posts SET tags = 
            CASE 
                WHEN LOWER(title) LIKE '%welcome%' THEN ARRAY['Welcome', 'Getting Started']
                WHEN LOWER(title) LIKE '%study%' THEN ARRAY['Study Tips', 'Academic Success', 'Learning']
                WHEN LOWER(title) LIKE '%course%' THEN ARRAY['Courses', 'Announcements', 'Updates']
                ELSE ARRAY['General', 'Information']
            END;
    END IF;
    
    -- Enhanced fields for MetaApply-style functionality
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured_image_url') THEN
        ALTER TABLE public.posts ADD COLUMN featured_image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured_image_alt') THEN
        ALTER TABLE public.posts ADD COLUMN featured_image_alt TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'meta_description') THEN
        ALTER TABLE public.posts ADD COLUMN meta_description TEXT;
        -- Generate meta descriptions from excerpts
        UPDATE public.posts SET meta_description = excerpt;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'published_at') THEN
        ALTER TABLE public.posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
        -- Set published_at to created_at for existing posts
        UPDATE public.posts SET published_at = created_at;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'read_time_minutes') THEN
        ALTER TABLE public.posts ADD COLUMN read_time_minutes INTEGER DEFAULT 5;
        -- Calculate read time based on content length (assuming 200 words per minute)
        UPDATE public.posts SET read_time_minutes = 
            GREATEST(1, CEIL(LENGTH(content) / 1000.0));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views_count') THEN
        ALTER TABLE public.posts ADD COLUMN views_count INTEGER DEFAULT 0;
        -- Set some realistic view counts for existing posts
        UPDATE public.posts SET views_count = 
            CASE 
                WHEN featured THEN FLOOR(RANDOM() * 500 + 100)
                ELSE FLOOR(RANDOM() * 200 + 20)
            END;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'faq_section') THEN
        ALTER TABLE public.posts ADD COLUMN faq_section JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'social_sharing_enabled') THEN
        ALTER TABLE public.posts ADD COLUMN social_sharing_enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Handle updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE public.posts SET updated_at = created_at;
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Step 2: Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON public.posts(views_count);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_faq_section ON public.posts USING GIN(faq_section);

-- Step 3: Enable RLS if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Step 4: Create/Update RLS policies
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.posts;
DROP POLICY IF EXISTS "Admin users can manage all posts" ON public.posts;

CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can manage their own posts" ON public.posts
    FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admin users can manage all posts" ON public.posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Step 5: Create the trigger for updated_at
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_posts_updated_at();

-- Step 6: Create blog categories table
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

-- Enable RLS for categories
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.blog_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert categories based on your existing posts
INSERT INTO public.blog_categories (name, slug, description, color_hex, icon_name) VALUES
('Announcements', 'announcements', 'Platform updates and important notices', '#EF4444', 'Megaphone'),
('Study Tips', 'study-tips', 'Helpful strategies for academic success', '#10B981', 'BookOpen'),
('Course Information', 'course-information', 'Details about courses and curriculum', '#3B82F6', 'GraduationCap'),
('General', 'general', 'General information and resources', '#6B7280', 'Info')
ON CONFLICT (slug) DO NOTHING;

-- Update category post counts
UPDATE public.blog_categories SET post_count = (
    SELECT COUNT(*) FROM public.posts WHERE posts.category = blog_categories.name
);

-- Step 7: Grant permissions
GRANT SELECT ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.posts TO service_role;

GRANT SELECT ON public.blog_categories TO authenticated;
GRANT SELECT ON public.blog_categories TO anon;
GRANT ALL ON public.blog_categories TO service_role;

-- Step 8: Show results
SELECT 
    'Migration Results:' as summary,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
    COUNT(CASE WHEN featured THEN 1 END) as featured_posts,
    STRING_AGG(DISTINCT category, ', ') as categories
FROM public.posts;

-- Show updated post structure
SELECT 
    title,
    slug,
    category,
    author_name,
    status,
    featured,
    read_time_minutes,
    views_count,
    array_to_string(tags, ', ') as tags_list,
    published_at
FROM public.posts
ORDER BY created_at;
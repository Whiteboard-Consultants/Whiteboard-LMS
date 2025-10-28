-- Safe Migration Script for Enhanced Blog Structure
-- This script safely migrates existing posts table to the enhanced structure

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'posts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Backup existing data (optional but recommended)
-- CREATE TABLE posts_backup AS SELECT * FROM public.posts;

-- Step 3: Add missing columns safely
DO $$
BEGIN
    -- Status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'status') THEN
        ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'scheduled'));
        -- Update existing records to have 'published' status
        UPDATE public.posts SET status = 'published' WHERE status IS NULL;
        -- Make it NOT NULL after setting values
        ALTER TABLE public.posts ALTER COLUMN status SET NOT NULL;
    END IF;
    
    -- Author bio and avatar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_bio') THEN
        ALTER TABLE public.posts ADD COLUMN author_bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_avatar_url') THEN
        ALTER TABLE public.posts ADD COLUMN author_avatar_url TEXT;
    END IF;
    
    -- SEO fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'meta_description') THEN
        ALTER TABLE public.posts ADD COLUMN meta_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'meta_keywords') THEN
        ALTER TABLE public.posts ADD COLUMN meta_keywords TEXT;
    END IF;
    
    -- Featured image fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured_image_url') THEN
        ALTER TABLE public.posts ADD COLUMN featured_image_url TEXT;
        -- Copy data from existing image_url column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'image_url') THEN
            UPDATE public.posts SET featured_image_url = image_url WHERE featured_image_url IS NULL;
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'featured_image_alt') THEN
        ALTER TABLE public.posts ADD COLUMN featured_image_alt TEXT;
    END IF;
    
    -- Publishing fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'published_at') THEN
        ALTER TABLE public.posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
        -- Set published_at to created_at for existing published posts
        UPDATE public.posts SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'scheduled_for') THEN
        ALTER TABLE public.posts ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Engagement fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'read_time_minutes') THEN
        ALTER TABLE public.posts ADD COLUMN read_time_minutes INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'views_count') THEN
        ALTER TABLE public.posts ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
    
    -- Enhanced content fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'faq_section') THEN
        ALTER TABLE public.posts ADD COLUMN faq_section JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'related_post_ids') THEN
        ALTER TABLE public.posts ADD COLUMN related_post_ids UUID[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'social_sharing_enabled') THEN
        ALTER TABLE public.posts ADD COLUMN social_sharing_enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Handle author_name if it doesn't exist but author_id does
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_name') THEN
        ALTER TABLE public.posts ADD COLUMN author_name TEXT;
        -- Try to populate from users table if possible
        UPDATE public.posts SET author_name = (
            SELECT COALESCE(full_name, email, 'Unknown Author') 
            FROM public.users 
            WHERE users.id = posts.author_id
        ) WHERE author_name IS NULL;
        -- Set default for any remaining null values
        UPDATE public.posts SET author_name = 'Unknown Author' WHERE author_name IS NULL;
        -- Make it NOT NULL
        ALTER TABLE public.posts ALTER COLUMN author_name SET NOT NULL;
    END IF;
    
END $$;

-- Step 4: Create new indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_views_count ON public.posts(views_count);
CREATE INDEX IF NOT EXISTS idx_posts_faq_section ON public.posts USING GIN(faq_section);

-- Step 5: Update or create RLS policies
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

-- Step 6: Update existing data to ensure consistency
UPDATE public.posts 
SET 
    status = 'published',
    published_at = created_at,
    read_time_minutes = 5,
    views_count = 0,
    social_sharing_enabled = true,
    faq_section = '[]',
    related_post_ids = '{}'
WHERE status IS NULL 
   OR published_at IS NULL 
   OR read_time_minutes IS NULL 
   OR views_count IS NULL 
   OR social_sharing_enabled IS NULL
   OR faq_section IS NULL
   OR related_post_ids IS NULL;

-- Step 7: Create or update the trigger function
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_posts_updated_at();

-- Step 8: Verify the migration
SELECT 
    'Migration completed successfully!' as message,
    count(*) as total_posts,
    count(CASE WHEN status = 'published' THEN 1 END) as published_posts,
    count(CASE WHEN featured THEN 1 END) as featured_posts
FROM public.posts;
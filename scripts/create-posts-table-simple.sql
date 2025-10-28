-- Simple version: Create the posts table for the blog system
-- Step 1: Create the table structure
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'scheduled')),
  featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  
  -- Image fields
  image_url TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  
  -- SEO fields
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Author fields (denormalized for performance)
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_bio TEXT,
  author_avatar_url TEXT,
  
  -- Analytics fields
  read_time_minutes INTEGER,
  views_count INTEGER DEFAULT 0,
  
  -- Publishing fields
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  
  -- Additional content
  faq_section JSONB,
  related_post_ids UUID[],
  social_sharing_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at);
CREATE INDEX IF NOT EXISTS posts_featured_idx ON posts(featured);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at);

-- Step 3: Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
$$ language 'plpgsql';

-- Step 4: Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies for posts table
-- Allow all authenticated users to read published posts
DROP POLICY IF EXISTS "Allow read access to published posts" ON posts;
CREATE POLICY "Allow read access to published posts" ON posts
  FOR SELECT TO authenticated
  USING (status = 'published');

-- Allow public read access to published posts (for the public blog)
DROP POLICY IF EXISTS "Allow public read access to published posts" ON posts;
CREATE POLICY "Allow public read access to published posts" ON posts
  FOR SELECT TO anon
  USING (status = 'published');

-- Allow admins to perform all operations
DROP POLICY IF EXISTS "Allow admin full access to posts" ON posts;
CREATE POLICY "Allow admin full access to posts" ON posts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Allow authors to manage their own posts
DROP POLICY IF EXISTS "Allow authors to manage their own posts" ON posts;
CREATE POLICY "Allow authors to manage their own posts" ON posts
  FOR ALL TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Step 7: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON posts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 8: Add comments for documentation
COMMENT ON TABLE posts IS 'Blog posts for the content management system';
COMMENT ON COLUMN posts.slug IS 'URL-friendly version of the title, must be unique';
COMMENT ON COLUMN posts.status IS 'Publication status: draft, published, or scheduled';
COMMENT ON COLUMN posts.featured IS 'Whether this post should be featured prominently';
COMMENT ON COLUMN posts.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN posts.read_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN posts.views_count IS 'Number of times this post has been viewed';
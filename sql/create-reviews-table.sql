-- Create reviews table for course and instructor ratings
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content_rating INTEGER NOT NULL CHECK (content_rating >= 1 AND content_rating <= 5),
    instructor_rating INTEGER NOT NULL CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, user_id) -- One review per user per course
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Add RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow all users to read reviews
CREATE POLICY "Allow read access to all reviews" ON reviews
    FOR SELECT USING (true);

-- Allow users to insert their own reviews
CREATE POLICY "Allow users to insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Add columns to courses table for aggregated ratings (if they don't exist)
DO $$ BEGIN
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'rating'
    ) THEN
        ALTER TABLE courses ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    END IF;

    -- Add rating_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'rating_count'
    ) THEN
        ALTER TABLE courses ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;

    -- Add total_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'total_rating'
    ) THEN
        ALTER TABLE courses ADD COLUMN total_rating INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create a function to update course ratings when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the course rating based on all reviews
    UPDATE courses
    SET 
        rating = COALESCE(
            (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)), 
            0
        ),
        rating_count = COALESCE(
            (SELECT COUNT(*) FROM reviews WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)), 
            0
        ),
        total_rating = COALESCE(
            (SELECT SUM(rating) FROM reviews WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)), 
            0
        )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update course ratings
DROP TRIGGER IF EXISTS trigger_update_course_rating_on_insert ON reviews;
CREATE TRIGGER trigger_update_course_rating_on_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

DROP TRIGGER IF EXISTS trigger_update_course_rating_on_update ON reviews;
CREATE TRIGGER trigger_update_course_rating_on_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

DROP TRIGGER IF EXISTS trigger_update_course_rating_on_delete ON reviews;
CREATE TRIGGER trigger_update_course_rating_on_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_course_rating();

-- Add updated_at trigger for reviews table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
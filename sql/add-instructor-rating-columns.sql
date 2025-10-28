-- Add instructor rating columns to users table
DO $$ BEGIN
    -- Add rating_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'rating_count'
    ) THEN
        ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;

    -- Add total_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'total_rating'
    ) THEN
        ALTER TABLE users ADD COLUMN total_rating INTEGER DEFAULT 0;
    END IF;

    -- Add average_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE users ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_average_rating ON users(average_rating DESC);

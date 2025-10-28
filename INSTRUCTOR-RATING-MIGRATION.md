# Instructions to Fix "Instructor Not Found" Error

## Problem
The student review system needs the instructor rating columns (`rating_count`, `total_rating`, `average_rating`) on the `users` table, but they don't exist yet.

## Solution
Run this SQL migration in your Supabase SQL Editor:

### Steps:
1. Go to https://app.supabase.com/
2. Navigate to your project: **WhitedgeLMS**
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run**

### SQL to Execute:
```sql
-- Add instructor rating columns to users table
DO $$ BEGIN
    -- Add rating_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'rating_count'
    ) THEN
        ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added rating_count column to users table';
    END IF;

    -- Add total_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'total_rating'
    ) THEN
        ALTER TABLE users ADD COLUMN total_rating INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_rating column to users table';
    END IF;

    -- Add average_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE users ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
        RAISE NOTICE 'Added average_rating column to users table';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_average_rating ON users(average_rating DESC);
```

### Expected Output:
You should see success messages like:
- "Added rating_count column to users table"
- "Added total_rating column to users table"
- "Added average_rating column to users table"

### What This Does:
- Adds `rating_count` (INTEGER) to track number of ratings instructor has received
- Adds `total_rating` (INTEGER) to track sum of all ratings 
- Adds `average_rating` (DECIMAL) to store calculated average rating
- Creates an index on `average_rating` for performance

### After Running Migration:
The student review system will work correctly:
1. Students can submit course reviews with instructor ratings
2. Instructor rating data is updated automatically
3. Instructor average rating is calculated and stored

## Code Changes Already Applied:
✅ `src/app/student/actions.ts` - Updated to use `supabaseAdmin` for instructor lookups
✅ All TypeScript errors fixed - no compilation issues

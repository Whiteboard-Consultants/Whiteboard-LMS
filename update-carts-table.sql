-- Add instructor information columns to the existing carts table
-- Run this in your Supabase SQL Editor to update the cart table schema

-- Add instructor columns to the carts table
ALTER TABLE carts 
ADD COLUMN IF NOT EXISTS course_instructor_id TEXT,
ADD COLUMN IF NOT EXISTS course_instructor_name TEXT;

-- Create index for instructor queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_carts_instructor_id ON carts(course_instructor_id);

-- Note: Existing cart data will have NULL values for these new columns
-- New cart items will include instructor information when available
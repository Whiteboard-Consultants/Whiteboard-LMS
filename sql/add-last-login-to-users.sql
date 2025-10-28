-- Add last_login column to users table to track user activity
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Update RLS policies to include last_login field access
-- The existing policies should already cover this, but let's make sure

-- Create or replace function to update last_login on user activity
CREATE OR REPLACE FUNCTION update_user_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET last_login = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_last_login TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_last_login TO service_role;
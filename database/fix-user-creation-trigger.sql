-- Fix the user creation trigger to handle existing profiles
-- This resolves the status check constraint violation

-- First, let's update the trigger function to handle existing users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if a user record already exists with this ID or email
    IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id OR email = NEW.email) THEN
        -- Update existing record instead of inserting
        UPDATE users 
        SET 
            id = NEW.id,  -- Update to use auth user ID
            name = COALESCE(NEW.raw_user_meta_data->>'name', name),  -- Keep existing name if no new name
            role = COALESCE(NEW.raw_user_meta_data->>'role', role),  -- Keep existing role if no new role
            status = CASE 
                WHEN NEW.raw_user_meta_data->>'role' = 'instructor' THEN 'pending'
                WHEN status = 'pending' THEN 'approved'  -- Approve pending users
                ELSE status  -- Keep existing status for already approved users
            END,
            "isProfileComplete" = COALESCE("isProfileComplete", false),
            updated_at = NOW()
        WHERE email = NEW.email;
    ELSE
        -- Insert new record if none exists
        INSERT INTO users (id, name, email, role, status, "isProfileComplete")
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
            CASE 
                WHEN NEW.raw_user_meta_data->>'role' = 'instructor' THEN 'pending'
                ELSE 'approved'
            END,
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- The trigger itself doesn't need to be recreated as it already exists
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Clean up any registration codes from bio field for users who might have completed registration
UPDATE users 
SET bio = NULL 
WHERE bio LIKE '%Registration Code:%' 
AND status = 'approved';
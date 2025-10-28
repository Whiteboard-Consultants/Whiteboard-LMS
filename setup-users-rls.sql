-- Enable RLS on users table and create policies for registration
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow signup (insert) for any authenticated user
CREATE POLICY "Enable insert for authenticated users during signup" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Allow users to read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Allow users to update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy: Allow admins to read all user data
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Policy: Allow admins to update any user
CREATE POLICY "Admins can update any user" ON users
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

SELECT 'RLS policies created for users table' as result;
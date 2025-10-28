-- Run this SQL in your Supabase SQL Editor to create an admin user
-- This will create both the auth user and the database record

-- First, let's check if you have the auth.users table access
-- (This is usually restricted, so we'll create via the dashboard instead)

-- Create a user record in your users table
-- Replace 'your-admin-email@example.com' and 'Your Admin Name' with actual values
-- Note: You'll need to create the auth user through Supabase Dashboard first

INSERT INTO users (
  id, 
  name, 
  email, 
  role, 
  status, 
  "isProfileComplete", 
  "createdAt"
) VALUES (
  'replace-with-auth-user-id',  -- You'll get this from Supabase Dashboard
  'Admin User',
  'admin@whitedge.com',
  'admin',
  'approved',
  true,
  NOW()
);

-- Alternative: If you want to create a test admin user with a known ID
-- First create the auth user in Supabase Dashboard, then run:
-- INSERT INTO users (id, name, email, role, status, "isProfileComplete", "createdAt") 
-- VALUES ('admin-user-id', 'Admin User', 'admin@whitedge.com', 'admin', 'approved', true, NOW());
-- Test: Can we query the actual student users with the exact columns the page uses?
SELECT 
  id,
  name,
  email,
  phone
FROM users 
WHERE id IN (
  '40908919-720e-4200-81c0-5ccc50b66e5b',
  '734137fc-18c8-4b29-8503-c1075f92d570',
  'f3171db5-57d9-423e-9bb1-b01dcad6de1f'
);

-- Check the users table schema to see what columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if there are any RLS policies on the users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check what fields exist in enrollments and what values they have
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Then check actual enrollment data
SELECT 
  id,
  user_id,
  course_id,
  payment_status,
  enrolled_at,
  enrolled_original_price,
  enrolled_price,
  price
FROM enrollments 
LIMIT 5;

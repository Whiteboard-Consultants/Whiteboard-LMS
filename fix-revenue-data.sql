-- Update enrollments with course pricing information
-- This fixes the revenue analytics by populating enrolled_original_price from course prices

UPDATE enrollments e
SET enrolled_original_price = c.price
FROM courses c
WHERE e.course_id = c.id
  AND e.enrolled_original_price IS NULL
  AND c.price > 0;

-- Verify the update worked
SELECT 
  COUNT(*) as total_enrollments,
  SUM(CASE WHEN enrolled_original_price > 0 THEN 1 ELSE 0 END) as with_prices,
  SUM(enrolled_original_price) as total_revenue_if_all_paid,
  MAX(enrolled_original_price) as max_price,
  MIN(enrolled_original_price) as min_price
FROM enrollments;

-- Show breakdown by payment status
SELECT 
  payment_status,
  COUNT(*) as enrollment_count,
  SUM(enrolled_original_price) as revenue_if_calculated
FROM enrollments
GROUP BY payment_status;

-- Show which courses have enrollments and their prices
SELECT 
  c.id,
  c.title,
  c.price,
  COUNT(e.id) as enrollment_count,
  SUM(CASE WHEN e.payment_status = 'paid' THEN e.enrolled_original_price ELSE 0 END) as paid_revenue
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title, c.price
ORDER BY enrollment_count DESC;

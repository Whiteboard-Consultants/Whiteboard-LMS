-- 🧹 Clean up duplicate RLS policies
-- You have multiple policies doing the same thing - keep just one set

-- ❌ Remove old/duplicate policy names (keep "their own" versions)
DROP POLICY IF EXISTS "Users can add to own test cart" ON public.test_carts;
DROP POLICY IF EXISTS "Users can view own test cart" ON public.test_carts;
DROP POLICY IF EXISTS "Users can delete from own test cart" ON public.test_carts;

-- ✅ Verify final state - should show exactly 4 policies
SELECT 
  policyname,
  permissive,
  CASE 
    WHEN qual IS NOT NULL AND with_check IS NULL THEN 'SELECT/DELETE/UPDATE'
    WHEN qual IS NULL AND with_check IS NOT NULL THEN 'INSERT'
    ELSE 'MIXED'
  END as policy_type
FROM pg_policies 
WHERE tablename = 'test_carts'
ORDER BY policyname;

-- Expected output: 4 rows
-- - Users can add to their own test cart (INSERT)
-- - Users can remove from their own test cart (DELETE)
-- - Users can update their own test cart (UPDATE)
-- - Users can view their own test carts (SELECT)

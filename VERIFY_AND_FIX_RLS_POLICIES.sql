-- ✅ Step 1: Enable RLS on test_carts table (if not already enabled)
ALTER TABLE public.test_carts ENABLE ROW LEVEL SECURITY;

-- ✅ Step 2: Check current policies (verify these exist)
-- Run this to see what policies are already set up:
-- SELECT * FROM pg_policies WHERE tablename = 'test_carts';

-- ✅ Step 3: DROP old policies if they exist (run these if policies are wrong)
DROP POLICY IF EXISTS "Users can view their own test carts" ON public.test_carts;
DROP POLICY IF EXISTS "Users can add to their own test cart" ON public.test_carts;
DROP POLICY IF EXISTS "Users can remove from their own test cart" ON public.test_carts;
DROP POLICY IF EXISTS "Users can update their own test cart" ON public.test_carts;

-- ✅ Step 4: CREATE RLS Policies (correct ones)
CREATE POLICY "Users can view their own test carts"
  ON public.test_carts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own test cart"
  ON public.test_carts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own test cart"
  ON public.test_carts
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own test cart"
  ON public.test_carts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ✅ Verification: Check that policies are now created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'test_carts'
ORDER BY policyname;

-- Expected output: 4 rows (SELECT, INSERT, DELETE, UPDATE policies)

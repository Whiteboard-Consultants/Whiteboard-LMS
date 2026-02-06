-- ============================================================================
-- Phase 1: Series Package Support
-- Adds pricing and purchase tracking for test series packages
-- ============================================================================

-- Step 1: Add pricing fields to test_series table
ALTER TABLE public.test_series 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_purchasable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS discount_percentage INT DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.test_series.price IS 'Package price for entire series. NULL means series tests are only sold individually.';
COMMENT ON COLUMN public.test_series.is_purchasable IS 'Whether this series can be purchased as a package.';
COMMENT ON COLUMN public.test_series.discount_percentage IS 'Discount percentage when buying series vs individual tests (e.g., 10 = 10% off).';

-- Step 2: Extend enrollments table to support series-level purchases
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.test_series(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS purchase_type VARCHAR(50) DEFAULT 'individual' CHECK (purchase_type IN ('individual', 'series_package')),
ADD COLUMN IF NOT EXISTS series_purchase_date TIMESTAMP DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.enrollments.series_id IS 'If purchase_type is series_package, references the series purchased.';
COMMENT ON COLUMN public.enrollments.purchase_type IS 'Type of purchase: individual_test or series_package.';
COMMENT ON COLUMN public.enrollments.series_purchase_date IS 'When series package was purchased (for analytics).';

-- Step 3: Create index for faster series purchase lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_series_purchase 
ON public.enrollments(user_id, series_id, purchase_type) 
WHERE purchase_type = 'series_package';

-- Step 4: Create index for test access via series
CREATE INDEX IF NOT EXISTS idx_enrollments_user_series 
ON public.enrollments(user_id, series_id) 
WHERE series_id IS NOT NULL;

-- Step 5: Add helper function to check if user has access to test
-- (either direct enrollment or through series purchase)
DROP FUNCTION IF EXISTS public.user_has_test_access(uuid, uuid);

CREATE OR REPLACE FUNCTION public.user_has_test_access(p_user_id uuid, p_test_id uuid)
RETURNS BOOLEAN AS $$
DECLARE
  v_series_id uuid;
  v_has_direct_access BOOLEAN;
  v_has_series_access BOOLEAN;
BEGIN
  -- Check if user has direct access to test
  SELECT EXISTS(
    SELECT 1 FROM public.enrollments 
    WHERE user_id = p_user_id 
    AND test_id = p_test_id 
    AND purchase_type = 'individual'
  ) INTO v_has_direct_access;
  
  IF v_has_direct_access THEN
    RETURN TRUE;
  END IF;
  
  -- Get series_id of the test
  SELECT series_id INTO v_series_id FROM public.tests WHERE id = p_test_id;
  
  IF v_series_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has series purchase access
  SELECT EXISTS(
    SELECT 1 FROM public.enrollments 
    WHERE user_id = p_user_id 
    AND series_id = v_series_id 
    AND purchase_type = 'series_package'
  ) INTO v_has_series_access;
  
  RETURN v_has_series_access;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 6: RLS Policies for series purchases

-- Allow users to view their own series purchases
DROP POLICY IF EXISTS "Users can view their series purchases" ON public.enrollments;
CREATE POLICY "Users can view their series purchases" ON public.enrollments
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Allow series package enrollment creation
DROP POLICY IF EXISTS "Series package purchases" ON public.enrollments;
CREATE POLICY "Series package purchases" ON public.enrollments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Step 7: Create view for series with stats
DROP VIEW IF EXISTS public.series_with_stats CASCADE;

CREATE VIEW public.series_with_stats AS
SELECT 
  ts.id,
  ts.title,
  ts.description,
  ts.topic_area,
  ts.instructor_id,
  ts.is_published,
  ts.price,
  ts.is_purchasable,
  ts.discount_percentage,
  COUNT(t.id) as test_count,
  COUNT(DISTINCT e.user_id) as total_buyers,
  SUM(CASE WHEN e.purchase_type = 'series_package' THEN 1 ELSE 0 END) as series_package_buyers
FROM public.test_series ts
LEFT JOIN public.tests t ON t.series_id = ts.id
LEFT JOIN public.enrollments e ON (
  (e.test_id = t.id AND e.purchase_type = 'individual')
  OR (e.series_id = ts.id AND e.purchase_type = 'series_package')
)
GROUP BY ts.id, ts.title, ts.description, ts.topic_area, ts.instructor_id, 
         ts.is_published, ts.price, ts.is_purchasable, ts.discount_percentage;

-- Step 8: Data validation - ensure series package pricing makes sense
-- (Prices should be less than sum of individual test prices)

CREATE OR REPLACE FUNCTION validate_series_pricing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price IS NOT NULL AND NEW.is_purchasable = true THEN
    -- Get sum of individual test prices in this series
    DECLARE
      v_individual_sum DECIMAL(10, 2);
    BEGIN
      SELECT COALESCE(SUM(price), 0) INTO v_individual_sum 
      FROM public.tests 
      WHERE series_id = NEW.id;
      
      -- Series price should be less than individual sum (to incentivize bulk purchase)
      IF NEW.price >= v_individual_sum AND v_individual_sum > 0 THEN
        RAISE WARNING 'Series price (₹%) should be less than sum of individual test prices (₹%)', 
          NEW.price, v_individual_sum;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS series_pricing_validation ON public.test_series;
CREATE TRIGGER series_pricing_validation
  BEFORE INSERT OR UPDATE ON public.test_series
  FOR EACH ROW
  EXECUTE FUNCTION validate_series_pricing();

-- Step 9: Migration notes and documentation
-- 
-- USAGE:
-- ------
-- 
-- 1. Creating a Series Package:
--    UPDATE test_series 
--    SET price = 999, is_purchasable = true, discount_percentage = 10
--    WHERE id = '<series-id>';
--
-- 2. Recording Individual Test Purchase:
--    INSERT INTO enrollments (user_id, test_id, purchase_type, status)
--    VALUES ('<user-id>', '<test-id>', 'individual', 'active');
--
-- 3. Recording Series Package Purchase:
--    INSERT INTO enrollments (user_id, series_id, purchase_type, status, series_purchase_date)
--    VALUES ('<user-id>', '<series-id>', 'series_package', 'active', NOW());
--
-- 4. Check if user has test access:
--    SELECT public.user_has_test_access('<user-id>', '<test-id>');
--
-- 5. Get series with stats:
--    SELECT * FROM series_with_stats WHERE is_published = true ORDER BY test_count DESC;

COMMIT;

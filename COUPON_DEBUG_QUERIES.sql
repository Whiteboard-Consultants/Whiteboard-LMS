-- ============================================================================
-- COUPON VALIDATION DEBUG & DIAGNOSTIC QUERIES
-- ============================================================================
-- Run these in Supabase SQL Editor to diagnose the FAMILY100 coupon issue

-- ============================================================================
-- 1. CHECK COUPON DATA
-- ============================================================================

-- See the actual FAMILY100 record
SELECT 
    id,
    code,
    type,
    value,
    is_active,
    expires_at,
    usage_limit,
    usage_count,
    created_at,
    updated_at
FROM public.coupons 
WHERE UPPER(code) = 'FAMILY100';

-- Check all coupons and their status
SELECT 
    code,
    is_active,
    expires_at,
    CASE 
        WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'EXPIRED'
        WHEN is_active = false THEN 'INACTIVE'
        WHEN usage_limit IS NOT NULL AND usage_count >= usage_limit THEN 'LIMIT_REACHED'
        ELSE 'VALID'
    END as status
FROM public.coupons
ORDER BY created_at DESC;

-- ============================================================================
-- 2. CHECK RLS POLICIES
-- ============================================================================

-- List all policies on coupons table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'coupons';

-- Check if RLS is enabled on coupons table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'coupons';

-- ============================================================================
-- 3. TEST WHAT ANONYMOUS USERS CAN SEE
-- ============================================================================

-- Simulate what an anonymous (unauthenticated) user sees
-- This runs with no auth context, similar to the API endpoint
SELECT 
    code,
    is_active,
    value,
    type
FROM public.coupons 
WHERE UPPER(code) = 'FAMILY100';

-- If above returns no results, the RLS policy is blocking it
-- Check which coupons ARE visible to anonymous users:
SELECT 
    code, 
    is_active, 
    value,
    type
FROM public.coupons;

-- ============================================================================
-- 4. VERIFY GRANTS
-- ============================================================================

-- Check what permissions different roles have
SELECT 
    grantee,
    privilege_type,
    is_grantable 
FROM information_schema.role_table_grants 
WHERE table_name = 'coupons';

-- ============================================================================
-- 5. FIX: ACTIVATE FAMILY100 COUPON (if is_active = false)
-- ============================================================================

-- Option 1: Activate the coupon
UPDATE public.coupons 
SET is_active = true 
WHERE UPPER(code) = 'FAMILY100';

-- Option 2: If coupon expired, update expiration date
UPDATE public.coupons 
SET expires_at = NOW() + INTERVAL '90 days'
WHERE UPPER(code) = 'FAMILY100';

-- Option 3: Reset usage count if limit was reached
UPDATE public.coupons 
SET usage_count = 0
WHERE UPPER(code) = 'FAMILY100';

-- ============================================================================
-- 6. FIX: VERIFY THE UPDATE
-- ============================================================================

-- Verify FAMILY100 is now accessible
SELECT 
    code,
    is_active,
    expires_at,
    usage_count,
    usage_limit
FROM public.coupons 
WHERE UPPER(code) = 'FAMILY100';

-- ============================================================================
-- 7. OPTIONAL: SIMPLIFY RLS POLICY (Recommended)
-- ============================================================================

-- Current policy is too restrictive for public coupon validation.
-- Consider removing the is_active check from RLS and let the app validate it.

-- Check current policy
SELECT pg_get_expr(polqual, polrelid) as policy_condition
FROM pg_policy 
WHERE polname = 'Anyone can view active coupons' 
AND polrelid = 'public.coupons'::regclass;

-- Option: Drop restrictive policy and create permissive one
-- DROP POLICY "Anyone can view active coupons" ON public.coupons;
-- CREATE POLICY "Anyone can view coupons for validation" ON public.coupons
--     FOR SELECT USING (true);

-- Then update the API to use supabaseAdmin (service_role) for queries
-- See COUPON_FIX_ROUTE.ts for the corrected API endpoint

-- ============================================================================
-- 8. DEBUG: Check if service role works
-- ============================================================================

-- This would need to be run with service_role key context
-- Just for documentation purposes - service_role bypasses all RLS

-- When using supabaseAdmin with service_role key, it would see:
SELECT COUNT(*) as total_coupons FROM public.coupons;
SELECT * FROM public.coupons WHERE UPPER(code) = 'FAMILY100';


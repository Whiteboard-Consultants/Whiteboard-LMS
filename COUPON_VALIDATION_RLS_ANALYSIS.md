# Coupon Validation API - RLS Analysis & Root Cause

## Executive Summary
The coupon validation API failing for "FAMILY100" is likely due to either:
1. **The coupon's `is_active` status is FALSE** (most likely cause)
2. **Authentication context issue** when calling the API from client-side
3. **RLS policy configuration conflict**

---

## Current RLS Configuration

### File: `/sql/create-coupons-table.sql`

**Table Creation:**
```sql
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER CHECK (usage_limit > 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Status:** ✅ **ENABLED** (via `ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;`)

**RLS Policies Present:**

1. **"Anyone can view active coupons" (SELECT)**
   ```sql
   CREATE POLICY "Anyone can view active coupons" ON public.coupons
       FOR SELECT USING (is_active = true);
   ```
   - **Scope:** SELECT queries only
   - **Condition:** `is_active = true` (restrictive - blocks inactive coupons)
   - **Applies to:** All users (authenticated, anonymous)

2. **"Admin users can manage coupons" (ALL)**
   ```sql
   CREATE POLICY "Admin users can manage coupons" ON public.coupons
       FOR ALL USING (
           EXISTS (
               SELECT 1 FROM public.users 
               WHERE id = auth.uid() AND role = 'admin'
           )
       );
   ```
   - **Scope:** ALL operations (SELECT, INSERT, UPDATE, DELETE)
   - **Logic:** Requires user to exist in users table with role = 'admin'

**Permissions Granted:**
```sql
GRANT SELECT ON public.coupons TO authenticated;
GRANT SELECT ON public.coupons TO anon;
GRANT ALL ON public.coupons TO service_role;
```

---

## API Endpoint Analysis

### File: `/src/app/api/validate-coupon/route.ts`

**Current Implementation:**
```typescript
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { couponCode } = await request.json();
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.toUpperCase())
    .single();
    
  if (error || !data) {
    return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
  }
  // ... rest of validation
}
```

**Issue:** Uses unauthenticated `supabase` client (ANON key)

### File: `/src/lib/supabase.ts`

**Client Configuration:**
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : null,
  }
});

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, ...) 
  : null;
```

**Problem:**
- The `supabase` client created with `anonKey` works in browser context with localStorage session
- When called from API route on server-side, **no session context exists**
- Server-side queries with anon key are treated as **unauthenticated**
- RLS policies still apply: "Anyone can view active coupons" requires `is_active = true`

---

## Root Causes Identified

### ✗ **Problem 1: RLS Policy is Too Restrictive (LIKELY)**
The SELECT policy only allows viewing coupons where `is_active = true`. 

**If FAMILY100 has `is_active = false`:**
- RLS blocks the SELECT query
- Supabase returns: ` .single()` error (no rows returned)
- API responds: "Invalid coupon code"

**Check in Supabase:**
```sql
-- Run this in Supabase SQL Editor to diagnose
SELECT code, is_active, expires_at, usage_count, usage_limit 
FROM public.coupons 
WHERE code = 'FAMILY100';
```

---

### ✗ **Problem 2: Using Anonymous Client in Server Context**
The API uses the anon-key `supabase` client on the server-side where there's no session.

Current flow:
1. Browser calls `/api/validate-coupon` with coupon code
2. API endpoint runs on server
3. Uses `supabase` client (anon key, no session)
4. Query treated as unauthenticated
5. RLS applies: only rows with `is_active = true` visible

**This works IF `is_active = true`, but is suboptimal security.**

---

### ✗ **Problem 3: Multiple RLS Policies Could Cause Conflicts**
Two policies on the same table:
1. "Anyone can view active coupons" (SELECT, condition: `is_active = true`)
2. "Admin users can manage coupons" (ALL operations, admin-only)

Policy logic: **DENY by default, then allow if ANY policy permits**
- If a user is NOT admin AND coupon `is_active = true` → SELECT allowed ✓
- If a user is NOT admin AND coupon `is_active = false` → SELECT denied ✗
- If a user IS admin → All admin policies apply ✓

---

## Verification Checklist

- [ ] Run SQL check to verify `FAMILY100` exists and its `is_active` status
- [ ] Check if other coupons in the database have `is_active = true` (do they work?)
- [ ] Test with a known-active coupon code from admin panel
- [ ] Verify Supabase project has no conflicting RLS policies (check "Authentication" → "Policies")
- [ ] Check Supabase audit logs for the failed query (see actual error)
- [ ] Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly

---

## Recommended Fixes

### Fix Option 1: Fix Coupon Data (FASTEST)
```sql
-- Update the FAMILY100 coupon to be active
UPDATE public.coupons 
SET is_active = true 
WHERE code = 'FAMILY100';
```

### Fix Option 2: Use Service Role on Server-Side (BETTER)
In `/src/app/api/validate-coupon/route.ts`:
```typescript
// Use supabaseAdmin (service_role key) to bypass RLS on server-side
const client = supabaseAdmin || supabase; // fallback if not available

const { data, error } = await client
  .from('coupons')
  .select('*')
  .eq('code', couponCode.toUpperCase())
  .single();
```

**Rationale:** 
- Service role bypasses RLS (safe on server-side)
- No need for RLS policy condition `is_active = true` to be TRUE
- More secure than anon key for server operations
- Still validates coupon state in application logic

### Fix Option 3: Simplify RLS Policy (BEST PRACTICE)
```sql
-- Option A: Remove restrictive SELECT condition for anon users
-- Let application layer validate is_active, expires_at, etc.
DROP POLICY "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view coupons" ON public.coupons
    FOR SELECT USING (true);

-- Then use supabaseAdmin on server-side (addresses Fix Option 2)
```

---

## Files Found During Investigation

1. **Table Definition:** `/sql/create-coupons-table.sql` (lines 1-60)
2. **API Endpoint:** `/src/app/api/validate-coupon/route.ts`
3. **Supabase Config:** `/src/lib/supabase.ts`
4. **RLS Status:** ✅ Properly enabled on coupons table
5. **No conflicting cleanup scripts** - coupons table RLS not disabled anywhere

---

## Summary of Findings

| Finding | Status | Details |
|---------|--------|---------|
| Coupons table exists | ✅ | `/sql/create-coupons-table.sql` |
| RLS enabled on coupons | ✅ | `ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY` |
| SELECT policy exists | ✅ | "Anyone can view active coupons" |
| Conflicting policies | ❌ | No DROP/CREATE conflicts found |
| Admin policy exists | ✅ | "Admin users can manage coupons" |
| RLS disabled on coupons | ❌ | NOT found in any disable scripts |
| Multiple SELECT policies | ❌ | Only one SELECT policy exists |
| **API uses anon key** | ⚠️ | Should use supabaseAdmin on server |
| **Likely root cause** | ⚠️ | `FAMILY100` has `is_active = false` |


# ✅ Table Exists! Now Verify RLS Policies

Good news: The `test_carts` table already exists in Supabase. ✅

Now we need to verify that **Row-Level Security (RLS)** policies are correctly set up. This is what was likely causing the 409 error.

---

## Quick Status Check

1. **Table Exists?** ✅ YES - Schema shows it's created
2. **RLS Enabled?** ⚠️ NEED TO VERIFY
3. **RLS Policies?** ⚠️ NEED TO VERIFY

---

## Step 1: Verify RLS Status in Supabase

### Option A: Via Supabase Dashboard (Visual)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your WhitedgeLMS project
3. Click **Table Editor** (left sidebar)
4. Click on `test_carts` table
5. Look for **RLS** toggle button at the top
   - ✅ If it's **ON** (blue) → RLS is enabled
   - ❌ If it's **OFF** (gray) → Need to enable it

### Option B: Via SQL Editor (Verify Policies)
1. Go to **SQL Editor**
2. Click **New Query**
3. Run this query:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive
FROM pg_policies 
WHERE tablename = 'test_carts'
ORDER BY policyname;
```

**Expected Result (4 rows):**
```
schemaname | tablename | policyname                            | permissive
------------|-----------|---------------------------------------|----------
public     | test_carts | Users can add to their own test cart | t
public     | test_carts | Users can remove from their own test cart | t
public     | test_carts | Users can update their own test cart | t
public     | test_carts | Users can view their own test carts | t
```

If you see **4 policies** → ✅ Everything is correct  
If you see **0-3 policies** → ⚠️ Need to run the fix script

---

## Step 2: Fix Missing Policies (If Needed)

If RLS is disabled or policies are missing, run the SQL from `VERIFY_AND_FIX_RLS_POLICIES.sql`:

### In Supabase SQL Editor:
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `VERIFY_AND_FIX_RLS_POLICIES.sql`
4. Paste it into the editor
5. Click **Execute** (▶️) or press `Ctrl+Enter`

### What This Does:
```sql
-- Enables RLS (safe to run multiple times)
ALTER TABLE public.test_carts ENABLE ROW LEVEL SECURITY;

-- Drops old/incorrect policies (safe)
DROP POLICY IF EXISTS ... ON public.test_carts;

-- Creates 4 new correct policies:
-- 1. SELECT - Users see only their own cart
-- 2. INSERT - Users add only to their own cart
-- 3. DELETE - Users delete only from their own cart  
-- 4. UPDATE - Users update only their own cart
```

---

## Step 3: Verify the Fix

After running the script, run this verification query:

```sql
SELECT 
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'test_carts'
ORDER BY policyname;
```

You should see 4 policies, all with `qual` containing `auth.uid() = user_id`.

---

## Why RLS Matters

Without RLS policies, the database doesn't know who can do what:

| Scenario | Without RLS | With RLS |
|----------|-------------|----------|
| User A inserts item | ✅ Works | ✅ Works (user_id = auth.uid()) |
| User B sees User A's cart | ❌ Bug! | ✅ Blocked (user_id ≠ auth.uid()) |
| User B deletes User A's item | ❌ Security hole! | ✅ Blocked (user_id ≠ auth.uid()) |

---

## Testing After Fix

Once RLS policies are set up:

1. **Log in as User A**
2. **Add test to cart**
   - Check Supabase: Should see 1 row with User A's `user_id`
3. **Check `/student/test-cart`**
   - Should see the item
4. **Switch to User B (different login)**
5. **Check `/student/test-cart` as User B**
   - ✅ Should NOT see User A's items (RLS blocking)
6. **Add test to cart as User B**
   - Should only see User B's items

---

## Error Messages Explained

| Error | Cause | Fix |
|-------|-------|-----|
| `relation "test_carts" already exists` | Table exists (expected) | ✅ No action needed |
| `Failed to add to test cart: {}` | RLS blocking insert | Run VERIFY_AND_FIX_RLS_POLICIES.sql |
| `permission denied for schema public` | RLS enabled but policies missing | Run VERIFY_AND_FIX_RLS_POLICIES.sql |
| `42P01: relation "test_carts" does not exist` | Table not created | Run CREATE TABLE script |

---

## Success Checklist

After completing these steps, verify:

- ✅ Table `test_carts` exists in Supabase
- ✅ RLS is **enabled** on the table
- ✅ 4 RLS policies exist:
  - `Users can view their own test carts` (SELECT)
  - `Users can add to their own test cart` (INSERT)
  - `Users can remove from their own test cart` (DELETE)
  - `Users can update their own test cart` (UPDATE)
- ✅ All policies have condition: `auth.uid() = user_id`
- ✅ No console 409 errors when adding to cart
- ✅ Console shows: `✅ Item added to test cart successfully`

---

## File Reference

Run this SQL to verify and fix:
→ `/VERIFY_AND_FIX_RLS_POLICIES.sql`

---

**Next Action:** Run the SQL above in Supabase SQL Editor to ensure RLS is properly configured.

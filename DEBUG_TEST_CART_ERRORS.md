# 🔍 Debug Guide: Test Cart Error Messages

## Issue: Empty Error Object `{}`

When adding items to test cart, you see:
```
Supabase error adding to test cart: {}
```

This empty object means the Supabase error doesn't have helpful details. Here's how to diagnose:

---

## Step 1: Check Browser Console

1. Open **DevTools** → **Console** tab
2. Look for logs with emoji prefixes:
   - ❌ = Error occurred
   - ⚠️ = Fallback was used
   - ✅ = Success

### Expected Success Logs
```
✅ Item added to test cart successfully
```

### Fallback Logs (Table Missing)
```
⚠️ test_carts table not ready or RLS issue, using localStorage fallback
✅ Item added to test cart successfully (via localStorage)
```

### Detailed Error Logs
```
❌ Supabase error details: {
  message: "relation "public.test_carts" does not exist"
  code: "42P01"
  status: 404
  hint: null
  details: null
  fullError: {...}
}
```

---

## Step 2: Decode the Error Code

When you see an error, look at the **code** field:

| Code | Meaning | Solution |
|------|---------|----------|
| `42P01` | Table doesn't exist | Create test_carts table (see CRITICAL_STEP_CREATE_TEST_CARTS_TABLE.md) |
| `42000` | Permission denied (RLS) | Check RLS policies on test_carts table |
| `42883` | Function not found | Check Supabase schema |
| `null` or missing | Network/parsing error | Check Supabase connection |

---

## Step 3: Check Supabase Table Status

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select WhitedgeLMS project
3. Click **Table Editor**

### ✅ Table Exists?
- Look for `test_carts` in the list
- Click it to see structure

### ✅ Table Has Data?
- Click `test_carts`
- Should see columns: `id`, `user_id`, `test_id`, etc.
- Check if there are any rows

### ✅ RLS Enabled?
- Click `test_carts`
- Look for **RLS** button (should show 4 policies)
- Policies should be:
  1. SELECT: `auth.uid() = user_id`
  2. INSERT: `auth.uid() = user_id`
  3. DELETE: `auth.uid() = user_id`
  4. UPDATE: `auth.uid() = user_id`

---

## Step 4: Manual Test in SQL Editor

1. Go to **SQL Editor**
2. Run this query:
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'test_carts'
) AS table_exists;
```

Expected result: `table_exists = true`

---

## Step 5: Test Cart Operations

### Test Insert (Add to Cart)
```sql
INSERT INTO public.test_carts (
  user_id,
  test_id,
  test_title,
  test_price,
  test_type
) VALUES (
  'YOUR_USER_ID_HERE',
  'test-123',
  'Sample Test',
  199,
  'individual'
);
```

If this fails, check:
- ✅ Column names match schema
- ✅ Data types are correct (UUID for user_id)
- ✅ user_id is valid in auth.users

### Test Select (See Cart Items)
```sql
SELECT * FROM public.test_carts 
WHERE user_id = 'YOUR_USER_ID_HERE';
```

If this returns nothing:
- ✅ No items added yet
- ✅ Or RLS is blocking (need to run as authenticated user)

### Test Delete (Remove from Cart)
```sql
DELETE FROM public.test_carts 
WHERE user_id = 'YOUR_USER_ID_HERE' 
AND test_id = 'test-123';
```

---

## Console Error Messages & Solutions

### Error: `relation "public.test_carts" does not exist`
```
Code: 42P01
Solution: Create test_carts table
Steps: See CRITICAL_STEP_CREATE_TEST_CARTS_TABLE.md
```

### Error: `permission denied for schema public`
```
Code: 42000
Solution: Check RLS policies or Supabase role
Steps: Run SQL editor test above
```

### Error: `[object Object]` (circular reference)
```
Solution: Improved error logging now shows details
Check console for: "❌ Supabase error details:"
```

### Error: Network timeout
```
Solution: 
1. Check internet connection
2. Check Supabase project status
3. Check CORS in browser DevTools Network tab
```

---

## Live Testing Workflow

### Scenario 1: Add to Cart as Logged-In User
1. Load test page (any paid test)
2. Log in if needed
3. Click "Add to Cart"
4. Check console for:
   - ✅ OR ⚠️ logs
   - Details about what happened
5. Check Supabase `test_carts` table
   - Should have new row with your user_id

### Scenario 2: Add to Cart as Guest
1. Load test page
2. Click "Add to Cart" WITHOUT logging in
3. Should redirect to login
4. After login, should auto-add to cart
5. Check console for:
   - Redirect log
   - Auto-add log
   - Success or fallback log

### Scenario 3: Remove from Cart
1. Go to `/student/test-cart`
2. Click trash icon on item
3. Check console for:
   - ✅ `Item removed from test cart`
4. Item should disappear from cart
5. Check Supabase: row should be deleted

---

## Improved Error Logging Structure

All cart operations now log in this format:

```javascript
// Success
console.log("✅ Item added to test cart successfully");

// Error with Details
console.error("❌ Supabase error details:", {
  message: "...",        // Human-readable error
  code: "42P01",        // PostgreSQL error code
  status: 404,          // HTTP status
  hint: "...",          // Database hint
  details: "...",       // Extra details
  fullError: {...}      // Complete error object
});

// Fallback Used
console.warn("⚠️ test_carts table not ready or RLS issue, using localStorage fallback");
```

---

## If Table is Missing

The system will:
1. **Log**: `⚠️ test_carts table not ready or RLS issue, using localStorage fallback`
2. **Fallback**: Use `localStorage` temporarily
3. **Continue**: Item gets added anyway (to localStorage)
4. **Result**: ✅ Cart still works (guest mode)

This is intentional fallback behavior - system gracefully degrades.

---

## Next Steps if Still Seeing Errors

1. **Copy exact error message** from console
2. **Note the error code** (if shown)
3. **Check Supabase status**: Does `test_carts` table exist?
4. **Run SQL test** above to isolate issue
5. **Verify RLS policies** are correct

---

## Reset Checklist

If you want to completely reset test cart:

```bash
# Clear browser localStorage
localStorage.removeItem('testCart');

# In Supabase SQL Editor, clear all test_carts
DELETE FROM public.test_carts;

# Or drop and recreate table:
DROP TABLE public.test_carts CASCADE;
-- Then run SQL from CRITICAL_STEP_CREATE_TEST_CARTS_TABLE.md
```

---

## Still Stuck?

Look for this in console to debug:

```
❌ Supabase error details: {
  message: ???          ← What does this say?
  code: ???            ← What's the code?
  status: ???          ← What's the HTTP status?
}
```

The `message` field will tell you exactly what's wrong. Common ones:
- `relation "public.test_carts" does not exist` → Create table
- `permission denied` → Check RLS
- `violates unique constraint` → Item already in cart
- `invalid input syntax for type uuid` → user_id format wrong

---

**Last Updated:** 2026-02-05  
**Status:** Error logging improved in use-test-cart.tsx

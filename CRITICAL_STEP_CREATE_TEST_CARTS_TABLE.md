# ⚠️ CRITICAL: Create test_carts Table in Supabase

## Current Issue
The system is trying to auto-add tests to cart after login, but getting a **409 Conflict** error because the `test_carts` table **does not exist** in Supabase.

**Browser Log:**
```
Failed to load resource: the server responded with a status of 409
Error adding to test cart: Object
```

## Solution: Create the Table

### Step 1: Open Supabase SQL Editor
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your WhitedgeLMS project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy & Run This SQL
```sql
-- Create test_carts table for authenticated users
CREATE TABLE public.test_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL,
  test_title TEXT NOT NULL,
  test_price DECIMAL(10,2),
  test_type TEXT NOT NULL CHECK (test_type IN ('individual', 'series')),
  series_id UUID,
  test_image TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_test_per_user UNIQUE(user_id, test_id, test_type)
);

-- Create indexes for performance
CREATE INDEX idx_test_carts_user_id ON public.test_carts(user_id);
CREATE INDEX idx_test_carts_added_at ON public.test_carts(added_at);

-- Enable RLS
ALTER TABLE public.test_carts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own cart items
CREATE POLICY "Users can view their own test carts"
  ON public.test_carts
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert into their own cart
CREATE POLICY "Users can add to their own test cart"
  ON public.test_carts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete from their own cart
CREATE POLICY "Users can remove from their own test cart"
  ON public.test_carts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only update their own cart
CREATE POLICY "Users can update their own test cart"
  ON public.test_carts
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Step 3: Execute
Click the **Execute** button (▶️) or press `Ctrl+Enter`

### Step 4: Verify
You should see:
- ✅ Table created successfully
- ✅ Indexes created
- ✅ RLS enabled
- ✅ 4 RLS policies created

## What This Does

| Component | Purpose |
|-----------|---------|
| `user_id` | **Your user ID** - Makes cart ownership unambiguous |
| `test_id` | **Test ID** - What test is in the cart |
| `test_type` | **'individual' or 'series'** - Type of purchase |
| `UNIQUE constraint` | **Prevents duplicates** - Can't add same test twice |
| **RLS Policies** | **Security** - You can only see/modify your own cart |

## Testing

After creating the table:

1. **Go to test purchase page**
2. **Click "Add to Cart"** without logging in
   - ✅ Should redirect to login
3. **Log in**
   - ✅ Should auto-add to cart
   - ✅ Should show "Added to cart" toast
4. **Go to cart** (`/student/test-cart`)
   - ✅ Item should appear
5. **Check Supabase**
   - Go to **Table Editor** → `test_carts`
   - ✅ Should see your item with `user_id` set to your account

## Error Messages After Fix

### Before Creating Table
```
❌ Failed to load resource: 409
❌ Error adding to test cart
```

### After Creating Table
```
✅ User returned from login, auto-adding to cart
✅ Cart item added successfully
✅ Added to cart (toast message)
```

## If You Still Get 409

**Check these things:**

1. **Table created?**
   - Go to **Table Editor** in Supabase
   - Look for `test_carts` table
   - If missing → Run the SQL above

2. **RLS policies correct?**
   - Go to `test_carts` table
   - Click **RLS** button
   - Should show 4 policies (SELECT, INSERT, DELETE, UPDATE)
   - All should have `auth.uid() = user_id` condition

3. **User authenticated?**
   - Check browser DevTools Console
   - Look for auth logs: `Auth state change event: SIGNED_IN`
   - Check `userData?.id` exists

4. **Network issue?**
   - Refresh page
   - Try incognito mode
   - Check Supabase status dashboard

## FAQ

**Q: Will adding this table affect existing data?**
- A: No, it's a new table. All existing course cart data is in a different table.

**Q: Can guests use the cart?**
- A: Yes, they use localStorage. When they log in, it migrates to this database table.

**Q: What if the same test is added twice?**
- A: UNIQUE constraint prevents duplicates - you'll get a 409 error and item won't be added.

**Q: Do I need to do this on production Supabase too?**
- A: Yes, run the same SQL on your production database.

## Success Indicator

You'll know this is working when:
1. ✅ No more 409 errors in console
2. ✅ "Add to Cart" auto-executes after login
3. ✅ Items appear in cart immediately
4. ✅ Supabase shows items in test_carts table

---

**Status: CRITICAL** ⚠️  
**Action Required: Run SQL above in Supabase**  
**Without this step: Cart system will not work**

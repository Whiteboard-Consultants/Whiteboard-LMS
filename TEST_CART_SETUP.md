# Test Cart Database Setup

## Required Database Migration

The test cart system requires a new `test_carts` table in Supabase. This table stores test/series cart items for authenticated users.

### Setup Instructions

#### Option 1: Using Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Create test_carts table (similar to carts table but for tests/series)
CREATE TABLE IF NOT EXISTS public.test_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    test_id UUID NOT NULL,
    test_title TEXT NOT NULL,
    test_price DECIMAL(10,2) NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('individual', 'series')),
    series_id UUID,
    test_image TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_test_per_user UNIQUE(user_id, test_id, test_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_carts_user_id ON public.test_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_carts_test_id ON public.test_carts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_carts_added_at ON public.test_carts(added_at);

-- Enable RLS
ALTER TABLE public.test_carts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own test cart
CREATE POLICY "Users can view own test cart" ON public.test_carts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert into their own test cart
CREATE POLICY "Users can add to own test cart" ON public.test_carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own test cart
CREATE POLICY "Users can delete from own test cart" ON public.test_carts
    FOR DELETE USING (auth.uid() = user_id);
```

5. Click **Run** button (or press Cmd+Enter)
6. Verify the table and indexes are created

#### Option 2: Using SQL File

1. Copy the file at `/sql/create-test-carts-table.sql`
2. Open Supabase SQL Editor
3. Click **New Query**
4. Paste contents and run

### Verification

After creating the table, verify it exists:

1. Go to **Supabase Dashboard** → **Table Editor**
2. You should see `test_carts` table in the list
3. Click on it to verify the columns:
   - `id` (UUID)
   - `user_id` (UUID, references auth.users)
   - `test_id` (UUID)
   - `test_title` (TEXT)
   - `test_price` (DECIMAL)
   - `test_type` (TEXT - 'individual' or 'series')
   - `series_id` (UUID, nullable)
   - `test_image` (TEXT, nullable)
   - `added_at` (TIMESTAMP)

4. Check that indexes exist:
   - `idx_test_carts_user_id`
   - `idx_test_carts_test_id`
   - `idx_test_carts_added_at`

5. Check that RLS is enabled and policies exist

### Schema Details

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | References authenticated user, enables user isolation |
| `test_id` | UUID | ID of the test being purchased |
| `test_title` | TEXT | Title of the test (for display) |
| `test_price` | DECIMAL(10,2) | Price of the test in INR |
| `test_type` | TEXT | 'individual' or 'series' - determines purchase type |
| `series_id` | UUID | For series purchases, ID of the series |
| `test_image` | TEXT | URL to test image (optional) |
| `added_at` | TIMESTAMP | When item was added to cart |

#### Constraints

- **Primary Key:** `id`
- **Foreign Key:** `user_id` → `auth.users(id)` (enforces user must exist)
- **Unique:** `(user_id, test_id, test_type)` (prevents duplicate items per user)
- **Check:** `test_type IN ('individual', 'series')`

#### Row-Level Security (RLS)

Three policies enforce user data isolation:

1. **SELECT** - Users can only view their own cart items
   ```
   auth.uid() = user_id
   ```

2. **INSERT** - Users can only add items to their own cart
   ```
   auth.uid() = user_id
   ```

3. **DELETE** - Users can only remove items from their own cart
   ```
   auth.uid() = user_id
   ```

### Testing

After setup, test the functionality:

1. **As Guest User:**
   - Go to a test page without logging in
   - Click "Add to Cart"
   - Should show "Need to login" or add to localStorage
   - Cannot proceed to checkout

2. **As Authenticated User:**
   - Log in
   - Go to a test page
   - Click "Add to Cart"
   - Item should appear in `/student/test-cart`
   - Can proceed to checkout
   - After payment, cart is cleared
   - Check Supabase: row should appear in `test_carts` table with your user_id

3. **Multiple Devices:**
   - Log in on Device A, add test to cart
   - Check `/student/test-cart` on Device B
   - Same test should appear in cart (because it's in database, not localStorage)

### Rollback (If Needed)

If you need to delete the table:

```sql
DROP TABLE IF EXISTS public.test_carts;
```

This will delete the table and all cart data. Guest cart items in localStorage will remain until user clears browser data.

### Performance Notes

- **Indexes** are created on frequently queried columns (`user_id`, `test_id`, `added_at`)
- For typical user with <100 items, no performance issues
- If database grows large, consider archiving old cart items

### Security Notes

- ✅ RLS prevents users from seeing other users' carts
- ✅ Foreign key ensures cart items reference valid users
- ✅ Unique constraint prevents duplicate items in single cart
- ✅ Only app can insert/delete (not direct API access without auth)
- ✅ All queries use authenticated user context

### Troubleshooting

**Problem:** "Policy for operation INSERT was not found"
- **Solution:** Ensure RLS INSERT policy was created
- Run: `SELECT * FROM pg_policies WHERE tablename = 'test_carts';`

**Problem:** "Auth.uid() returns null"
- **Solution:** User is not authenticated
- Ensure you're logged in before accessing cart

**Problem:** Items don't persist after page reload
- **Cause:** RLS policy is not working or database table not created
- **Fix:** Verify table exists in Supabase and RLS policies are correct

**Problem:** Getting "violates unique constraint" error
- **Cause:** Trying to add duplicate (same test_id + user_id + test_type)
- **Expected behavior:** Prevent duplicate cart items
- **Fix:** User shouldn't try to add same item twice; clear cart first if needed

# Test Cart System - Implementation Summary

## What Was Changed

### Problem Identified
The original test cart implementation stored items only in **browser localStorage**, which created ambiguity:
- Guest users could add items without authentication
- Cart items weren't tied to any specific user account
- "Whose cart?" question was unclear from a security perspective

### Solution Implemented
Migrated test cart to a **database-backed system** (Supabase `test_carts` table), matching the course cart architecture:
- Authenticated users: items stored in database per user
- Guest users: items stored in localStorage temporarily
- Clear user isolation via Row-Level Security (RLS)
- Full feature parity with course cart system

---

## Files Created

### 1. **src/hooks/use-test-cart.tsx** (New)
- `TestCartProvider` - Context provider for test cart state
- `useTestCart()` - Hook to access test cart functions
- `addToTestCart()` - Add item to user's test cart
- `removeFromTestCart()` - Remove item from cart
- `clearTestCart()` - Clear all items from cart
- Guest fallback: Uses localStorage when user not authenticated

### 2. **sql/create-test-carts-table.sql** (New)
- Creates `test_carts` table in Supabase
- Defines columns: user_id, test_id, test_title, test_price, test_type, series_id, test_image, added_at
- Creates indexes for performance
- Implements RLS policies for user isolation
- **MUST BE RUN** in Supabase before using the system

### 3. **CART_SECURITY_DOCUMENTATION.md** (New)
- Comprehensive explanation of cart security model
- Answers "whose cart" question
- Shows user flows for authenticated vs guest users
- Compares course and test cart systems

### 4. **TEST_CART_SETUP.md** (New)
- Step-by-step database setup instructions
- SQL scripts ready to copy-paste
- Verification steps
- Troubleshooting guide

---

## Files Modified

### 1. **src/components/series-purchase-card.tsx**
- Added `useTestCart` hook import
- Updated `handleAddToCart()` to use database-backed cart
- Now calls `addToTestCart()` which:
  - Stores in Supabase if authenticated
  - Stores in localStorage if guest
  - Shows error if item already in cart

### 2. **src/app/student/test-cart/page.tsx**
- Updated to use `useTestCart` hook instead of local state
- Imports `TestCartItem` from hook
- Uses `removeFromTestCart()` to delete items
- Uses `clearTestCart()` after successful payment

### 3. **src/components/cart-nav.tsx**
- Updated to use `useTestCart` hook
- No longer needs to load from localStorage manually
- Automatically syncs with Supabase data
- Shows real-time cart counts

### 4. **src/app/layout.tsx**
- Added `TestCartProvider` import
- Wrapped children with `<TestCartProvider>`
- Now provides test cart context to entire app

---

## Database Schema

### New Table: `test_carts`

```
test_carts
├── id (UUID, PK) - Unique cart item ID
├── user_id (UUID, FK) - Which user owns this cart item
├── test_id (UUID) - Which test/series
├── test_title (TEXT) - For display
├── test_price (DECIMAL) - Price of item
├── test_type (TEXT) - 'individual' or 'series'
├── series_id (UUID) - For series purchases
├── test_image (TEXT) - For display
└── added_at (TIMESTAMP) - When added
```

**Constraints:**
- Foreign key: `user_id` → `auth.users(id)`
- Unique: `(user_id, test_id, test_type)` - prevents duplicates per user
- Check: `test_type IN ('individual', 'series')`

**RLS Policies:**
- Users can only SELECT/INSERT/DELETE their own cart items
- Database enforces: `auth.uid() = user_id`

---

## How It Works Now

### For Logged-In Users ✅

1. **Add to Cart**
   ```
   Click "Add to Cart" 
   → System detects user.id exists
   → Item inserted into test_carts table with user_id
   → Cart tied to your account
   ```

2. **View Cart**
   ```
   Navigate to /student/test-cart
   → useTestCart loads items from test_carts
   → Shows only YOUR items (RLS enforces this)
   → Can modify or checkout
   ```

3. **Checkout**
   ```
   Click "Proceed to Checkout"
   → Payment processed with your user_id
   → Enrollment created for your account
   → Cart cleared from test_carts table
   ```

### For Guest Users (Not Logged In) ⚠️

1. **Add to Cart**
   ```
   Click "Add to Cart" without logging in
   → System detects user.id is null
   → Item stored in browser localStorage
   → Cart is TEMPORARY (not in database)
   ```

2. **View Cart**
   ```
   Navigate to /student/test-cart
   → Check if authenticated
   → If not: "You must log in to checkout"
   → localStorage cart shows, but can't pay
   ```

3. **Checkout Blocked**
   ```
   Try to pay → redirected to login
   → After login: guest cart is lost (not merged)
   → User must re-add items or start fresh
   ```

---

## Security Features

### ✅ User Isolation (RLS)
- Each user only sees/modifies their own cart
- Database enforces at query level
- Cannot access other users' carts via API

### ✅ Duplicate Prevention
- UNIQUE constraint prevents adding same item twice
- Helpful error message when attempted

### ✅ Authentication Required
- Guest carts are temporary (localStorage only)
- Payment requires authentication
- No payment can be processed for guest users

### ✅ Data Persistence
- Authenticated users: survives page reloads, device switches, etc.
- Database stores permanently until checkout
- Guest users: survives until browser close or clear data

---

## Testing Checklist

Before deploying, verify:

- [ ] `test_carts` table created in Supabase
- [ ] All RLS policies created
- [ ] Indexes created
- [ ] TestCartProvider added to layout.tsx
- [ ] Build passes: `npm run build`
- [ ] Test as logged-in user:
  - [ ] Can add test to cart
  - [ ] Cart persists on page reload
  - [ ] Can remove item from cart
  - [ ] Can proceed to checkout
- [ ] Test as guest user:
  - [ ] Can add to cart (localStorage)
  - [ ] Cart shows but "Already in cart" prevents duplicates
  - [ ] Cannot proceed to checkout without login
- [ ] Cart UI shows correct count
- [ ] CartNav dropdown shows both carts
- [ ] Database grows when items added
- [ ] Database shrinks when items removed

---

## Deployment Notes

### 1. Create Database Table (Required)
```bash
# Run SQL from TEST_CART_SETUP.md in Supabase SQL Editor
# OR run the file: sql/create-test-carts-table.sql
```

### 2. Deploy Code
```bash
npm run build
git push  # Deploy as normal
```

### 3. Verify
- Test add-to-cart flow
- Check Supabase data appears in test_carts table
- Confirm RLS prevents cross-user access

### 4. Monitor
- Watch for RLS policy errors in logs
- Monitor database growth (cart data)
- Check payment completion still works

---

## Answer to Your Question

**"Whose cart is the program added to?"**

### Now With Database-Backed Cart:

**If Authenticated (Logged In):**
- Your cart in the **`test_carts` table**
- Identified by your `user_id`
- Only you can access it
- Persists across sessions and devices

**If Guest (Not Logged In):**
- Temporary **localStorage** storage
- Not tied to any user account
- Lost when browser closed
- Cannot be paid for

### Before (localStorage-only):
- Always temporary
- Not tied to user account
- Could be seen by other users on same device

---

## File Locations

- **Hook:** `src/hooks/use-test-cart.tsx`
- **Page:** `src/app/student/test-cart/page.tsx`
- **Component:** `src/components/series-purchase-card.tsx`
- **NavComponent:** `src/components/cart-nav.tsx`
- **Layout:** `src/app/layout.tsx`
- **SQL:** `sql/create-test-carts-table.sql`
- **Docs:** `CART_SECURITY_DOCUMENTATION.md`
- **Setup:** `TEST_CART_SETUP.md`

---

## Next Steps

1. **URGENT:** Run the SQL migration in Supabase to create `test_carts` table
2. Test the cart flow as authenticated user
3. Review CART_SECURITY_DOCUMENTATION.md for architecture details
4. Monitor database for any issues

---

## Questions?

Refer to:
- `CART_SECURITY_DOCUMENTATION.md` - How the security model works
- `TEST_CART_SETUP.md` - Database setup and troubleshooting
- Code comments in `src/hooks/use-test-cart.tsx` - Implementation details

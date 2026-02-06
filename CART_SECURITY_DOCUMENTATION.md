# Cart System Security & Design Documentation

## Overview

The WhitedgeLMS payment system has **two separate, but consistent cart systems**:

1. **Course Cart** - Database-backed (Supabase `carts` table)
2. **Test Cart** - Database-backed (Supabase `test_carts` table)

Both follow the same security pattern for clarity and user trust.

---

## Test Cart Security & Design

### Whose Cart Is Being Modified?

**Answer: The authenticated user's cart (stored in Supabase), or temporary guest cart (localStorage)**

#### For Authenticated Users:
- Cart items are stored in the **`test_carts` table in Supabase**
- Each row is tied to a specific `user_id` (from `auth.users`)
- Only that user can view, add, or remove their cart items
- **Row-Level Security (RLS)** enforces this with policies:
  ```sql
  CREATE POLICY "Users can view own test cart" ON public.test_carts
      FOR SELECT USING (auth.uid() = user_id);
  ```

#### For Guest Users (Not Logged In):
- Cart items are stored temporarily in **browser localStorage**
- This is a temporary, session-based storage
- When user logs in, they must merge this guest cart or start fresh
- When browser is closed or localStorage is cleared, guest cart is lost

---

## Database Schema

### test_carts Table

```sql
CREATE TABLE public.test_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),  -- WHO: Specific user
    test_id UUID NOT NULL,                             -- WHAT: Test ID
    test_title TEXT NOT NULL,                          
    test_price DECIMAL(10,2) NOT NULL,                
    test_type TEXT NOT NULL,  -- 'individual' or 'series'
    series_id UUID,           -- For series purchases
    test_image TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_test_per_user UNIQUE(user_id, test_id, test_type)
);
```

**Key Security Points:**
- `user_id` column ties cart to a specific user
- `UNIQUE(user_id, test_id, test_type)` prevents duplicates for same user
- RLS policies enforce user isolation

---

## User Flow & Cart Behavior

### Scenario 1: Authenticated User (Logged In)

1. User clicks "Add to Cart" on test
2. `useTestCart.addToTestCart()` is called
3. System detects `user.id` exists (authenticated)
4. Item is inserted into Supabase `test_carts` table with `user_id`
5. **Cart is now tied to that user's account**
6. User navigates to `/student/test-cart`
7. Page loads items from `test_carts` table for that user
8. Checkout processes payment and enrolls that specific user

**Security:**
- ✅ Item belongs to authenticated user
- ✅ Only that user can view/modify their cart
- ✅ Cart persists across sessions
- ✅ Multiple devices can sync (all hit same database)

### Scenario 2: Guest User (Not Logged In)

1. User clicks "Add to Cart" on test (without logging in)
2. `useTestCart.addToTestCart()` is called
3. System detects `user.id` is null (not authenticated)
4. Item is stored in browser **localStorage** under key `'testCart'`
5. **Cart is temporary, session-based**
6. User navigates to `/student/test-cart`
7. Toast warning should display: "You must be logged in to checkout"
8. User is redirected to login
9. After login, guest cart could be merged or cleared

**Security Concerns:**
- ⚠️ Temporary storage only (lost when browser closes)
- ⚠️ Not tied to any user account
- ⚠️ Other users on same device could see it
- ⚠️ Cannot proceed to checkout without authentication
- ✅ User must log in before payment

---

## The "Add to Cart" Issue From Screenshot

Looking at your screenshot showing "Already in cart" without login:

**What happened:**
1. You clicked "Add to Cart" as a guest user (not logged in)
2. Item was added to **browser localStorage**
3. You clicked "Add to Cart" again
4. System checked localStorage and found duplicate
5. Toast showed "Already in cart" error

**Important:** This guest cart is **NOT** stored in the database. It's temporary. When you:
- Close and reopen browser → cart is cleared
- Clear browser data → cart is deleted
- Log in on a different device → this cart doesn't follow you

---

## Checkout Flow (Cart to Payment)

### For Authenticated Users:

```
User → Add to Cart (stored in DB) → Checkout → Login (already done) 
  → Razorpay Payment → Verify Signature → Create Enrollment 
  → Clear Cart (from DB) → Success
```

### For Guest Users (Attempted):

```
User → Add to Cart (stored in localStorage) → Checkout 
  → Redirect to Login (because user.id is null) 
  → After Login, Choice:
     A) Retry checkout with fresh login
     B) Guest cart is NOT transferred (must re-add items)
```

---

## Preventing Guest Cart Abuse

### Current Implementation:
- Guest cart is temporary (localStorage only)
- No payment can be processed without authentication
- Guest cart is not tied to any account

### Potential Enhancement (Future):
```typescript
// Could implement: When user logs in, offer to merge guest cart
const mergeGuestCartToDatabase = async (userId: string) => {
  const guestCart = localStorage.getItem('testCart');
  if (guestCart) {
    const items = JSON.parse(guestCart);
    // Insert all items into test_carts table with new user_id
    // Show confirmation: "Found X items in your previous session. Add to cart?"
    // Clear localStorage after merge
  }
};
```

---

## Comparison: Course Cart vs Test Cart

Both follow identical patterns:

| Aspect | Course Cart | Test Cart |
|--------|------------|-----------|
| **Table** | `carts` | `test_carts` |
| **Auth'd Storage** | Supabase DB | Supabase DB |
| **Guest Storage** | localStorage | localStorage |
| **User ID** | `user_id` column | `user_id` column |
| **RLS Policies** | Yes | Yes |
| **Duplicate Check** | UNIQUE constraint | UNIQUE constraint |
| **Persistence** | Across sessions | Across sessions |

---

## Summary: Answering Your Question

**"Whose cart is the program added to?"**

**Answer:**
- **If logged in:** Your authenticated user account's cart (Supabase database)
- **If not logged in:** A temporary guest cart (browser localStorage) that:
  - Cannot be paid for without login
  - Is deleted when browser is closed or cleared
  - Is not tied to any user account

**Security Model:**
- ✅ **Authenticated users:** Full security, persistent, account-based
- ✅ **Guest users:** Temporary only, requires authentication for checkout
- ✅ **Row-Level Security:** Database enforces user isolation
- ✅ **No unauthorized access:** Can't access other users' carts

The "Already in cart" message you saw came from **localStorage** (guest cart), which proves the system correctly prevents duplicate guest items before they're saved to the database.

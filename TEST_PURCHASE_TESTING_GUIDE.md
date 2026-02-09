# Test Purchase Flow - Quick Testing Guide

## How to Test the Complete Purchase Flow

### Step 1: Access the Mock Tests Page
```
URL: http://localhost:3000/mock-tests/campus-recruitment
```

What you see:
- List of tests in the "Campus Recruitment" series
- Each test shows: title, duration, difficulty, price
- A light green box at bottom showing series offer: "Or get entire series for ₹600 (Save 20%)"

### Step 2: Click "Start" on a Test
```
Action: Click the "Start" button on any test card
Expected Result: 
  - Redirect to /test/{testId}
  - TestAccessGate component loads
  - Page shows purchase options if not authenticated or no access
```

### Step 3: View Purchase Page
```
URL: http://localhost:3000/test/{testId}
Expected Display:
  - Test title: "Quantitative Aptitude Mock Tests - 2"
  - Subtitle: "This test requires a purchase to access"
  - Green box with two pricing options:
    * Individual Test: ₹99
    * Full Series: ₹600 (Save 20%) ← Red "Save 20%" badge
  - Input field for coupon code
  - "What you get:" checklist with check marks:
    * Instant access to take this test
    * Unlimited attempts
    * Lifetime access (no expiration)
    * Detailed performance analytics
  - Two action buttons:
    * "Buy Individual Test" (green button with icon) 
    * "Add to Cart" (outline button)
```

### Step 4: Test Purchase Direct (Without Logging In)
```
Action: As guest user, click "Buy Individual Test"
Expected Flow:
  1. Warning shown: "Please log in to purchase"
  2. Redirected to login page
  3. After login, cart should have item if user started add to cart
```

### Step 5: Test Purchase (Logged In)
```
Prerequisites: 
  - User logged in as student
  - User has no prior purchase or course enrollment for this test

Action: Click "Buy Individual Test"
Flow:
  1. Payment options appear
  2. Click "Pay with Razorpay"
  3. Razorpay modal opens with amount ₹99
  4. (In test mode, payment succeeds automatically)
  5. After payment:
     - Toast notification: "Payment Successful!"
     - Database enrollment created for the test
     - TestAccessGate re-checks access
     - Page refreshes to show test taker interface
```

### Step 6: Test "Add to Cart" Feature
```
Prerequisites: User logged in

Action: Click "Add to Cart" button
Flow:
  1. Item added to test_carts database table
  2. Toast notification: "Added to Cart"
  3. Can add multiple tests
  4. Navigate to /student/test-cart to view cart
  5. See all items with remove options
  6. Click "Proceed to Checkout" for bulk payment
  7. Single payment processes all items
```

### Step 7: Test Course-Linked Test Access
```
Prerequisites:
  - Test linked to a course (course_id set in database)
  - User enrolled in that course with status 'active' or 'approved'

Test as Enrolled User:
  1. Click "Start" on test → /test/{testId}
  2. TestAccessGate checks access
  3. Finds user is enrolled in linked course
  4. Grants access automatically → Shows test taker
  5. No purchase page shown

Test as Non-Enrolled User:
  1. Click "Start" on test → /test/{testId}
  2. TestAccessGate checks access
  3. No course enrollment found
  4. Shows purchase page → User must buy
```

### Step 8: Test Series Package Purchase
```
When Individual Test and Series pricing both available:

Action: Select "Full Series" option
Display Changes:
  - Price changes from ₹99 to ₹600
  - "Save 20%" badge appears (if discount_percentage set)
  - Final price shown: ₹480 (with 20% discount)

Action: Click "Buy Full Series"
Result:
  - User gains access to entire series (all tests)
  - Single enrollment created with purchase_type: 'series_package'
  - All tests in series become accessible
```

## Testing Checklist

### Visual Elements ✓
- [ ] Test title displays correctly
- [ ] "Save X%" discount badge shows in red
- [ ] Price formatting: ₹ symbol with number
- [ ] Coupon code input field visible
- [ ] "What you get" checkmarks display
- [ ] Two action buttons properly styled

### Functionality ✓
- [ ] Clicking "Start" → Navigates to /test/{testId}
- [ ] Purchase page loads correctly
- [ ] Selecting "Individual Test" shows ₹99
- [ ] Selecting "Full Series" shows ₹600 with discount
- [ ] Coupon code input accepts text
- [ ] "Buy Individual Test" button initiates payment
- [ ] "Add to Cart" adds to test_carts table
- [ ] Payment completes successfully
- [ ] Post-payment redirects to test taker
- [ ] Cart persists across page reloads
- [ ] Course enrollment grants free access

### Database ✓
- [ ] tests table has test records
- [ ] test_series table has series records with prices
- [ ] tests.series_id links tests to series
- [ ] tests.course_id links tests to courses (optional)
- [ ] tests.price set for individual pricing
- [ ] test_series.discount_percentage set for offers
- [ ] enrollments created after purchase
- [ ] test_carts table stores cart items for authenticated users

### Edge Cases ✓
- [ ] Free test (price = 0) shows no purchase gate
- [ ] Test linked to course shows free access if enrolled
- [ ] Non-enrolled user sees purchase gate for course test
- [ ] Series-only test shows both individual and series prices
- [ ] Cart limits: Same item not added twice
- [ ] Guest user cart stored in localStorage
- [ ] Authenticated user cart in database

## Debugging Tips

### If Purchase Page Not Showing
```bash
# Check browser console for errors
# Check Network tab for failed API calls
# Verify test price is > 0 in database
```

### If Series Pricing Not Showing
```bash
# Check test has series_id assigned
# Check test_series table has that series with price
# Verify series.is_purchasable = true
```

### If Course Access Not Working
```bash
# Check test has course_id assigned
# Check user has enrollment with course_id
# Check enrollment status is 'active', 'approved', or 'completed'
# Look for course enrollment check in TestAccessGate logs
```

### Database Queries to Test

```sql
-- Check test setup
SELECT id, title, price, series_id, course_id 
FROM tests 
WHERE title LIKE '%Campus%Recruitment%';

-- Check series pricing
SELECT id, title, price, discount_percentage 
FROM test_series 
WHERE title LIKE '%Campus%Recruitment%';

-- Check user enrollments
SELECT id, test_id, series_id, course_id, status 
FROM enrollments 
WHERE user_id = '{user_id}';

-- Check cart items
SELECT * FROM test_carts WHERE user_id = '{user_id}';
```

## Expected File Structure

```
src/app/test/[testId]/
├── page.tsx ← Entry point (NEW)
    └── Renders TestAccessGate component

src/components/
├── test-access-gate.tsx ← Purchase gate logic
├── series-purchase-card.tsx ← Pricing display
├── payment-checkout.tsx ← Payment integration
└── test-taker.tsx ← Test interface

src/hooks/
└── use-test-cart.tsx ← Cart management

src/app/student/
└── test-cart/
    └── page.tsx ← Cart view & checkout
```

## Routes Summary

```
/mock-tests/campus-recruitment
    ↓ Click "Start"
/test/{testId} ← NEW ROUTE
    ↓ Shows purchase page with SeriesPurchaseCard
    ↓ After purchase, shows TestTaker component
/student/test-cart
    ↓ View cart, manage items, checkout
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/test/[testId]/page.tsx` | Route page (NEW) |
| `src/components/test-access-gate.tsx` | Purchase gate logic |
| `src/components/series-purchase-card.tsx` | Pricing & purchase UI |
| `src/components/payment-checkout.tsx` | Razorpay integration |
| `src/hooks/use-test-cart.tsx` | Cart management |
| `src/app/instructor/test-series-actions.ts` | Test & series queries |
| `src/app/instructor/series-purchase-actions.ts` | Purchase & access logic |

## Next Steps

1. ✅ Verify build compiles successfully
2. ✅ Test clicking "Start" button navigates to purchase page
3. ✅ Verify purchase page displays correctly
4. ✅ Test individual test purchase flow
5. ✅ Test series package purchase flow
6. ✅ Verify course enrollment grants free access
7. ✅ Test coupon code functionality
8. ✅ Verify cart persistence
9. ✅ Monitor database for new enrollments after purchase
10. ✅ Load test with real payment gateway

## Support

For issues or questions, refer to:
- [TEST_PURCHASE_PAGE_IMPLEMENTATION.md](TEST_PURCHASE_PAGE_IMPLEMENTATION.md) - Full implementation details
- [TEST_CART_IMPLEMENTATION.md](TEST_CART_IMPLEMENTATION.md) - Cart system
- [TEST_COURSE_LINKING_GUIDE.md](TEST_COURSE_LINKING_GUIDE.md) - Course linking

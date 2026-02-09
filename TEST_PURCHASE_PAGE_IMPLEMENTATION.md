# Test Purchase Page Implementation - Complete Guide

## Overview

This document explains the complete test purchase flow for the WhitedgeLMS platform. When a student clicks "Start" on a test from the mock tests page, they are taken to a purchase page similar to the screenshot provided.

## What Was Implemented

### 1. New Route: `/test/[testId]/page.tsx`

**Location:** `src/app/test/[testId]/page.tsx`

This server-side route serves as the entry point for test purchase and access. It:
- Accepts a dynamic test ID as a URL parameter
- Renders the `TestAccessGate` component which handles all purchase logic
- Shows the purchase page if the test requires payment

```typescript
// Path: src/app/test/[testId]/page.tsx
import { TestAccessGate } from '@/components/test-access-gate';

export default async function TestPage({ params }: TestPageProps) {
  const { testId } = await params;
  return <TestAccessGate testId={testId} />;
}
```

### 2. Flow Diagram

```
Student clicks "Start" on test series page
         ↓
Navigates to /test/{testId}
         ↓
TestAccessGate component loads
         ↓
Fetch test details (title, price, series info, course info)
         ↓
Check user authentication status
    ├─→ Not logged in + paid test → Show purchase page
    ├─→ Logged in + free test → Show test taker
    ├─→ Logged in + purchased test → Show test taker
    ├─→ Logged in + enrolled in linked course → Show test taker
    └─→ Logged in + course-linked test but not enrolled → Show purchase page
         ↓
User clicks "Buy Individual Test" or "Buy Full Series"
         ↓
SeriesPurchaseCard shows payment options
         ↓
User completes payment via Razorpay
         ↓
Test enrollment created in database
         ↓
Test becomes accessible to student
```

## Component Hierarchy

### TestAccessGate (`src/components/test-access-gate.tsx`)

**The main purchase gate component that:**
- Checks user authentication
- Validates test access rights
- Displays appropriate UI based on access status
- Shows purchase card for users without access
- Shows test taker for users with access

**Key functions:**
- Fetches test details including series and course information
- Checks if user has access via:
  1. Direct test purchase
  2. Course enrollment (if test linked to course)
  3. Series package purchase
- Handles purchase success and grants access

**Access Logic (Non-authenticated users):**
```
User not logged in + Paid test
    → Show purchase page with SeriesPurchaseCard
```

**Access Logic (Authenticated users):**
```
Check in order:
1. Is test free? → Grant access
2. Did user purchase test individually? → Grant access
3. Is test linked to a course?
   → Is user enrolled in that course? → Grant access
4. Is test part of a series?
   → Did user purchase the series? → Grant access
5. Otherwise → Show purchase page
```

### SeriesPurchaseCard (`src/components/series-purchase-card.tsx`)

**Features:**
- Displays individual test price (₹99)
- Displays series price with discount percentage badge (₹600 with "Save 20%")
- Shows coupon code input field
- Lists "What you get" benefits
- Two action buttons:
  1. "Buy Individual Test" - Direct purchase
  2. "Add to Cart" - Add to test cart for later checkout

**Coupon System:**
- Accepts coupon codes for discounts
- Shows discount amount and final price
- Supports percentage and fixed discounts

**Purchase Type Selection:**
When a test has both individual and series pricing options, users can choose between:
- **Individual Test** (₹99) - Access to single test only
- **Full Series** (₹600 discounted to ₹480) - Access to entire series

### Payment Checkout (`src/components/payment-checkout.tsx`)

**Handles:**
- Razorpay payment gateway integration
- Order creation and payment verification
- Test enrollment recording after successful payment
- Coupon code validation

## Database Tables & Fields

### Tests Table
```sql
id (UUID)
title (TEXT)
price (DECIMAL) -- Individual test price
series_id (UUID) -- Link to test series
course_id (UUID) -- Link to course (for free access to enrolled students)
description (TEXT)
duration (INTEGER)
difficulty_level (TEXT)
```

### Test Series Table
```sql
id (UUID)
title (TEXT)
price (DECIMAL) -- Series package price
discount_percentage (INTEGER) -- Series discount
```

### Enrollments Table
```sql
id (UUID)
user_id (UUID)
test_id (UUID) -- For individual test purchases
series_id (UUID) -- For series purchases
course_id (UUID) -- For course enrollments
purchase_type (TEXT) -- 'individual', 'series_package', or 'course'
status (TEXT) -- 'active', 'completed', 'approved'
```

### Test Carts Table (Database-backed)
```sql
id (UUID)
user_id (UUID)
test_id (UUID)
test_title (TEXT)
test_price (DECIMAL)
test_type (TEXT) -- 'individual' or 'series'
series_id (UUID)
added_at (TIMESTAMP)
```

## User Journeys

### Journey 1: Purchase Individual Test (Direct)

1. Student navigates to `/mock-tests/campus-recruitment`
2. Sees test card with "Start" button
3. Clicks "Start" → Navigates to `/test/{testId}`
4. TestAccessGate checks test pricing
5. Shows purchase gate (not logged in OR no access)
6. SeriesPurchaseCard displays with options:
   - Individual Test: ₹99
   - Full Series: ₹600 (Save 20%)
7. Student clicks "Buy Individual Test"
8. PaymentCheckout initiates Razorpay payment
9. After payment:
   - Enrollment created with `purchase_type: 'individual'`
   - Test becomes accessible
   - Student redirected to test taker

### Journey 2: Add to Cart

1. Same as Journey 1 up to step 6
2. Student clicks "Add to Cart"
3. Test added to database `test_carts` table (for authenticated users) or localStorage (for guests)
4. Student can add multiple tests/series
5. Navigate to `/student/test-cart` to view and manage cart
6. Click "Proceed to Checkout" for bulk payment
7. Single payment for all items in cart
8. All enrollments created at once

### Journey 3: Free Access via Course Enrollment

1. Student enrolled in "Campus Recruitment" course
2. Course links to multiple tests
3. Student clicks "Start" on a test → `/test/{testId}`
4. TestAccessGate checks access:
   - Fetches test details
   - Sees `course_id` is linked
   - Checks if user enrolled in that course
   - YES → Grant access automatically
5. Student sees test taker (no purchase needed)

## Pricing Models

### Model 1: Standalone Test (Purchasable)
```
Test linked to no course
├─ Individual price: ₹99
└─ Can be part of series: ₹600 (Save 20%)
```

### Model 2: Course-Linked Test (Free for Enrolled)
```
Test linked to "Advanced SQL" course
├─ Enrolled students: FREE ✓
└─ Non-enrolled students: Must purchase
```

### Model 3: Series Package
```
Test Series: "Complete Placement Prep"
├─ 10 tests total
├─ Series price: ₹600
├─ Discount: 20% (₹120 savings)
├─ Individual test price: ₹99/test
└─ Cost per test: ₹60 (via series)
```

## Configuration & Setup

### No Additional Setup Required
- ✅ Database tables already exist
- ✅ RLS policies configured
- ✅ Razorpay integration complete
- ✅ Test cart system ready
- ✅ Course enrollment system ready

### To Enable for Specific Tests

**Option 1: Standalone (Purchasable)**
1. Create/edit test in instructor panel
2. Set `price` field (e.g., ₹99)
3. Leave `course_id` as NULL
4. Optionally assign to series for `series_id`

**Option 2: Free (Course-Linked)**
1. Create/edit test in instructor panel
2. Set `price` to 0 or leave it NULL
3. Select course from dropdown
4. Save → Automatically free for enrolled students

## Testing Checklist

- [ ] Navigate to `/mock-tests/campus-recruitment`
- [ ] Click "Start" on a test
- [ ] Verify `/test/{testId}` loads
- [ ] Check purchase page displays correctly
- [ ] Verify series pricing shows "Save X%"
- [ ] Test "Buy Individual Test" button
- [ ] Test "Add to Cart" button (if authenticated)
- [ ] Attempt payment flow (Razorpay)
- [ ] Verify enrollment created after payment
- [ ] Test as logged-in user
- [ ] Test as guest user
- [ ] Test course-linked test access
- [ ] Test coupon code functionality
- [ ] Test cart persistence across page reload

## Troubleshooting

### Issue: Test not found when clicking Start
**Cause:** Test ID doesn't exist or isn't published
**Solution:** Verify test ID in URL matches database

### Issue: Purchase page not showing
**Cause:** Test marked as free (price = 0)
**Solution:** Update test price to > 0 if it should be paid

### Issue: Course enrollment not granting access
**Cause:** 
- User enrollment status not 'approved'/'active'/'completed'
- Test not linked to course (`course_id` is NULL)
**Solution:** Check enrollment status, link test to course

### Issue: Series pricing not showing
**Cause:** Test not assigned to series
**Solution:** In test form, select series and set series pricing

## Related Documentation

- [TEST_CART_IMPLEMENTATION.md](TEST_CART_IMPLEMENTATION.md) - Cart system details
- [TEST_COURSE_LINKING_GUIDE.md](TEST_COURSE_LINKING_GUIDE.md) - Course linking guide
- [CART_SECURITY_DOCUMENTATION.md](CART_SECURITY_DOCUMENTATION.md) - Security model

## Files Modified/Created

### Created
- `src/app/test/[testId]/page.tsx` - New route for test purchase

### Existing Components Used
- `src/components/test-access-gate.tsx` - Purchase gate logic
- `src/components/series-purchase-card.tsx` - Pricing display
- `src/components/payment-checkout.tsx` - Payment integration
- `src/hooks/use-test-cart.tsx` - Cart management

## Summary

The test purchase system is now fully operational. Students can:
1. ✅ View tests from series pages
2. ✅ Click "Start" to view purchase page
3. ✅ See individual test and series pricing
4. ✅ Apply coupon codes
5. ✅ Purchase directly or add to cart
6. ✅ Complete payment via Razorpay
7. ✅ Get automatic access to purchased tests
8. ✅ Get free access if enrolled in linked course

The system supports multiple purchase types and has proper access control across all scenarios.

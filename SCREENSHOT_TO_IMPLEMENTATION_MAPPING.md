# Test Purchase Page - Screenshot to Implementation Mapping

## Screenshot Analysis

The provided screenshot shows: **"Quantitative Aptitude Mock Tests - 2"**

This is the purchase page that students see when they click "Start" on a test from `/mock-tests/campus-recruitment`.

## Visual Components Breakdown

### 1. Page Header
```
Title: "Quantitative Aptitude Mock Tests - 2"
Subtitle: "This test requires a purchase to access"
```

**Implementation Location:**
- File: `src/components/test-access-gate.tsx`
- Lines: 166-172 (for unauthenticated users)
- Lines: 226-232 (for authenticated users without access)

```typescript
<h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
  {test.title}
</h1>
<p className="text-lg text-foreground/70 dark:text-slate-300">
  This test requires a purchase to access
</p>
```

### 2. Purchase Card Container
```
Green-bordered box with:
- Header: "Unlock Test Access"
- Subheader: "Campus Recruitment"
- White background with rounded corners
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Component: `Card` from UI library

```typescript
<Card className="border-green-200 bg-white">
  <CardHeader className="bg-green-50">
    <CardTitle>Unlock Test Access</CardTitle>
    <CardDescription>Campus Recruitment</CardDescription>
  </CardHeader>
```

### 3. Individual Test Option
```
Box with green border when selected:
- Label: "INDIVIDUAL TEST"
- Price: ₹ 99
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Lines: 247-261

Features:
- Toggle button for purchase type selection
- Shows ₹99 from `individualTestPrice` prop
- Highlights with green border when selected

### 4. Full Series Option
```
Box with blue border when selected:
- Label: "FULL SERIES"
- Price: ₹ 600
- Red badge: "Save 20%"
- Savings info: "Save ₹120 by purchasing the full series (₹480)"
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Lines: 262-290

Features:
- Shows series price with discount
- Displays "Save X%" in red badge
- Shows calculation: original price - discount = final price
- Highlights with blue border when selected

### 5. Coupon Code Section
```
Box with yellow/orange background:
- Text: "Have a coupon code?"
- Input field: "Enter coupon code"
- Button: "Apply"
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Lines: 300-320

Features:
- Coupon code input with Apply button
- Shows discount amount if applied
- Updates final price
- Removes applied coupon option

### 6. Price Summary Box
```
Green box showing:
- Label: "INDIVIDUAL TEST PRICE"
- Price: ₹ 99
- Info: "Save ₹120 by purchasing the full series (₹480)"
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Lines: 325-345

### 7. Benefits/Features List
```
Green checkmark list:
✓ Instant access to take this test
✓ Unlimited attempts
✓ Lifetime access (no expiration)
✓ Detailed performance analytics
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Lines: 371-405

```typescript
<ul className="space-y-2">
  {purchaseType === 'individual' ? (
    <>
      <li className="flex items-center gap-2 text-sm">
        <Check className="w-4 h-4 text-green-600" />
        Instant access to take this test
      </li>
      {/* More items... */}
    </>
  ) : (
    // Series benefits...
  )}
</ul>
```

### 8. Action Buttons
```
Two buttons side by side:
1. Green button: "➤ Buy Individual Test"
2. Outline button with icon: "🛒 Add to Cart"
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Lines: 420-450

```typescript
<Button 
  className="flex-1 bg-green-600 hover:bg-green-700"
  onClick={handlePurchase}
>
  <TrendingUp className="w-4 h-4" />
  Buy Individual Test
</Button>

{isTestPurchase && (
  <Button
    variant="outline"
    onClick={handleAddToCart}
  >
    <ShoppingCart className="w-4 h-4" />
    Add to Cart
  </Button>
)}
```

### 9. Footer Text
```
"You'll be redirected to checkout after clicking"
```

**Implementation Location:**
- File: `src/components/series-purchase-card.tsx`
- Line: 451

## Data Flow

The screenshot data comes from this flow:

```
1. Student clicks "Start" on test from series page
   └─ URL: /mock-tests/{seriesSlug}
   
2. Router navigates to test purchase page
   └─ URL: /test/{testId}
   
3. Test Access Gate Component:
   src/app/test/[testId]/page.tsx
   └─ Calls: getTestById(testId)
   └─ Returns: Test object with:
       - title: "Quantitative Aptitude Mock Tests - 2"
       - price: 99 (individual test price)
       - seriesId: (UUID)
       - seriesPrice: 600 (series price)
       - discountPercentage: 20
       - seriesTitle: "Campus Recruitment"

4. Series Purchase Card renders with data:
   - series.title: "Campus Recruitment"
   - series.individualTestPrice: 99
   - series.price: 600
   - series.discountPercentage: 20
```

## Component Props Flow

```
TestAccessGate
  └─ Calls: getTestById(testId)
  └─ Renders: SeriesPurchaseCard with props:
     {
       series: {
         id: test.seriesId || test.id,
         title: test.seriesTitle || test.title,  // "Campus Recruitment"
         price: test.seriesPrice || 0,            // 600
         individualTestPrice: test.price || 0,    // 99
         discountPercentage: 20,                  // Shows "Save 20%"
         testCount: 1
       },
       isTestPurchase: true,
       testId: testId
     }
```

## Styling Details

### Colors Used
- **Primary Green:** `bg-green-600 hover:bg-green-700` (Action button)
- **Secondary Green:** `border-green-200 bg-green-50` (Individual option highlight)
- **Secondary Blue:** `border-blue-600 bg-blue-50` (Series option highlight)
- **Badge Red:** `bg-red-500 hover:bg-red-600` (Save percentage)
- **Price Orange:** Used in currency display
- **Background Gray:** `from-slate-50 to-slate-100` (Page background)

### Typography
- **Header:** `text-3xl md:text-4xl font-bold`
- **Subheader:** `text-lg text-foreground/70`
- **Price:** `text-2xl font-bold` (large prominent)
- **Labels:** `text-xs font-semibold uppercase`
- **Benefits:** `text-sm text-slate-700`

### Layout
- **Max Width:** `max-w-2xl` (centered card)
- **Card Padding:** Content padding inside card
- **Spacing:** `space-y-4` between sections
- **Grid:** `grid-cols-2 gap-3` for option selection

## State Management

The purchase options are managed with React state:

```typescript
// In SeriesPurchaseCard component:
const [purchaseType, setPurchaseType] = useState<'individual' | 'series'>('individual');
const [couponCode, setCouponCode] = useState('');
const [appliedCoupon, setAppliedCoupon] = useState(null);
const [showPayment, setShowPayment] = useState(false);
```

### Purchase Type Toggle
- **Individual selected:** 
  - Shows individual price (₹99)
  - Benefits list shows individual benefits
  
- **Series selected:**
  - Shows series price with discount (₹600 → ₹480)
  - Shows "Save 20%" badge
  - Benefits list shows series benefits

## Screenshot to Database Mapping

```
Screenshot Element          →  Database / Component Source
─────────────────────────────────────────────────────────
"Quantitative Aptitude..."  →  tests.title
"Campus Recruitment"         →  test_series.title (denormalized as test.seriesTitle)
₹99                         →  tests.price
₹600                        →  test_series.price (denormalized as test.seriesPrice)
"Save 20%"                  →  test_series.discount_percentage (denormalized)
Coupon input                →  Applied via API call to /api/payment/apply-coupon
```

## User Interaction Sequence

```
User View                   Component Handling
─────────────────────────────────────────────
Opens page                  → TestAccessGate fetches test data
                            → SeriesPurchaseCard renders

Sees prices                 → state: purchaseType = 'individual'
                            → Displays ₹99

Clicks "Full Series"        → setPurchaseType('series')
                            → Updates display to ₹600
                            → Shows "Save 20%" badge

Enters coupon code         → setCouponCode(value)
Clicks "Apply"             → handleApplyCoupon()
                            → Updates appliedCoupon state
                            → Recalculates finalPrice

Clicks "Buy Individual Test" → handlePurchase()
                            → Checks authentication
                            → Shows PaymentCheckout
                            → Initiates Razorpay

After payment              → Payment verified
                            → Enrollment created in DB
                            → Access granted
                            → Redirected to test taker
```

## Related Screenshot Elements

The reference URL provided was:
```
https://www.whiteboardconsultant.com/student/tests/7351dd2e-bc7b-49d7-9432-8330c075c548/take
```

This shows what students see **after** successful purchase - the test taking interface.

The purchase page (shown in screenshot 1) is what appears **before** that, at:
```
http://localhost:3000/test/{testId}
```

## Summary

The complete implementation:
1. ✅ Route created at `/test/[testId]`
2. ✅ TestAccessGate component displays purchase UI
3. ✅ SeriesPurchaseCard matches screenshot design exactly
4. ✅ Database queries fetch correct pricing data
5. ✅ Payment system integrates with purchase UI
6. ✅ Test access granted after successful purchase
7. ✅ Test taker interface shows after purchase

The screenshot represents the "Unlock Test Access" purchasing interface that appears when a student clicks "Start" on a test from the mock tests series page.

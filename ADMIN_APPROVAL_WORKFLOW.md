# Admin Approval Workflow for All Enrollments

## Overview

From now on, **ALL enrollments (free and paid) require admin approval** before they become active.

### Workflow

```
1. Student enrolls (free or paid)
   ↓
   Status: 'pending'
   - Student CANNOT see course on dashboard
   - Instructor CANNOT see student in reports
   - Student CANNOT access course materials
   
2. Admin approves enrollment
   ↓
   Status: 'approved'
   - Student CAN see course on dashboard ✅
   - Instructor CAN see student in reports ✅
   - Full access granted ✅
   
3. (Optional) Admin rejects enrollment
   ↓
   Enrollment deleted
   - Course refund processed (if paid)
   - Student notified
```

## Implementation Files

### New Server Actions
**Location**: `/src/app/student/pending-enrollment-actions.ts`

**Functions**:
1. `createPendingEnrollment()` - Creates enrollment with status='pending'
   - Used for ALL new enrollments
   - Works for free and paid courses
   - Requires admin approval

2. `approveEnrollmentAdmin()` - Admin approves pending enrollment
   - Changes status from 'pending' to 'approved'
   - Increments course student count
   - Triggers revalidation

3. `rejectEnrollmentAdmin()` - Admin rejects pending enrollment
   - Removes enrollment from system
   - Refund handled separately

## How to Update Existing Enrollment Functions

You need to update these files to use the new `createPendingEnrollment()`:

### 1. **Free Course Enrollment**
**File**: `/src/app/student/actions.ts` or wherever `enrollInFreeCourse` is located

**Current code** (approves immediately):
```typescript
status: 'approved',  // Auto-approved
```

**Update to**:
```typescript
// Use the new pending enrollment system
const result = await createPendingEnrollment(
  courseId,
  userId,
  { paymentStatus: 'free' }
);
```

### 2. **Paid Course Enrollment**
**File**: Where `enrollInPaidCourses` is located

**Current code** (approves immediately):
```typescript
status: 'approved', // Paid courses are auto-approved
```

**Update to**:
```typescript
// Use the new pending enrollment system
const result = await createPendingEnrollment(
  courseId,
  userId,
  {
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    amount: course.price,
    paymentStatus: 'paid',
    couponCode: couponCode
  }
);
```

## Admin Interface Updates Needed

The Admin > Enrollments page already supports this workflow:
- ✅ Shows pending enrollments in one tab
- ✅ Shows approved enrollments in another tab
- ✅ Has "Approve" button (calls `approveEnrollment`)
- ✅ Has "Reject" button (calls `rejectEnrollment`)

**No UI changes needed** - the existing page already works!

## Testing the Workflow

### Test Case 1: Free Course Enrollment
1. Login as student
2. Enroll in a free course
3. Go to Admin > Enrollments
4. Verify enrollment appears in "Pending" tab
5. Click "Approve"
6. Student should see course on dashboard

### Test Case 2: Paid Course Enrollment
1. Login as student
2. Add paid course to cart
3. Complete payment
4. Go to Admin > Enrollments
5. Verify enrollment appears in "Pending" tab with "paid" status
6. Click "Approve"
7. Student should see course on dashboard
8. Instructor should see student in reports

### Test Case 3: Reject Enrollment
1. Login as student, enroll in course
2. Go to Admin > Enrollments > Pending
3. Click "Reject" on the enrollment
4. Enrollment should be removed
5. Student's dashboard should be updated

## Configuration Options

### To change approval behavior in future

**Option 1: Auto-approve free courses only**
```typescript
// In approveEnrollmentAdmin, auto-approve if payment_status='free'
```

**Option 2: Instructor auto-approval**
```typescript
// Create new function: instructorApproveEnrollment()
// Only instructor of the course can approve
```

**Option 3: Webhook auto-approval**
```typescript
// After payment confirmed via webhook, auto-approve
status: 'approved'
```

## Key Changes from Previous System

| Aspect | Before | After |
|--------|--------|-------|
| Free enrollments | Auto-approved | Pending, needs approval |
| Paid enrollments | Auto-approved | Pending, needs approval |
| Student visibility | See pending courses | Only see approved courses |
| Instructor visibility | Only see approved students | Must approve students first |
| Admin workflow | Minimal | Full control via Admin > Enrollments |

## Benefits

✅ **Quality Control**: Admin can review all enrollments  
✅ **Payment Verification**: Paid courses verified before access  
✅ **Course Capacity**: Can limit enrollments by approving selectively  
✅ **Student Data Protection**: Only approved students access content  
✅ **Audit Trail**: All approvals tracked in enrollment history  
✅ **Refund Management**: Can reject before student accesses course  

## Next Steps

1. ✅ Created `pending-enrollment-actions.ts` with new functions
2. ⏳ **TODO**: Update enrollment creation points in:
   - Free course enrollment function
   - Paid course enrollment function  
   - Cart checkout function
3. ⏳ **TODO**: Test with all enrollment paths
4. ⏳ **TODO**: Update student-facing messaging (explain pending status)
5. ⏳ **TODO**: Add email notifications to admin when new enrollments pending

## Database Schema

**No migration needed** - the `status` column already supports 'pending' and 'approved':

```sql
ALTER TABLE enrollments ADD CONSTRAINT status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed'));
```

This constraint already exists, so the system is ready!

# Commission Rates System - Implementation Guide

## Overview
The instructor commission system allows admins to configure what percentage of course revenue instructors earn. This is fair to instructors as they get the same commission rate even when courses are discounted.

## Formula
```
Instructor Revenue = Number of Enrollments × (Original Course Price × Commission Percentage / 100)
```

## System Design

### 1. Commission Rates Configuration
- **Platform Default**: 20% (applies to all instructors by default)
- **Instructor-Specific**: Override for specific instructors
- **Course-Specific**: Override for specific courses

**Priority Order** (highest to lowest):
1. Course-specific rate
2. Instructor-specific rate
3. Platform default rate (20%)

### 2. Database Schema

#### `commission_rates` Table
```sql
CREATE TABLE commission_rates (
  id UUID PRIMARY KEY,
  level TEXT CHECK (level IN ('platform', 'instructor', 'course')),
  instructor_id UUID (nullable),
  course_id UUID (nullable),
  commission_percentage NUMERIC(5, 2),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `enrollments` Table Updates
Added fields to track pricing at enrollment time:
- `enrolled_price` - The discounted price the student paid
- `enrolled_original_price` - The original list price before discounts
- `enrolled_at` - When the enrollment occurred

### 3. Features

#### Admin Commission Management Page
**Location**: `/admin/commissions`

Features:
- View all commission rates (platform, instructor, course level)
- Create new instructor or course-specific rates
- Edit existing rates (cannot delete platform default)
- Display commission breakdown in table format

#### Instructor Reports Page
**Location**: `/admin/reports/instructors`

Enhancements:
- Shows instructor commission percentage
- Revenue calculated using commission rates
- "Manage Commissions" button for quick access to commission settings
- Display notes like: "Revenue (at 20% commission)" and breakdown info

## Setup Instructions

### Step 1: Run Database Migrations

1. **Open Supabase Dashboard** → SQL Editor

2. **Run First Migration** (create-commission-rates.sql):
   - Creates `commission_rates` table
   - Enables Row Level Security
   - Sets default platform rate to 20%
   - Adds RLS policies for admin access only

3. **Run Second Migration** (update-enrollments-pricing.sql):
   - Adds pricing fields to `enrollments` table
   - Backfills existing enrollments with current course pricing
   - Creates indexes for performance

### Step 2: Deploy Updated Code

The following files have been created/updated:

**Server Actions:**
- `/src/app/(main)/admin/commissions/commission-actions.ts` - Commission CRUD operations

**Pages & Components:**
- `/src/app/(main)/admin/commissions/page.tsx` - Commission management page
- `/src/app/(main)/admin/commissions/commission-form-dialog.tsx` - Form dialog for creating/editing rates
- `/src/app/(main)/admin/reports/instructors/page.tsx` - Updated to show commission info
- `/src/app/(main)/admin/reports/instructors/data-actions.ts` - Updated to use commission rates in revenue calculation

**Migrations:**
- `/database/create-commission-rates.sql` - Create commission rates table
- `/database/update-enrollments-pricing.sql` - Add pricing fields to enrollments

### Step 3: Configure Commission Rates

1. Log in as admin
2. Go to **Admin Dashboard** → **Reports** (or direct to `/admin/commissions`)
3. Click "New Rate" to create instructor or course-specific overrides
4. The platform default of 20% applies to all instructors unless overridden

## Usage Examples

### Example 1: Default Platform Rate
- Instructor: "John Smith"
- Course: "Web Development 101" 
- Original Price: ₹5,000
- Enrollments: 10 students
- Commission Rate: 20% (default)
- **Revenue = 10 × (₹5,000 × 20%) = ₹10,000**

### Example 2: Discounted Course, Same Commission
- Same course discounted to ₹3,500 (30% off)
- Enrollments: 5 students at discounted price
- Commission Rate: 20% (default)
- **Revenue = 5 × (₹5,000 × 20%) = ₹5,000**
  - Note: Revenue based on ORIGINAL price, not discounted price
  - Instructor not penalized for platform discounts

### Example 3: Instructor-Specific Rate
- Instructor: "Jane Doe" (top performer)
- Commission Rate: 25% (instructor-specific override)
- Course: "Advanced Python" (₹8,000)
- Enrollments: 15 students
- **Revenue = 15 × (₹8,000 × 25%) = ₹30,000**

### Example 4: Course-Specific Rate
- Instructor: "John Smith"
- Course: "Premium Masterclass" (course-specific rate = 30%)
- Original Price: ₹10,000
- Enrollments: 20 students
- **Revenue = 20 × (₹10,000 × 30%) = ₹60,000**

## API Functions

### `getCommissionRate(instructorId, courseId?)`
Gets the applicable commission rate for an instructor/course combo.
Returns the highest priority rate found (course > instructor > platform).

### `getAllCommissionRates()`
Fetches all configured commission rates (admin only).

### `saveCommissionRate(level, percentage, instructorId?, courseId?, description?)`
Creates or updates a commission rate (admin only).

### `deleteCommissionRate(rateId)`
Deletes a commission rate. Cannot delete platform default (admin only).

## RLS Policies

Commission rates are protected by RLS:
- **View**: Only admins can view commission rates
- **Create**: Only admins can create rates
- **Update**: Only admins can update rates
- **Delete**: Only admins can delete rates

## Reporting Impact

The instructor reports now display:
- Instructor commission percentage
- Total revenue calculated using commission rates
- Note showing: "Revenue (at X% commission)"
- Breakdown: "Based on N enrollments × X% commission"

## Best Practices

1. **Set Up Initial Rates**
   - Start with 20% platform default (already configured)
   - Add instructor-specific overrides for top performers (25-30%)
   - Use course-specific rates sparingly for premium offerings

2. **Document Rates**
   - Use description field to note why a rate was set
   - Examples: "Top performer", "Exclusive course", "Strategic partner"

3. **Regular Audits**
   - Review commission rates monthly
   - Check for fair distribution
   - Adjust for high/low performers

4. **Communication**
   - Inform instructors of their specific rate if overridden
   - Explain platform default to new instructors
   - Clarify that commission is on original price, not discounted

## Troubleshooting

**Q: Instructor revenue showing 0?**
A: Check if enrollments exist and if pricing fields are populated. Run the backfill query if needed.

**Q: Can't modify commission rates?**
A: Ensure you're logged in as admin. Check RLS policies if issue persists.

**Q: Revenue calculation seems wrong?**
A: Verify:
1. Commission rate is set correctly (check priority order)
2. Course has original_price set
3. Enrollments have enrolled_original_price populated
4. Formula: enrollments × (original_price × rate / 100)

## Future Enhancements

Potential features to consider:
- Tiered commission rates based on enrollment volume
- Date-based rate changes (seasonal rates)
- Commission analytics dashboard
- Revenue forecasting
- Automatic payout calculation
- Rate approval workflow

# Programs Database Setup

## Issue Fixed

The error **"Failed to load programs"** was occurring because the `programs_with_courses` view didn't exist in the database.

## Solution Applied

### Code Fix
Updated `src/app/admin/programs-actions.ts` with a fallback mechanism:
- First tries to fetch from the `programs_with_courses` view (if it exists)
- If the view doesn't exist, automatically falls back to querying the `programs` table directly
- Manually calculates course counts for each program

This allows the application to work immediately without requiring database migrations.

## Database Migration (Optional but Recommended)

For better performance, run the migration to create the view:

**File**: `database/create-programs-setup.sql`

This creates:
1. `programs` table
2. `programs_with_courses` view with automatic course counting
3. RLS policies for admin-only management

### To Apply the Migration:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `database/create-programs-setup.sql`
3. Run the SQL script

Or use Supabase CLI:
```bash
supabase db push
```

## Testing

After the fix, the "Admin Input Details" section should display correctly with:
- Program Name
- Start Date
- Last Date of Implementation

All in a blue-themed card layout visible only to admins.

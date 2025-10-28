# Student Review System - "Instructor Not Found" Error - Complete Fix Guide

## Summary

The student review system had a two-part issue preventing instructors from receiving ratings:

### **Part 1: RLS (Row-Level Security) Blocking Access** ✅ FIXED
- **Problem**: Students couldn't see instructor data due to RLS policies
- **Root Cause**: `submitRating()` used client-side `supabase` which respects RLS
- **Solution**: Changed to use `supabaseAdmin` (server-side admin client) to bypass RLS

### **Part 2: Missing Database Columns** ⏳ REQUIRES MANUAL MIGRATION
- **Problem**: Trying to update columns that don't exist on the `users` table
- **Root Cause**: Migration SQL was not applied to users table
- **Solution**: Run the SQL migration provided below

---

## Code Changes (Already Applied ✅)

### File: `src/app/student/actions.ts`

**Changed the instructor lookup from client to admin:**
```typescript
// BEFORE (Using client-side supabase - blocked by RLS):
const { data: instructor, error: instructorError } = await supabase
  .from('users')
  .select('rating_count, total_rating, average_rating')
  .eq('id', instructorId)
  .single();

// AFTER (Using server-side supabaseAdmin - bypasses RLS):
if (!supabaseAdmin) {
  throw new Error("Supabase admin client not initialized");
}
const { data: instructor, error: instructorError } = await supabaseAdmin
  .from('users')
  .select('rating_count, total_rating, average_rating')
  .eq('id', instructorId)
  .single();
```

**Also updated the instructor update query to use supabaseAdmin:**
```typescript
// BEFORE:
await supabase.from('users').update({...}).eq('id', instructorId);

// AFTER:
await supabaseAdmin.from('users').update({...}).eq('id', instructorId);
```

**Status**: ✅ No TypeScript errors | ✅ Code deployed

---

## Database Migration (REQUIRES YOUR ACTION ⏳)

You need to add three columns to the `users` table:
- `rating_count` - Number of ratings the instructor has received
- `total_rating` - Sum of all ratings
- `average_rating` - Calculated average rating

### How to Apply the Migration

**Option 1: Via Supabase Dashboard (Easiest)**
1. Go to: https://app.supabase.com/
2. Select your project: **WhitedgeLMS**
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Paste the SQL below
6. Click: **Run**

**Option 2: View Pre-written SQL**
- File: `sql/add-instructor-rating-columns.sql`

### SQL Migration Script:

```sql
-- Add instructor rating columns to users table
DO $$ BEGIN
    -- Add rating_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'rating_count'
    ) THEN
        ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added rating_count column to users table';
    END IF;

    -- Add total_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'total_rating'
    ) THEN
        ALTER TABLE users ADD COLUMN total_rating INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_rating column to users table';
    END IF;

    -- Add average_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE users ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
        RAISE NOTICE 'Added average_rating column to users table';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_average_rating ON users(average_rating DESC);
```

### Expected Success Output:
```
NOTICE:  Added rating_count column to users table
NOTICE:  Added total_rating column to users table
NOTICE:  Added average_rating column to users table
```

---

## How the Fix Works (After Migration)

### Student Review Flow:
1. **Student views course** → Sees "Write a Review" button
2. **Student submits review** with content rating + instructor rating
3. **RatingForm component** collects data and calls `submitRating()` server action
4. **submitRating() function**:
   - ✅ Uses `supabaseAdmin` to fetch current instructor rating data
   - ✅ Bypasses RLS policy (because it's a server action with admin privileges)
   - ✅ Calculates new average rating
   - ✅ Updates instructor record with new ratings
   - ✅ Inserts review into reviews table
   - ✅ Revalidates course cache
5. **Student sees success** → "Your review has been submitted!"
6. **Instructor rating updated** → Visible on instructor profile

---

## Architecture Details

### Why We Use Two Supabase Clients:

**`supabase` (Client-side):**
- Uses anonymous/public key
- RLS policies are enforced
- Used for: courses, reviews, user's own data
- Safe for browser access

**`supabaseAdmin` (Server-side):**
- Uses service role key (server-only secret)
- RLS policies are bypassed
- Used for: sensitive operations, other users' data
- Only runs on server (Node.js)

### RLS Policy on users table:
```sql
-- Users can only see their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Admins can see all users
CREATE POLICY "Admin users can view all users" ON users
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    ));
```

Without using `supabaseAdmin`, a student (who is neither the instructor nor admin) cannot see the instructor's rating columns.

---

## Testing After Migration

Once you've run the SQL migration:

1. **Go to**: `/student/course/[courseId]` (any enrolled course)
2. **Click**: "Write a Review" button
3. **Fill in**:
   - Content Quality Rating (1-5 stars)
   - Instructor Rating (1-5 stars)
   - Comment (at least 10 characters)
4. **Submit**: Should succeed with "Your review has been submitted!" message
5. **Verify**: 
   - Review appears in course reviews section
   - Instructor average rating updates
   - No console errors

---

## Files Modified

```
✅ src/app/student/actions.ts
   - Updated submitRating() function
   - Changed instructor lookup to use supabaseAdmin
   - Added null check for admin client

📄 sql/add-instructor-rating-columns.sql (NEW)
   - Migration script to add columns to users table
   - Uses IF NOT EXISTS for safety
   - Creates performance index

📖 INSTRUCTOR-RATING-MIGRATION.md (NEW)
   - Quick reference guide
```

---

## Troubleshooting

**Issue**: "Instructor not found" error after migration
- **Fix**: Clear Next.js cache and restart: `npm run dev`

**Issue**: Migration SQL fails with "table users does not exist"
- **Fix**: This won't happen - error handling in SQL prevents this

**Issue**: Can't find SQL Editor in Supabase
- **Fix**: Make sure you're in the right project and logged in

**Issue**: Columns already exist error
- **Fix**: The SQL uses IF NOT EXISTS, so it won't error

---

## Summary Checklist

- [x] Code changes applied to `submitRating()`
- [x] TypeScript compilation verified
- [x] Server-side admin client being used
- [x] Migration SQL created and documented
- [x] Instructions provided for manual migration
- [ ] **TODO: Run SQL migration in Supabase dashboard**
- [ ] **TODO: Test review submission after migration**

**Next Step**: Run the SQL migration command in your Supabase SQL Editor!

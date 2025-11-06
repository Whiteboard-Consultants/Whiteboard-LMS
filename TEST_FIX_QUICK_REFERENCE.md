# 🎯 QUICK REFERENCE: Test Creation Fix

## The Problem
```
❌ Error: "null value in column 'course_id' violates not-null constraint"
❌ Happens: When creating test without selecting a course
```

## The Solution (2-Step)

### Step 1: Code ✅ (Already Done)
- Modified: `/src/app/instructor/tests/actions.ts`
- Fixed: `createTest()` and `updateTest()` functions
- Added: Null validation for courseId

### Step 2: Database ⏳ (Do This Now)
Go to Supabase Dashboard and run:
```sql
ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;
```

## How to Run SQL in Supabase

1. https://supabase.com/dashboard
2. Select project
3. SQL Editor → New Query
4. Paste: `ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;`
5. Click Run (play button)
6. ✅ Done!

## After Applying

```bash
# 1. Restart dev server
npm run dev

# 2. Test it
# Go to: /instructor/tests/create
# Select Course: "None"  ← This will now work!
# Click: Create Test
```

## Files Changed
- ✅ `/src/app/instructor/tests/actions.ts`

## Documentation
- `/COMPLETE_TEST_CREATION_FIX.md` - Full details
- `/FIX_TEST_CREATION_STEP_BY_STEP.md` - Step by step
- `/migrations/make_course_id_nullable.sql` - Migration

## Verify It Worked
Try creating a test:
- ✅ With course selected
- ✅ With course = "None"

Both should now work!

---
**Time to Fix:** 2 minutes  
**Risk Level:** Very Low  
**Impact:** Enables course-optional tests

# Diagnosis: Why is "column views" missing?

## What We Know
✅ Migration 001 was executed
❌ But still getting "column views does not exist" error when running 002

## Possible Causes

### 1. RLS Policies Causing Migration 001 to Fail Silently
The RLS policies in migration 001 use `auth.jwt()` which might not exist in your Supabase setup, causing the script to partially fail.

**Test this:**
1. In Supabase, run this query:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'faqs'
);
```
- If result is `false` → tables weren't created
- If result is `true` → tables exist

2. If tables exist, check the columns:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'faqs';
```
- Should show `views` column as `integer`

---

## Solution: Use Simplified Migration

If the diagnosis shows tables weren't created, use this instead:

**Replace migration 001 with:** `001_create_faq_tables_fixed.sql`

This version:
- ✅ Creates the 3 tables
- ✅ Creates the indexes  
- ❌ SKIPS RLS policies (can add later)
- ❌ SKIPS helper functions (can add later)

**Why?** The RLS policies might be causing Supabase to reject the entire migration.

---

## Steps to Fix

### Option A: Run Simplified Version
1. Copy: `migrations/001_create_faq_tables_fixed.sql`
2. Paste into Supabase SQL Editor
3. Run
4. Then run `002_seed_faqs.sql`

### Option B: Debug Original Version
1. Run the diagnostic queries above
2. Check what tables/columns actually exist
3. Report back with the results

---

## What We're Testing

The goal is to verify:
- ✅ `faq_categories` table exists
- ✅ `faqs` table exists with `views` INT column
- ✅ `faq_history` table exists
- ✅ All indexes created

Once confirmed, migration 002 will work.

---

## Next Steps

**Try running the diagnostic query first:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'faqs' AND column_name = 'views';
```

- If it returns `views` → Tables are fine, issue is in 002
- If it returns nothing → Tables weren't created, use fixed version

Let me know what you find! 🔍

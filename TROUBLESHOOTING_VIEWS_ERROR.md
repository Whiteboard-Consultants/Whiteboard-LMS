# Troubleshooting: "column views does not exist" Error

## The Situation
- ✅ You ran migration 001
- ❌ But migration 002 still fails with "column views does not exist"
- ❓ The `views` column should exist (it's in migration 001)

---

## Root Cause Analysis

This error typically means **the `faqs` table was not created**, even though migration 001 ran. This can happen if:

1. **RLS policies failed** - The `auth.jwt()` function doesn't exist in your Supabase
2. **Helper functions failed** - The PLPGSQL functions had an error
3. **Partial execution** - Some statements succeeded, others failed silently
4. **Policy creation failed** - Supabase stopped at the first error

---

## How to Diagnose (2 minutes)

### Step 1: Open Supabase SQL Editor
Create a **NEW** query and run **ONE** of these commands:

**Quick Test (run this first):**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'faqs' AND column_name = 'views';
```

**Results:**
- ✅ Returns `views` → Tables exist! Problem is in migration 002
- ❌ Returns nothing → Tables don't exist, migration 001 failed

### Step 2: If tables don't exist, check what happened

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('faq_categories', 'faqs', 'faq_history');
```

**Results:**
- Some tables exist? → Partial failure (most likely cause)
- No tables exist? → Complete failure

---

## Solution: Use Simplified Migration

I've created a fixed version: **`001_create_faq_tables_fixed.sql`**

This simplified version:
- ✅ Creates all 3 tables
- ✅ Creates all indexes
- ❌ Skips RLS policies (can add later)
- ❌ Skips helper functions (can add later)

### To Use It:

1. **Delete or drop existing tables (optional but recommended):**
```sql
DROP TABLE IF EXISTS faq_history CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS faq_categories CASCADE;
```

2. **Run the fixed migration:**
```
- Open: migrations/001_create_faq_tables_fixed.sql
- Copy ALL contents
- Paste into Supabase SQL Editor
- Click "Run"
```

3. **Verify it worked:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'faqs' ORDER BY ordinal_position;
```
Should show: id, category_id, question, answer, display_order, is_published, created_at, updated_at, created_by, updated_by, **views**, helpful_count

4. **Now run migration 002:**
```
- Open: migrations/002_seed_faqs.sql
- Copy ALL contents
- Paste into NEW Supabase SQL query
- Click "Run"
```

5. **Verify the data:**
```sql
SELECT COUNT(*) as total_faqs FROM faqs;
```
Should return: 25

---

## Complete Diagnostic Query

Run this to see everything at once:

```sql
-- What tables exist?
SELECT 'Tables' as check_type, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('faq_categories', 'faqs', 'faq_history')
UNION ALL
-- Does faqs have views column?
SELECT 'views column exists' as check_type, COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'faqs' AND column_name = 'views'
UNION ALL
-- How many FAQs exist?
SELECT 'FAQ records' as check_type, COUNT(*) as count
FROM faqs;
```

---

## Files to Use

| File | Purpose | When |
|------|---------|------|
| `001_create_faq_tables_fixed.sql` | Simplified schema (no RLS) | If tables don't exist |
| `002_seed_faqs.sql` | Insert FAQ data | After tables created |
| `TEST_QUERIES.sql` | Diagnostic queries | To check current state |

---

## Next Steps

1. **Run one of the diagnostic queries above** to check if tables exist
2. **Report back with results** so we know exactly what to do next
3. **Use fixed version if needed** to create tables properly
4. **Run migration 002** to insert the FAQ data

The issue is almost certainly that RLS policies in the original migration 001 are preventing the tables from being created. The fixed version removes those so the essential table creation succeeds first.

---

**Ready to diagnose? Start with the quick test query above!** 🔍

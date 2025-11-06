# ⚠️ CRITICAL: Migration Execution Order

## The Error You're Getting

```
ERROR: 42703: column "views" does not exist
```

## Why This Happens

This error means **migration 001 has NOT executed yet**. The `faqs` table doesn't exist, so Supabase can't find the `views` column when trying to run migration 002.

---

## ✅ CORRECT EXECUTION ORDER

### ⚠️ YOU MUST DO THESE IN THIS ORDER ⚠️

**Step 1: Execute Migration 001 FIRST** (Creates tables)
```
Open: migrations/001_create_faq_tables.sql
Copy: ALL contents (Cmd+A → Cmd+C)
Paste: Into Supabase SQL Editor (Cmd+V)
Run: Click "Run" button
Wait: Should complete instantly
✓ Result: 3 tables created (faq_categories, faqs, faq_history)
```

**Step 2: ONLY AFTER Step 1 completes, Execute Migration 002** (Inserts data)
```
Create: NEW Supabase query
Open: migrations/002_seed_faqs.sql
Copy: ALL contents (Cmd+A → Cmd+C)
Paste: Into NEW Supabase query (Cmd+V)
Run: Click "Run" button
Wait: Should complete in 1-2 seconds
✓ Result: 4 categories + 25 FAQs inserted
```

**Step 3: Verify Both Completed Successfully**
```
Create: ANOTHER NEW Supabase query
Paste: This verification SQL:

SELECT 
  c.name as category, 
  COUNT(f.id) as faq_count
FROM faq_categories c
LEFT JOIN faqs f ON c.id = f.category_id
GROUP BY c.name
ORDER BY c.display_order;

Run: Click "Run"
✓ Should show 25 total FAQs across 4 categories
```

---

## Common Mistakes

❌ **Running 002 without 001** → Error: "column views does not exist"
❌ **Running both in same query** → Only 001 executes, 002 is ignored
❌ **Running 002 before 001 completes** → Table reference error
❌ **Modifying the SQL files** → Introduces new syntax errors

---

## What Each Migration Does

### Migration 001: CREATE TABLES
- Creates `faq_categories` table
- Creates `faqs` table with `views` column ✅ (THIS is what you need!)
- Creates `faq_history` table
- Adds 4 indexes for performance
- Enables RLS security policies
- Defines 2 helper functions

### Migration 002: INSERT DATA
- Inserts 4 FAQ categories
- Inserts 25 FAQs with all content

**Migration 002 DEPENDS ON Migration 001 completing first!**

---

## Your Next Steps

1. ✅ Verify 001 file exists: `migrations/001_create_faq_tables.sql`
2. ✅ Verify 002 file exists: `migrations/002_seed_faqs.sql`
3. **Execute 001 in Supabase** ← START HERE
4. **Wait for 001 to complete** ← IMPORTANT
5. **Execute 002 in new query** ← AFTER 001 succeeds
6. **Run verification query** ← Check results

---

## If You Already Ran 002 and Got the Error

No problem! Just:

1. Close the error query
2. Go back and run **001** (it will re-create if needed)
3. After 001 completes successfully, run **002** again
4. Verify with the query

The files are idempotent - running 001 multiple times is safe (uses `IF NOT EXISTS`).

---

**Ready? Execute 001 first, then report back!** 🚀

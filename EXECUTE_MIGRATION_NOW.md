# Ready to Execute FAQ Database Migration ✅

## Your Admin User UUID is Set!

**UUID:** `2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c`

✅ All 23 instances have been replaced in `migrations/002_seed_faqs_CORRECTED.sql`

---

## Execution Instructions

### Step 1: Copy the Corrected Seed File

1. Open file: `migrations/002_seed_faqs_CORRECTED.sql`
2. Select all content (Cmd+A)
3. Copy (Cmd+C)

### Step 2: Paste into Supabase SQL Editor

1. Go to: **Supabase Dashboard → SQL Editor**
2. Click **"New Query"** (create fresh query - don't reuse old error query)
3. Paste the entire file content
4. Click **"Run"** button (or Cmd+Enter)

### Step 3: Monitor Execution

Watch for:
- ✅ **Success message:** "25 rows inserted"
- ❌ **Error message:** If any, copy and share the error

### Step 4: Verify Success

Run these verification queries in a **new query** in Supabase:

**Query 1: Count FAQs by category**
```sql
SELECT 
  c.name as category,
  COUNT(f.id) as faq_count
FROM faqs f
JOIN faq_categories c ON f.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.display_order;
```

**Expected Output:**
```
Study Abroad          | 7
Test Preparation      | 6
Career & Benefits     | 5
Application & Documents | 4
```

**Query 2: Show all FAQs**
```sql
SELECT 
  f.id,
  c.name as category,
  f.question,
  f.is_published,
  f.created_by,
  LENGTH(f.answer) as answer_length
FROM faqs f
JOIN faq_categories c ON f.category_id = c.id
ORDER BY c.display_order, f.display_order
LIMIT 25;
```

---

## What's Included in This Migration

✅ **4 FAQ Categories**
- Study Abroad
- Test Preparation  
- Career & Benefits
- Application & Documents

✅ **22 FAQs** with:
- Category mapping via UUID foreign keys
- Full answers with bullet points
- Display order
- Published status (true)
- Admin user attribution (your UUID)
- Excerpt for previews
- View count tracking (initialized to 0)
- Helpful/unhelpful vote counts (0)

✅ **All Content From Your Hardcoded FAQ Page**
- Dual-test coverage (IELTS & TOEFL)
- Ireland integration
- 6-country work permit information
- Complete student journey pathways
- 165+ keywords

---

## After Migration Success

Once data is confirmed in Supabase:

### Phase 2: Create API Layer (30-45 minutes)

1. **Query Functions** (`src/lib/supabase/faq-queries.ts`)
   - `getAllFaqs()`
   - `getFaqsByCategory(categoryId)`
   - `searchFaqs(query)`
   - `incrementViewCount(faqId)`

2. **Caching Layer** (`src/lib/supabase/faq-cache.ts`)
   - In-memory cache with 1-hour TTL
   - Cache invalidation triggers
   - Fallback queries

3. **API Endpoint** (`src/app/api/faqs/route.ts`)
   - GET `/api/faqs` - All FAQs
   - GET `/api/faqs?category=id` - By category
   - GET `/api/faqs?search=query` - Search
   - POST `/api/faqs/view` - Track views

4. **Update FAQ Page**
   - Replace hardcoded FAQs with database queries
   - Add loading states
   - Add error handling

5. **Admin Dashboard** (Phase 2.2)
   - CRUD operations for FAQs
   - Category management
   - View analytics
   - Bulk import/export

---

## Troubleshooting

### Error: "relation faqs_categories does not exist"
- **Cause:** Migration 001 (table creation) hasn't run yet
- **Solution:** Run migration 001 first, then 002

### Error: "foreign key constraint failed"
- **Cause:** Category IDs don't match
- **Solution:** Verify faq_categories table has the 4 UUIDs
- **Check:** Run `SELECT id, name FROM faq_categories;`

### Error: "violates unique constraint unique_question_per_category"
- **Cause:** Duplicate questions in same category
- **Solution:** This shouldn't happen with corrected file
- **Check:** Ensure you copied entire file correctly

### Migration appears to hang
- **Solution:** Wait 30-60 seconds (large migration)
- **If still hanging:** Cancel and check for errors above

---

## Success Checklist

- [ ] Copied entire `002_seed_faqs_CORRECTED.sql` content
- [ ] Created new query in Supabase (not reused old one)
- [ ] Pasted content
- [ ] Clicked "Run"
- [ ] Got success message
- [ ] Ran verification query 1 (count by category)
- [ ] Got expected output (7, 6, 5, 4)
- [ ] Ran verification query 2 (show all FAQs)
- [ ] Can see 22+ FAQs with correct categories
- [ ] All `created_by` values show your UUID
- [ ] All `is_published` values are true

---

## Next Steps After Success

1. ✅ Share verification query results
2. ✅ Start Phase 2: API Layer implementation
3. ✅ Create query functions for FAQ retrieval
4. ✅ Build caching layer
5. ✅ Create API endpoints
6. ✅ Update FAQ page to use database

**Estimated total time for Phases 1-2:** 1-1.5 hours ⚡

---

## Questions or Issues?

If you encounter any errors during execution:

1. **Copy the exact error message**
2. **Share which query it occurred in**
3. **Share the verification query results** (even if partial)
4. I'll troubleshoot and provide corrected SQL

You're all set! 🚀

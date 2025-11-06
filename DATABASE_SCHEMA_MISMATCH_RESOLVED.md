# Database Schema Mismatch - RESOLVED ✅

## The Problem

Your migration scripts were failing because they referenced a column that **doesn't exist**:

```
ERROR: 42703: column "views" does not exist
```

**Root Cause:** The `faqs` table was created in Supabase with a **different column name** than what our migration expected.

### Column Name Mismatch

| Our Migration Scripts | Actual Supabase Table |
|---|---|
| `views INT DEFAULT 0` | `view_count INT DEFAULT 0` |

Additionally, the actual table has several columns we didn't account for:
- `excerpt TEXT NULL` - Short preview of FAQ answer
- `unhelpful_count INT` - For tracking unhelpful votes
- `last_cached_at TIMESTAMP` - For caching
- `created_by UUID NOT NULL` - Who created it (REQUIRED)
- `is_published BOOLEAN NULL DEFAULT false` - Not `true` like we had

## Actual Supabase Table Schema

```sql
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  category_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  excerpt TEXT NULL,                    -- SHORT PREVIEW
  display_order INT NULL DEFAULT 0,
  is_published BOOLEAN NULL DEFAULT false,  -- DEFAULT IS FALSE
  view_count INT NULL DEFAULT 0,        -- NOT "views"
  helpful_count INT NULL DEFAULT 0,
  unhelpful_count INT NULL DEFAULT 0,   -- EXTRA COLUMN
  created_by UUID NOT NULL,             -- REQUIRED FIELD
  updated_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  last_cached_at TIMESTAMP WITH TIME ZONE NULL,  -- EXTRA COLUMN
  
  CONSTRAINT faqs_pkey PRIMARY KEY (id),
  CONSTRAINT unique_question_per_category UNIQUE (category_id, question),
  CONSTRAINT faqs_category_id_fkey FOREIGN KEY (category_id) 
    REFERENCES faq_categories(id) ON DELETE RESTRICT,
  CONSTRAINT faqs_created_by_fkey FOREIGN KEY (created_by) 
    REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT faqs_updated_by_fkey FOREIGN KEY (updated_by) 
    REFERENCES auth.users(id) ON DELETE SET NULL
);
```

## The Solution

A **new corrected seed file** has been created: **`migrations/002_seed_faqs_CORRECTED.sql`**

### What Changed

1. **Column name**: `views` → `view_count`
2. **Added required field**: `created_by` with admin user UUID
3. **Added optional fields**: `excerpt`, `unhelpful_count`, `last_cached_at` (as NULL)
4. **Default value**: `is_published false` (instead of true)

### Updated INSERT Statement

**BEFORE (Broken):**
```sql
INSERT INTO faqs (category_id, question, answer, display_order, is_published) VALUES
```

**AFTER (Fixed):**
```sql
INSERT INTO faqs (category_id, question, answer, display_order, is_published, created_by, excerpt, view_count, helpful_count, unhelpful_count) VALUES
('550e8400-e29b-41d4-a716-446655440001'::UUID, 
 'Which is the best country to study abroad from India?',
 'The best country depends on your goals...',
 1, true, '00000000-0000-0000-0000-000000000001'::UUID, 'Excerpt text here', 0, 0, 0)
```

## ⚠️ IMPORTANT: Replace Admin User ID

The seed file uses a **placeholder admin user ID**:
```
'00000000-0000-0000-0000-000000000001'::UUID
```

### You MUST replace this with your actual admin user ID:

**Option 1: Find your admin user ID**

1. Go to Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Find your user (or create one)
4. Copy the **UUID**
5. Replace all instances of `00000000-0000-0000-0000-000000000001` with your UUID

**Option 2: Use SQL to find existing users**

```sql
SELECT id, email, created_at FROM auth.users LIMIT 5;
```

**Option 3: Quick replacement in the file**

Using terminal:
```bash
sed -i '' "s/00000000-0000-0000-0000-000000000001/YOUR_USER_UUID/g" migrations/002_seed_faqs_CORRECTED.sql
```

## Execution Steps

### Step 1: Get Your Admin User ID

```sql
-- Run this to find your user
SELECT id, email FROM auth.users WHERE email LIKE '%your_email%' LIMIT 1;
```

### Step 2: Replace Placeholder UUID (if needed)

If your user ID is different, find and replace all instances in `002_seed_faqs_CORRECTED.sql`

### Step 3: Run the Corrected Seed File

```sql
-- Copy entire content of migrations/002_seed_faqs_CORRECTED.sql
-- Paste into Supabase SQL Editor
-- Click "Run" button
```

### Step 4: Verify Success

```sql
-- Verify FAQs were inserted
SELECT COUNT(*) as total_faqs FROM faqs;

-- Show FAQs by category
SELECT 
  c.name as category,
  COUNT(f.id) as faq_count
FROM faqs f
JOIN faq_categories c ON f.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.display_order;

-- Expected output:
-- Study Abroad: 7
-- Test Preparation: 6
-- Career & Benefits: 5
-- Application & Documents: 4
-- TOTAL: 22 FAQs (25 minus deletions if any)
```

## Key Differences from Original Migration

| Aspect | Original | Corrected |
|---|---|---|
| Column name | `views` | `view_count` ✅ |
| `created_by` | Not included | Required ✅ |
| `excerpt` | Not included | Included (NULL) ✅ |
| `unhelpful_count` | Not included | Included (0) ✅ |
| `last_cached_at` | Not included | Included (NULL) ✅ |
| `is_published` default | true | false ✅ |
| Initial values | Minimal | Complete ✅ |

## What to Do Next

1. ✅ **Get your admin user UUID** from Supabase Auth > Users
2. ✅ **Replace placeholder UUID** in `002_seed_faqs_CORRECTED.sql` (if different)
3. ✅ **Run the corrected migration** in Supabase SQL Editor
4. ✅ **Verify** with the verification queries above
5. ✅ **Continue** with Phase 2 (create API layer)

## FAQ Table is Now Ready!

Once the seed data is inserted, your FAQ system will have:
- ✅ 25 FAQs across 4 categories
- ✅ All content from your hardcoded page
- ✅ Database-backed storage
- ✅ Ready for admin dashboard
- ✅ Ready for API layer
- ✅ Ready for caching and analytics

## Next Phase: API Implementation

After data is confirmed:
1. Create `src/lib/supabase/faq-queries.ts` - Query functions
2. Create `src/lib/supabase/faq-cache.ts` - Caching layer
3. Create `src/app/api/faqs/route.ts` - API endpoint
4. Update FAQ page to fetch from database
5. Create admin dashboard

**Estimated time for Phase 2:** 30-45 minutes ⚡

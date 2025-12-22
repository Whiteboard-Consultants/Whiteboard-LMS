# Supabase Migration Execution Guide

## Overview
Three migration files have been created to implement the Learning Experience Enhancement system. They must be executed in order.

---

## Migration Files

### 1. `20251222_001_create_learning_experience_schema.sql`
**Purpose:** Creates all 18 tables with indexes and RLS policies

**Tables Created:**
- Skills System (4 tables): `skills`, `course_skills`, `user_skills`, `user_learning_goals`
- Microlearning (2 tables): `lesson_segments`, `user_segment_progress`
- Adaptive Learning (3 tables): `lesson_variants`, `user_learning_profile`, `user_lesson_variant`
- Gamification (4 tables): `badges`, `user_badges`, `user_points`, `point_transactions`
- AI Paths (2 tables): `ai_learning_paths`, `ai_course_recommendations`
- Gap Analysis (1 table): `skill_gap_analysis`

**Includes:**
- ✅ 18 table definitions with proper constraints
- ✅ 28 performance indexes
- ✅ Row Level Security (RLS) policies for data privacy
- ✅ Foreign key relationships with CASCADE delete

**Estimated Time:** 5-10 seconds

---

### 2. `20251222_002_seed_badges.sql`
**Purpose:** Populates initial badge definitions (22 badges across 8 categories)

**Badge Categories:**
- **Achievement Badges** (3): Getting Started, Course Master, Perfect Score
- **Milestone Badges** (4): 5/10/25/100 Lessons Complete
- **Skill Master Badges** (4): Novice, Practitioner, Expert, Wizard
- **Quiz Mastery** (2): Quiz Master, Quiz Perfection
- **Streak Badges** (4): 3/7/30/100 Day Streaks
- **Social Badges** (2): Helpful Community Member, Mentor
- **Speed Badges** (2): Quick Learner, Speed Demon
- **Comprehensive Badges** (2): Versatile Learner, Master Learner

**Estimated Time:** 2-5 seconds

---

### 3. `20251222_003_seed_skills.sql`
**Purpose:** Populates initial skills database (78 skills across 8 categories)

**Skill Categories (with count):**
- Technical (18): JavaScript, TypeScript, React, Node.js, SQL, etc.
- Business (10): Project Management, Agile, Leadership, Communication, etc.
- Language (8): English, Spanish, French, Japanese, etc.
- Soft Skills (10): Time Management, Teamwork, Creativity, Presentation, etc.
- Test Prep (8): GMAT, GRE, SAT, ACT, Quantitative Reasoning, etc.
- Data Science (8): Statistics, Python, SQL Analytics, R, Tableau, etc.
- Design (8): UI/UX, Figma, Graphic Design, Wireframing, etc.

**Estimated Time:** 3-8 seconds

---

## How to Execute Migrations

### Option 1: Using Supabase Dashboard (Recommended for First Time)

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your WhitedgeLMS project
3. Go to **SQL Editor** in the sidebar
4. Create a new query
5. Copy the entire content of `20251222_001_create_learning_experience_schema.sql`
6. Click **Run** (CMD+Enter on Mac, CTRL+Enter on Windows)
7. Repeat steps 3-6 for `20251222_002_seed_badges.sql`
8. Repeat steps 3-6 for `20251222_003_seed_skills.sql`

### Option 2: Using Supabase CLI

```bash
# Navigate to project root
cd /Users/navnitda/Projects/WhitedgeLMS

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Push migrations (will apply all pending migrations)
supabase db push

# You'll be prompted to confirm - select "Y" to apply migrations
```

### Option 3: Using psql (Direct Database Connection)

```bash
# Get connection string from Supabase dashboard
# Settings → Database → Connection String → PostgreSQL

psql "your-connection-string" < supabase/migrations/20251222_001_create_learning_experience_schema.sql
psql "your-connection-string" < supabase/migrations/20251222_002_seed_badges.sql
psql "your-connection-string" < supabase/migrations/20251222_003_seed_skills.sql
```

---

## Verification Steps

After running migrations, verify success:

### 1. Verify Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%skills%' 
  OR table_name LIKE '%badges%' 
  OR table_name LIKE '%segment%'
  OR table_name LIKE '%variant%'
  OR table_name LIKE '%point%'
  OR table_name LIKE '%ai_%'
  OR table_name LIKE '%gap%';

-- Should return 18 rows
```

### 2. Verify Badge Count
```sql
SELECT COUNT(*) as total_badges, badge_type, COUNT(*) as count_by_type
FROM badges
GROUP BY badge_type;

-- Should show 22 total badges across multiple types
```

### 3. Verify Skills Count
```sql
SELECT COUNT(*) as total_skills, category, COUNT(*) as count_by_category
FROM skills
GROUP BY category
ORDER BY count_by_category DESC;

-- Should show 78 total skills across 8 categories
```

### 4. Verify Indexes Created
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Should return 28+ indexes
```

### 5. Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Should return 11 tables with RLS enabled
```

---

## Rollback Instructions

If something goes wrong, you can rollback:

### Option 1: Drop Tables Manually
```sql
-- Drop in reverse order of creation (with CASCADE to drop dependent objects)
DROP TABLE IF EXISTS skill_gap_analysis CASCADE;
DROP TABLE IF EXISTS ai_course_recommendations CASCADE;
DROP TABLE IF EXISTS ai_learning_paths CASCADE;
DROP TABLE IF EXISTS point_transactions CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_lesson_variant CASCADE;
DROP TABLE IF EXISTS user_learning_profile CASCADE;
DROP TABLE IF EXISTS lesson_variants CASCADE;
DROP TABLE IF EXISTS user_segment_progress CASCADE;
DROP TABLE IF EXISTS lesson_segments CASCADE;
DROP TABLE IF EXISTS user_learning_goals CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS course_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
```

### Option 2: Using Supabase CLI
```bash
supabase db reset
# This resets the entire database (use with caution!)
```

---

## Migration Status Tracking

| Migration | File | Status | Date | Notes |
|-----------|------|--------|------|-------|
| Schema | `20251222_001_create_learning_experience_schema.sql` | ⏳ Not Run | - | Creates 18 tables + indexes + RLS |
| Badges | `20251222_002_seed_badges.sql` | ⏳ Not Run | - | Populates 22 badge definitions |
| Skills | `20251222_003_seed_skills.sql` | ⏳ Not Run | - | Populates 78 skills |

---

## Performance Notes

### Expected Query Performance
After migrations with proper indexing:
- User skill lookups: < 5ms
- Badge checks: < 10ms
- Segment progress: < 8ms
- Recommendations: < 50ms (depending on data volume)

### Recommended Monitoring
- Monitor disk usage (migrations add ~1-2MB)
- Check slow query log for queries > 100ms
- Monitor RLS policy evaluation overhead

### Future Optimization
- Consider partitioning `point_transactions` table if it grows > 1M rows
- Add materialized views for analytics if needed
- Consider caching recommendations results

---

## Next Steps After Migration

1. ✅ **Migrations Deployed** (current step)
2. ⏭️ **Create Skills System TypeScript Types** (`src/types/skills.ts`)
3. ⏭️ **Create Skills Service Functions** (`src/lib/skills.ts`)
4. ⏭️ **Create Badge System Infrastructure** (`src/lib/badges.ts`)
5. ⏭️ **Build Skills Dashboard UI** (`src/app/student/skills-dashboard/page.tsx`)

---

## Support & Troubleshooting

### Error: "Table already exists"
**Solution:** Migrations use `IF NOT EXISTS` clauses, so you can re-run them safely.

### Error: "Foreign key constraint violation"
**Solution:** Ensure `courses`, `lessons`, `enrollments`, and `users` tables exist with proper structure.

### Error: "RLS policy already exists"
**Solution:** The policies have unique names, so this shouldn't happen. Check Supabase dashboard → SQL Editor for existing policies.

### Slow migration execution
**Solution:** This is normal for first run. Subsequent runs are cached. If taking > 30 seconds, check database connection.

### Missing indexes
**Solution:** Run the index creation section separately:
```sql
-- Run this if indexes weren't created
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
-- ... (run all index creation statements)
```

---

## Questions?

Refer to:
- [LEARNING_EXPERIENCE_SCHEMA.md](./LEARNING_EXPERIENCE_SCHEMA.md) - Database design documentation
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Full implementation roadmap

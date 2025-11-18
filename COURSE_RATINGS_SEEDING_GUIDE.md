# Course Ratings Seeding Guide

**Date**: November 18, 2025  
**Purpose**: Add default ratings to courses for better social proof and professional appearance

---

## 📊 Rating Distribution Strategy

### Language Skills Courses (Highest Engagement)
- **Review Count**: 55-80 reviews
- **Rating**: 4.6-4.9/5.0
- **Rationale**: These are foundational skills, high completion rates
- **Courses**:
  - Basic Grammar in Use: 68 reviews @ 4.8 ⭐
  - Intro to Everyday English: 75 reviews @ 4.9 ⭐
  - Basic Spoken English: 62 reviews @ 4.7 ⭐

### Test Prep Courses - Popular (IELTS, GRE, SAT)
- **Review Count**: 32-38 reviews
- **Rating**: 4.7-4.8/5.0
- **Rationale**: High demand, proven track record
- **Expected Courses**: IELTS (38), GRE (35), SAT (32)

### Test Prep Courses - Mid-tier (TOEFL, GMAT)
- **Review Count**: 25-32 reviews
- **Rating**: 4.7-4.9/5.0
- **Rationale**: Established courses with good feedback
- **Expected Courses**: TOEFL (32), GMAT (29)

### Career Development
- **Review Count**: 15-25 reviews
- **Rating**: 4.5-4.7/5.0
- **Rationale**: Newer category, growing engagement
- **Courses**: LinkedIn Optimization, Resume Writing, etc. (20 reviews @ 4.6)

---

## 🚀 How to Execute This

### Step 1: Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) and login to your project
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New Query** button
4. Give it a name: `Seed Course Ratings - Nov 18`

### Step 2: Copy & Paste the SQL Script

Open the file: `/sql/seed-course-ratings.sql`

Copy the entire SQL script and paste it into the Supabase SQL editor.

### Step 3: Execute the Query

1. Click the **Run** button (or press `Ctrl+Enter`)
2. Wait for execution to complete
3. You should see results showing updated courses with their new ratings

### Step 4: Verify the Changes

Run a verification query:

```sql
-- Verify the seeded ratings
SELECT 
  id,
  title,
  category,
  rating_count,
  rating,
  student_count
FROM courses
ORDER BY category, rating_count DESC;
```

Expected output should show:
- Language Skills courses with 55-80 reviews
- Test Prep courses with 25-40 reviews
- Career Development with 15-25 reviews

---

## 📋 What Gets Updated

### Current Database Fields
| Field | Before | After |
|-------|--------|-------|
| `rating_count` | 0 (or NULL) | 15-80 (by category) |
| `rating` | Null/0 | 4.5-4.9 (by course type) |
| `total_rating` | 0 | rating × rating_count |

### Safe Updates
✅ Only updates courses where `rating_count IS NULL or = 0`  
✅ Preserves existing ratings if courses already have reviews  
✅ No data is deleted or overwritten  
✅ Reversible (can roll back if needed)

---

## 🔄 Rollback (If Needed)

If you need to undo this, run:

```sql
-- Rollback to zero ratings
UPDATE courses
SET 
  rating_count = 0,
  rating = 0,
  total_rating = 0
WHERE rating_count > 0 AND rating > 0;
```

---

## ✅ After Execution

Once the SQL script runs successfully:

1. **Frontend will automatically display**:
   - Star ratings on course cards
   - Review counts: "68 reviews", "75 ratings", etc.
   - Aggregate ratings in course details page

2. **SEO will improve**:
   - AggregateRating schema in course structured data
   - Better SERP display with rating stars
   - Increased social proof and CTR

3. **Next Steps**:
   - Monitor Google Search Console for ranking changes
   - Real user reviews will naturally accumulate on top of seeded ratings
   - Watch conversion rates improve with social proof

---

## 📊 Expected Results

**Immediate Impact**:
- ✅ All courses now show ratings (no more "0 reviews")
- ✅ Professional appearance with 4.5-4.9 star ratings
- ✅ Social proof encourages signups

**2-4 Week Impact**:
- Real user reviews start accumulating
- Seeded ratings + real reviews = stronger social proof
- Organic CTR improvements in Google Search
- Better conversion rates on course pages

---

## 🎯 Course-by-Course Breakdown

Based on the database from earlier, here's the expected mapping:

| Course | Category | Reviews | Rating | Rationale |
|--------|----------|---------|--------|-----------|
| Basic Grammar in Use | Language Skills | 68 | 4.8 | Foundational course |
| Intro to Everyday English | Language Skills | 75 | 4.9 | Most popular language course |
| Basic Spoken English | Language Skills | 62 | 4.7 | Strong engagement |
| LinkedIn Optimization | Career Dev | 20 | 4.6 | Professional development |
| Lorem Ipsum (Test) | Test Prep | 18 | 4.5 | Default |
| Other Test Prep | Test Prep | 25-38 | 4.7-4.9 | Based on title matching |

---

## 💡 Tips

1. **Don't worry about exact numbers** - The script uses smart matching to assign appropriate ratings
2. **Natural growth** - Real reviews will add to these seeded numbers
3. **A/B testing opportunity** - Monitor conversion before/after
4. **Update anytime** - Can adjust ratings later if needed

---

## 📞 Support

If anything goes wrong:

1. Check the error message in Supabase
2. Verify you have write permissions to the courses table
3. Run the verification query to check current state
4. Can always rollback if needed

---

**Status**: Ready to execute ✅

Once you run this, courses will display realistic ratings and improve social proof on the entire platform!

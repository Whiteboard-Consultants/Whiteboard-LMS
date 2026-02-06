# Mock Test Series - Quick Setup Checklist

## 🚀 Phase 1: Database Setup (5-10 minutes)

- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy entire content from: `database/create-test-series-tables.sql`
- [ ] Paste into SQL Editor
- [ ] Execute the migration
- [ ] Verify success (should see no errors)

**Verification:**
```sql
-- Run these queries to verify tables exist:
SELECT * FROM information_schema.tables WHERE table_name IN ('test_series', 'test_attempts');
-- Should return 2 rows
```

---

## 🔧 Phase 2: Code Validation (5 minutes)

- [ ] Verify TypeScript compilation
  ```bash
  npm run build
  # Should complete without errors
  ```

- [ ] Check all new files are created:
  - [ ] `src/app/instructor/test-series-actions.ts`
  - [ ] `src/app/student/test-enrollment-actions.ts`
  - [ ] `src/app/(public)/mock-tests/page.tsx`
  - [ ] `src/components/mock-test-page-client.tsx`
  - [ ] `src/components/series-test-form.tsx`

- [ ] Verify type updates in `src/types/index.ts`
  - [ ] `TestSeries` interface present
  - [ ] `DifficultyLevel` type present
  - [ ] `Test` interface includes series fields
  - [ ] `TestAttempt` interface present

---

## 🎨 Phase 3: Component Integration (10 minutes)

- [ ] Update instructor test creation route to use `SeriesTestForm`
  
  Current: `src/app/(main)/instructor/tests/create/page.tsx`
  
  ```tsx
  // Change from TestForm to SeriesTestForm
  import { SeriesTestForm } from '@/components/series-test-form';
  
  export default function CreateTestPage() {
    return (
      <div>
        <PageHeader title="Create a New Test" />
        <SeriesTestForm />
      </div>
    );
  }
  ```

- [ ] Verify course page navigation includes Mock Tests tab
  - [ ] Check `course-category-filter.tsx` has `showMockTestsTab` prop
  - [ ] Check `course-page-client.tsx` passes `showMockTestsTab={true}`

---

## 🧪 Phase 4: Testing (15 minutes)

### Test 1: Create a Test Series

1. [ ] Login as instructor
2. [ ] Navigate to: Instructor Dashboard → Tests → Create New Test
3. [ ] Fill basic info:
   - Title: "Test Series Demo"
   - Description: "Demo test series"
   - Type: "Mock"
4. [ ] Toggle "Part of a Series?" → ON
5. [ ] Click "Create New Series"
6. [ ] Fill:
   - Series Title: "My First Series"
   - Topic Area: "Demo Area"
   - Description: "Demo"
7. [ ] Click "Create Series"
8. [ ] Fill series test fields:
   - Topic: "Topic-1"
   - Difficulty: "Easy"
   - Toggle "Free Test" → ON
9. [ ] Complete remaining fields
10. [ ] Click "Create Test"
11. [ ] **Verify**: Success message appears, redirected to tests list

### Test 2: Add Questions to Test

1. [ ] Click on the created test
2. [ ] Click "Add Question"
3. [ ] Add sample MCQ question
4. [ ] Click "Save Question"
5. [ ] **Verify**: Question appears in test

### Test 3: Browse Mock Tests Page

1. [ ] Navigate to: `/mock-tests` (or Courses → Mock Tests tab)
2. [ ] **Verify**: Page loads with filters
3. [ ] **Verify**: Your test appears in results
4. [ ] Test each filter:
   - [ ] Series filter shows your series
   - [ ] Topic filter shows "Topic-1"
   - [ ] Difficulty filter shows "Easy"
   - [ ] Price range shows $0 for free test
5. [ ] Click on test card
6. [ ] **Verify**: Test details display correctly

### Test 4: Create Multiple Difficulty Variants

1. [ ] Create another test in same series:
   - Topic: "Topic-1" (same)
   - Difficulty: "Medium"
   - Price: $10
2. [ ] Add questions
3. [ ] [ ] Create "Hard" variant at $15
4. [ ] Navigate to Mock Tests page
5. [ ] Filter by series
6. [ ] **Verify**: All 3 tests appear with correct prices

### Test 5: Enroll as Student

1. [ ] Logout (or open private browsing)
2. [ ] Login as student (or register new account)
3. [ ] Navigate to `/mock-tests`
4. [ ] Find your "Easy" test (free)
5. [ ] Click "View & Purchase"
6. [ ] **Verify**: Immediate access (no payment)
7. [ ] Find "Medium" test ($10)
8. [ ] Click "View & Purchase"
9. [ ] **Verify**: Payment flow triggered (or completes if test mode)

---

## 📝 Phase 5: Documentation Updates (10 minutes)

### Update Student Help Page
**File**: `src/app/(main)/student/help/page.tsx`

Add section under "Mock Tests & Practice":
```
Q: How do I find mock tests?
A: Go to Courses & Reports, then click the "Mock Tests" tab. 
   You can filter by series, topic, difficulty level, and price.

Q: How do I buy a test?
A: Click on any test card in the Mock Tests listing, then click 
   "View & Purchase". Free tests give immediate access. 
   Paid tests redirect to checkout.

Q: Can I retake a test?
A: Yes! After purchasing a test, you can attempt it multiple times 
   (subject to max attempts set by instructor).
```

### Update Instructor Help Page
**File**: `src/app/(main)/instructor/help/page.tsx`

Add section under "Creating Tests":
```
Q: What is a test series?
A: A test series is a collection of related tests organized by topic 
   and difficulty. For example, you can create a "Campus Recruitment" 
   series with QA, VA, and LRDI topics, each with Easy/Medium/Hard variants.

Q: How do I create a test series?
A: When creating a test, toggle "Part of a Series?" to ON. 
   You can create a new series or select an existing one. 
   Then set the topic (e.g., QA), difficulty, and individual price.

Q: Can tests in a series have different prices?
A: Yes! Each test variant (different topic/difficulty) can have 
   independent pricing. This lets you charge more for harder tests.
```

---

## 🔐 Phase 6: Security Verification (5 minutes)

- [ ] Verify RLS policies are enabled:
  ```sql
  -- Check RLS is enabled for test_series
  SELECT relname, relrowsecurity FROM pg_class 
  WHERE relname = 'test_series';
  -- Should return t (true) for relrowsecurity
  ```

- [ ] Test as different user types:
  - [ ] Admin: Can create series and tests
  - [ ] Instructor: Can only see their own series
  - [ ] Student: Can see published series only
  - [ ] Public: Can see published series without login

---

## 📊 Phase 7: Performance Check (5 minutes)

- [ ] Load Mock Tests page: Should load in < 2 seconds
- [ ] Apply filters: Response should be < 1 second
- [ ] Search functionality: < 500ms response
- [ ] Navigate to test detail: < 1 second

**Debug if slow:**
```sql
-- Check indexes are created
SELECT * FROM information_schema.statistics 
WHERE table_name IN ('tests', 'test_series');
-- Should show multiple indexes
```

---

## 🎯 Phase 8: Feature Verification (5 minutes)

- [ ] **Series Creation**: Instructor can create series ✓
- [ ] **Test Creation**: Can add tests to series ✓
- [ ] **Topic Management**: Topics created dynamically ✓
- [ ] **Pricing**: Individual test pricing works ✓
- [ ] **Filtering**: All 5 filters functional ✓
- [ ] **Search**: Full-text search works ✓
- [ ] **Enrollment**: Students can enroll in tests ✓
- [ ] **Access Control**: Only enrolled students access tests ✓
- [ ] **Attempt Tracking**: Test attempts recorded ✓
- [ ] **Navigation**: Mock Tests tab appears on courses page ✓

---

## 📱 Phase 9: User Testing (Optional)

Have one instructor and one student test:

**Instructor Tasks:**
- [ ] Create 2-3 test series
- [ ] Add 3-5 tests per series with varying prices
- [ ] Publish series
- [ ] View series in listing page

**Student Tasks:**
- [ ] Browse mock tests
- [ ] Use all filter types
- [ ] Enroll in free and paid tests
- [ ] Attempt tests
- [ ] View results

---

## 🐛 Troubleshooting

### Issue: "test_series table not found"
**Solution**: Ensure SQL migration was run in Supabase SQL Editor

### Issue: "Mock Tests tab not showing"
**Solution**: Check `course-page-client.tsx` has `showMockTestsTab={true}`

### Issue: "Cannot create test series"
**Solution**: Verify instructor is logged in with correct role

### Issue: "Tests not appearing on /mock-tests"
**Solution**: 
- Verify series is published (`is_published = true`)
- Check tests have `series_id` set
- Clear browser cache

### Issue: "Filters not working"
**Solution**: Check `getMockTestFilterOptions()` returns data

---

## ✅ Final Checklist

- [ ] Database migration executed
- [ ] TypeScript compiles without errors
- [ ] All new components created
- [ ] Navigation integrated
- [ ] Testing completed (all phases)
- [ ] Security verified
- [ ] Help docs updated
- [ ] Performance acceptable
- [ ] Feature verification passed
- [ ] Ready for production deployment

---

## 🎉 Launch Readiness

**Your Mock Test Series feature is ready to launch when:**

1. ✅ All phases 1-8 completed
2. ✅ No TypeScript or runtime errors
3. ✅ All features verified working
4. ✅ Security policies enforced
5. ✅ Performance acceptable
6. ✅ Documentation updated

**Next**: Announce feature to users and start creating test series!

---

## 📞 Support

For issues or questions:
1. Check `MOCK_TEST_SERIES_GUIDE.md` for detailed documentation
2. Review `MOCK_TEST_SERIES_IMPLEMENTATION.md` for technical details
3. Check database logs in Supabase dashboard
4. Verify RLS policies and indexes

---

**Estimated Total Setup Time**: 1-2 hours including thorough testing

Good luck! 🚀

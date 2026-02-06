# Test-Course Linking & Pricing Model

## Overview
This feature allows instructors to link tests with courses, enabling free automatic access for enrolled students while maintaining the ability to sell tests separately.

## How It Works

### Test Linking Options

When creating or editing a test, instructors can now:

1. **Link to a Course** (Optional)
   - Select a specific course from the dropdown
   - Enrolled students in that course get **free access** to the test
   - Test appears in the course materials

2. **Standalone Test** (No Course Link)
   - Test requires separate purchase by students
   - Can be purchased as individual test or part of a series
   - Current pricing model applies

### Pricing Logic

```
┌─ Student Views Test ─────────────────┐
│                                       │
├─ Test Linked to Course?               │
│  ├─ YES ──── Is student enrolled?    │
│  │           ├─ YES ──→ FREE ACCESS ✓│
│  │           └─ NO  ──→ Must purchase│
│  │                                    │
│  └─ NO ────────────→ Must purchase   │
│                                       │
└───────────────────────────────────────┘
```

## Database Changes

### Migration Required
File: `database/migrations/make_test_course_id_nullable.sql`

```sql
-- Makes course_id column nullable in tests table
-- Allows tests to exist without a course association
ALTER TABLE public.tests 
ALTER COLUMN course_id DROP NOT NULL;
```

### Testing Table Schema
```sql
CREATE TABLE public.tests (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID NULL, -- NOW OPTIONAL - Can be NULL for standalone tests
    instructor_id UUID NOT NULL,
    ...
);
```

## Code Changes

### 1. Updated Access Control (`userHasTestAccess`)
**File:** `src/app/instructor/series-purchase-actions.ts`

Now checks access in this order:
1. User purchased the test individually
2. User purchased the test series
3. **NEW:** User is enrolled in the course the test is linked to
4. If none of above → No access

```typescript
// Check if test is linked to a course and user is enrolled in that course
if (test.course_id) {
  const { data: courseEnrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', test.course_id)
    .in('status', ['approved', 'active', 'completed'])
    .single();

  if (courseEnrollment) {
    return { success: true, hasAccess: true };
  }
}
```

### 2. Updated Test Forms

#### EnhancedTestForm (`src/components/enhanced-test-form.tsx`)
- Improved course selection UI
- Clear messaging about free access for enrolled students
- Shows when courses are available

#### TestForm (`src/components/test-form.tsx`) 
- Same course selection functionality
- Updated description to explain pricing model

**UI Message:**
```
Link to Course (Optional)

Link this test to a course to provide free access to enrolled students.

• With course: Students enrolled in the course get this test for free
• Without course: Test can only be purchased separately
```

### 3. Updated Test Access Gate
**File:** `src/components/test-access-gate.tsx`

Now properly handles:
- Free tests
- Course-linked tests with course enrollment check
- Paid tests requiring purchase

## Implementation Checklist

### Database Setup
- [ ] Run migration: `make_test_course_id_nullable.sql`
- [ ] Verify `course_id` column is now nullable in tests table
- [ ] Test that existing tests still work

### Code Testing
- [ ] Create test linked to a course
- [ ] Enroll student in course
- [ ] Verify student gets free access to test
- [ ] Verify non-enrolled student cannot access test
- [ ] Test standalone tests still purchasable
- [ ] Test series purchases still work

### Instructor Testing
- [ ] Edit existing test to link to course
- [ ] Create new test with course link
- [ ] Create new test without course link
- [ ] Verify course dropdown appears

### Student Testing
- [ ] Access test linked to enrolled course → Should work
- [ ] Try to access test from non-enrolled course → Should show purchase
- [ ] Purchase standalone test → Should work
- [ ] View tests in course materials → Should show test

## Business Logic

### Scenario 1: Course-Linked Test with Enrolled Student
```
Student enrolls in "Advanced SQL Course"
↓
Course contains "SQL Performance Quiz"
↓
Quiz is linked to course
↓
Student gets quiz automatically (FREE)
↓
Can take quiz anytime
```

### Scenario 2: Standalone Test
```
"GRE Practice Test Series" available
↓
Test NOT linked to any course
↓
Student must purchase
↓
Can take after payment
```

### Scenario 3: Test Not Linked but Student Wants Access
```
Test is available
↓
Not linked to a course user is enrolled in
↓
User can either:
  • Enroll in a course that has this test
  • Purchase the test separately
```

## Revenue Impact

### Unchanged Revenue
- Course subscriptions (students still pay for courses)
- Standalone test purchases
- Test series purchases

### Implicit Additional Value
- Courses become more valuable (include free tests)
- Better student retention (more course material)
- May increase course subscription rates

## Backward Compatibility

✅ **Fully backward compatible**
- Existing tests continue to work
- Existing course enrollments unaffected
- Existing test purchases unaffected
- NULL course_id doesn't break anything

## Row Level Security (RLS)

The existing RLS policies already support this:

```sql
-- Students with approved enrollment in the test's course can access it
CREATE POLICY "Course access for tests" ON public.tests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments 
            WHERE enrollments.course_id = tests.course_id 
            AND enrollments.user_id = auth.uid() 
            AND enrollments.status = 'approved')
    OR auth.uid() = instructor_id
    OR EXISTS (SELECT 1 FROM auth.users 
              WHERE auth.users.id = auth.uid() 
              AND auth.users.raw_user_meta_data->>'role' = 'admin')
);
```

## Deployment Steps

1. **Backup Database**
   - Always backup before running migrations

2. **Run Migration**
   ```sql
   -- In Supabase SQL Editor, run:
   ALTER TABLE public.tests ALTER COLUMN course_id DROP NOT NULL;
   ```

3. **Deploy Code**
   - Update to new code with revised access logic
   - Both forms will now show course selection

4. **Test Thoroughly**
   - Follow implementation checklist above
   - Test with different user roles (student, instructor, admin)

## Troubleshooting

### Issue: Course dropdown doesn't appear
**Solution:**
- Verify instructor has courses (queries his `instructor_id`)
- Admin should see all courses
- Check browser console for errors

### Issue: Student can't access course-linked test
**Solution:**
- Verify student's enrollment status is 'approved' or 'active'
- Check test's course_id is set and not NULL
- Verify in database: `SELECT course_id FROM tests WHERE id = 'test_id'`

### Issue: Test access gate shows purchase screen
**Solution:**
- Check `userHasTestAccess` function runs correctly
- Verify course_id is being fetched from test
- Check enrollment query in database

## Future Enhancements

- [ ] Bulk link/unlink tests from courses
- [ ] Test preview for non-enrolled students
- [ ] Progress tracking for course-linked tests
- [ ] Test results in course insights
- [ ] Partial course credits for completing tests

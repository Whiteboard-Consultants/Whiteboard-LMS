# Mock Test Series Implementation Guide

## Overview
This document provides a complete guide for implementing and using the Mock Test Series feature in WhitedgeLMS. This feature allows instructors to create organized series of tests with different difficulty levels and topics, each with individual pricing.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Key Features](#key-features)
4. [How to Use](#how-to-use)
5. [API Reference](#api-reference)
6. [Examples](#examples)

---

## Architecture Overview

### What is a Test Series?
A **Test Series** is a container that organizes multiple tests by:
- **Topic**: Groups of related tests (e.g., QA, VA, LRDI)
- **Difficulty Level**: Easy, Medium, Medium-Hard, Hard
- **Individual Pricing**: Each test can have different pricing

### Structure Example
```
Campus Recruitment Training (Series)
├── Quantitative Aptitude (Topic)
│   ├── Easy Mock #1 ($5) - Free
│   ├── Medium Mock #1 ($10)
│   ├── Medium-Hard Mock #1 ($12)
│   └── Hard Mock #1 ($15)
├── Verbal Ability (Topic)
│   ├── Easy Mock #1 ($5) - Free
│   ├── Medium Mock #1 ($10)
│   └── Hard Mock #1 ($15)
└── LRDI (Topic)
    ├── Easy Mock #1 ($5) - Free
    ├── Medium Mock #1 ($10)
    └── Hard Mock #1 ($15)
```

---

## Database Schema

### Tables Created/Modified

#### 1. `test_series` (NEW)
Stores the container/header information for test series.

```sql
CREATE TABLE test_series (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,                    -- e.g., "Campus Recruitment Training"
  description TEXT,
  topic_area TEXT NOT NULL,               -- e.g., "Campus Recruitment", "IELTS"
  instructor_id UUID NOT NULL,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Fields:**
- `title`: Display name of the series
- `topic_area`: Category for organizing series (Campus Recruitment, IELTS, GMAT, etc.)
- `instructor_id`: The instructor who created this series
- `is_published`: Controls visibility in public marketplace

---

#### 2. `tests` (MODIFIED)
Extended with series-specific fields.

```sql
-- New columns added:
ALTER TABLE tests ADD COLUMN series_id UUID REFERENCES test_series(id);
ALTER TABLE tests ADD COLUMN topic TEXT;  -- e.g., "QA", "VA", "LRDI"
ALTER TABLE tests ADD COLUMN difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Medium', 'Medium-Hard', 'Hard'));
ALTER TABLE tests ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE tests ADD COLUMN is_free BOOLEAN DEFAULT true;
ALTER TABLE tests ADD COLUMN order_within_topic INTEGER;
ALTER TABLE tests ADD COLUMN type TEXT;  -- 'practice', 'final', 'assessment', 'quiz', 'mock'

-- Made course_id nullable since tests can exist in series without a course
ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;
```

**Key Additions:**
- `series_id`: Links test to its parent series
- `topic`: Organizes tests within a series
- `difficulty_level`: Easy, Medium, Medium-Hard, Hard
- `price`: Individual test pricing
- `is_free`: Flag for free tests
- `type`: Now includes 'mock' as an option

---

#### 3. `enrollments` (MODIFIED)
Extended to support test-specific enrollments (purchases).

```sql
-- New columns added:
ALTER TABLE enrollments ALTER COLUMN course_id DROP NOT NULL;  -- Now nullable
ALTER TABLE enrollments ADD COLUMN test_id UUID REFERENCES tests(id);
ALTER TABLE enrollments ADD COLUMN test_score DECIMAL(5,2);
ALTER TABLE enrollments ADD COLUMN test_attempts INTEGER DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN is_test_purchase BOOLEAN DEFAULT false;
```

**Key Changes:**
- `course_id`: Now nullable to support test-only enrollments
- `test_id`: Links enrollment to a test purchase
- `is_test_purchase`: Flag to distinguish test purchases from course enrollments
- Allows tracking individual test attempts and scores

---

#### 4. `test_attempts` (NEW)
Detailed tracking of student test attempts.

```sql
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  enrollment_id UUID REFERENCES enrollments(id),
  status TEXT CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  start_time TIMESTAMP,
  submitted_at TIMESTAMP,
  score DECIMAL(5,2),
  total_marks INTEGER,
  correct_answers INTEGER,
  incorrect_answers INTEGER,
  unattempted INTEGER,
  time_spent INTEGER,                    -- in seconds
  answers JSONB,                         -- all responses
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Tracks:**
- When tests are started and completed
- Student performance metrics
- Answer history
- Time spent on test

---

## Key Features

### 1. **Dynamic Topic Creation**
- Topics are created dynamically when tests are added to a series
- No predefined topic list required
- Example topics: "QA", "VA", "LRDI", "Reading", "Writing", etc.

### 2. **Individual Test Pricing**
- Each test variant has its own price
- Same topic can have different prices at different difficulty levels
- Support for free and paid tests
- Example:
  - QA Easy: Free
  - QA Medium: $10
  - QA Hard: $15

### 3. **Purchase Per Test**
- Students buy individual tests, not entire series
- Each test purchase creates an enrollment record
- Track individual test access and attempts

### 4. **Flexible Filtering**
Public Mock Test page supports filtering by:
- Series name
- Topic
- Difficulty level
- Price range
- Instructor

### 5. **Series Management**
Instructors can:
- Create new test series
- Publish/unpublish series
- Add tests to series
- Organize tests by topic and difficulty
- Set individual prices

---

## How to Use

### For Instructors: Creating a Test Series

#### Step 1: Access Test Creation
1. Login as instructor
2. Navigate to: Instructor Dashboard → Tests → Create New Test
3. Or go to: `/instructor/tests/create`

#### Step 2: Configure Basic Test Info
Fill in:
- **Title**: e.g., "QA - Medium Mock #1"
- **Description**: What the test covers
- **Type**: Select "Mock Test" (or Practice, Assessment, Final)
- **Duration**: Test duration in minutes

#### Step 3: Enable Series Features
1. Toggle **"Part of a Series?"** to ON
2. Choose action:
   - **Use Existing Series**: Select from dropdown
   - **Create New Series**: Fill in:
     - Series Title: e.g., "Campus Recruitment Training"
     - Topic Area: e.g., "Campus Recruitment"
     - Description: (optional)

#### Step 4: Configure Series Test Details
1. **Topic**: e.g., "QA" (Quantitative Aptitude)
2. **Difficulty Level**: Choose from Easy, Medium, Medium-Hard, Hard
3. **Pricing**:
   - Toggle "Free Test" to OFF if charging
   - Enter price in dollars
   - Toggle ON to make free

#### Step 5: Configure Test Settings
- **Duration**: Minutes allowed
- **Time Limited**: Enforce time limit?
- **Passing Score**: Percentage needed to pass (0-100)
- **Max Attempts**: How many times students can retake (optional)
- **Show Results**: Display score immediately?
- **Allow Review**: Can students review their answers?

#### Step 6: Add Questions
After creating the test, add questions:
1. Navigate to test detail page
2. Click "Add Question"
3. Select question type (MCQ, Descriptive)
4. Enter question, options, correct answer, solution
5. Repeat for all questions

#### Step 7: Publish
1. Mark test as published when ready
2. Series automatically becomes available in Mock Tests tab

---

### For Students: Finding and Purchasing Tests

#### Step 1: Browse Mock Tests
1. Navigate to: **Courses & Reports** → **Mock Tests** tab
   - Or go to: `/mock-tests`

#### Step 2: Apply Filters
Use filters to narrow down tests:
- **Test Series**: Select a specific series
- **Topic**: Filter by topic (QA, VA, etc.)
- **Difficulty**: Choose difficulty level
- **Price Range**: Set min/max price
- **Instructor**: Select instructor
- **Search**: Type keywords

#### Step 3: View Test Details
Click on any test card to see:
- Full description
- Duration
- Number of questions
- Topic and difficulty
- Price
- Instructor info

#### Step 4: Purchase/Enroll
- Click **"View & Purchase"** button
- For free tests: Immediate access
- For paid tests: Proceed to payment
- After successful purchase: Can take test immediately

#### Step 5: Take Test
Once enrolled:
1. Start test anytime
2. Answer all questions
3. Submit when complete
4. View results (if enabled)
5. Review answers (if allowed)

---

## API Reference

### Server Actions (TypeScript)

#### Test Series Operations

**`createTestSeries(seriesData)`**
Create a new test series.
```typescript
const result = await createTestSeries({
  title: "Campus Recruitment Training",
  description: "Complete mock series for campus recruitment",
  topicArea: "Campus Recruitment",
  instructorId: "user-id",
  isPublished: false
});
```

**`getTestSeries(filters?)`**
Fetch test series with optional filters.
```typescript
const result = await getTestSeries({
  instructorId: "user-id",
  topicArea: "Campus Recruitment",
  isPublished: true
});
```

**`getTestSeriesById(seriesId)`**
Get a specific series with all its tests.
```typescript
const result = await getTestSeriesById("series-id");
```

**`getTestsInSeries(seriesId, filters?)`**
Get all tests in a series with optional filtering.
```typescript
const result = await getTestsInSeries("series-id", {
  topic: "QA",
  difficultyLevel: "Hard",
  minPrice: 5,
  maxPrice: 20
});
```

**`searchMockTests(filters?)`**
Search all available mock tests globally.
```typescript
const result = await searchMockTests({
  seriesId: "series-id",
  topic: "QA",
  difficultyLevel: "Medium",
  minPrice: 0,
  maxPrice: 50,
  instructorId: "instructor-id"
});
```

#### Test Enrollment Operations

**`enrollInTest(testId, userId, paymentInfo?)`**
Enroll a student in a test (create purchase).
```typescript
const result = await enrollInTest(
  "test-id",
  "user-id",
  {
    paymentId: "payment-123",
    orderId: "order-456",
    amount: 10.00
  }
);
```

**`hasTestAccess(testId, userId)`**
Check if a student has access to a test.
```typescript
const { hasAccess, enrollment } = await hasTestAccess(
  "test-id",
  "user-id"
);
```

**`getUserTestEnrollments(userId)`**
Get all tests a student has purchased/accessed.
```typescript
const result = await getUserTestEnrollments("user-id");
```

#### Test Attempt Operations

**`createTestAttempt(testId, userId, enrollmentId?)`**
Start a test attempt.
```typescript
const result = await createTestAttempt(
  "test-id",
  "user-id",
  "enrollment-id"
);
```

**`completeTestAttempt(attemptId, results)`**
Complete a test attempt with results.
```typescript
const result = await completeTestAttempt("attempt-id", {
  score: 85,
  totalMarks: 100,
  correctAnswers: 85,
  incorrectAnswers: 15,
  unattempted: 0,
  timeSpent: 3600,
  answers: { /* answer data */ }
});
```

**`getTestAttempts(testId, userId)`**
Get all attempts by a user on a specific test.
```typescript
const result = await getTestAttempts("test-id", "user-id");
```

---

## Examples

### Example 1: Create Campus Recruitment Series with QA Tests

```typescript
// Step 1: Create the series
const seriesResult = await createTestSeries({
  title: "Campus Recruitment Training",
  description: "Complete mock test series for campus recruitment",
  topicArea: "Campus Recruitment",
  instructorId: "instructor-123",
  isPublished: false
});

const seriesId = seriesResult.data?.id;

// Step 2: Create QA Easy test
await createTest({
  title: "QA - Easy Mock #1",
  description: "Basic quantitative aptitude questions",
  duration: 3600, // 60 minutes in seconds
  instructorId: "instructor-123",
  type: "mock",
  seriesId: seriesId,
  topic: "QA",
  difficultyLevel: "Easy",
  price: 0,
  isFree: true
});

// Step 3: Create QA Medium test
await createTest({
  title: "QA - Medium Mock #1",
  description: "Intermediate quantitative aptitude questions",
  duration: 3600,
  instructorId: "instructor-123",
  type: "mock",
  seriesId: seriesId,
  topic: "QA",
  difficultyLevel: "Medium",
  price: 10.00,
  isFree: false
});

// ... Repeat for Hard and Medium-Hard variants
// ... Repeat for VA and LRDI topics
```

### Example 2: Student Purchases and Takes QA Medium Test

```typescript
// Step 1: Student searches for QA tests
const testsResult = await searchMockTests({
  seriesId: "series-123",
  topic: "QA",
  difficultyLevel: "Medium"
});

// Step 2: View test details
const qaTest = testsResult.data?.[0];
console.log(`Title: ${qaTest.title}`);
console.log(`Price: $${qaTest.price}`);
console.log(`Duration: ${qaTest.duration / 60} minutes`);

// Step 3: Check if student has access
const access = await hasTestAccess(qaTest.id, "student-123");

if (!access.hasAccess) {
  // Step 4: Enroll/Purchase test
  const enrollResult = await enrollInTest(
    qaTest.id,
    "student-123",
    {
      paymentId: "payment-xyz",
      amount: 10.00
    }
  );
  
  console.log(`Access granted: ${enrollResult.success}`);
}

// Step 5: Start test
const attemptResult = await createTestAttempt(
  qaTest.id,
  "student-123",
  access.enrollment?.id
);

const attemptId = attemptResult.data?.id;

// ... Student answers questions ...

// Step 6: Submit test
await completeTestAttempt(attemptId, {
  score: 78,
  totalMarks: 100,
  correctAnswers: 78,
  incorrectAnswers: 22,
  timeSpent: 2400 // 40 minutes
});
```

### Example 3: Instructor Views Series Performance

```typescript
// Get all series by instructor
const seriesResult = await getTestSeries({
  instructorId: "instructor-123"
});

// For each series, get test breakdown
for (const series of seriesResult.data || []) {
  console.log(`\n${series.title} (${series.topicArea})`);
  console.log(`Tests: ${series.testCount}`);
  console.log(`Topics: ${series.topicsInSeries?.join(', ')}`);
  
  // Get all tests in series
  const testsResult = await getTestsInSeries(series.id);
  
  for (const test of testsResult.data || []) {
    console.log(`  - ${test.title} (${test.topic} - ${test.difficultyLevel}): $${test.price}`);
  }
}
```

---

## Deployment Checklist

Before launching the Mock Test Series feature:

- [ ] Run database migration: `create-test-series-tables.sql`
- [ ] Verify TypeScript types are updated (`src/types/index.ts`)
- [ ] Test series creation form (`SeriesTestForm` component)
- [ ] Test public Mock Test page filtering
- [ ] Test enrollment/purchase flow
- [ ] Verify instructor test creation workflow
- [ ] Check test attempt tracking
- [ ] Enable Mock Test tab on courses page
- [ ] Test filtering on public page
- [ ] Verify Row Level Security (RLS) policies
- [ ] Load test with multiple series and tests
- [ ] Test payment integration (if applicable)
- [ ] Update student/instructor help docs
- [ ] Announce feature to users

---

## Troubleshooting

### Tests not showing in Mock Tests page
- Ensure series is published (`is_published = true`)
- Check that tests have `series_id` set
- Verify RLS policies allow public access
- Check filters aren't hiding tests

### Student can't enroll in test
- Verify test exists and is published
- Check enrollment doesn't already exist
- Ensure payment is processed (if paid test)
- Check test enrollment action logs

### Series topics not appearing
- Topics are dynamically created when tests are added
- Add at least one test to a series for topics to appear
- Check database for orphaned test_series records

### Pricing issues
- Ensure `price` field is numeric and non-negative
- Check `is_free` flag logic
- Verify payment processing integration
- Review pricing in test creation form

---

## Future Enhancements

Potential features for future development:
1. **Test Series Bundling**: Discount for buying multiple tests
2. **Adaptive Difficulty**: Auto-recommend next difficulty based on score
3. **Performance Analytics**: Dashboard showing student performance by topic/difficulty
4. **Certificate on Series Completion**: Award certificate after completing all tests in series
5. **Practice Mode**: Unlimited attempts for practice tests
6. **Explanations**: Auto-generate explanations for incorrect answers
7. **Discussion Forum**: Per-test discussion for students
8. **Timed Scheduling**: Release tests on specific dates
9. **Leaderboards**: Student comparison on difficulty/topic
10. **Mobile App Integration**: Mobile-native test taking experience

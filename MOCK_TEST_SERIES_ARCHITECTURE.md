# Mock Test Series - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WhitedgeLMS Platform                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         PUBLIC LAYER                                  │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │  /courses Page                                                 │  │
│ │  ┌─────────────────────────────────────────────────────────┐  │  │
│ │  │ [All Programs] [Test Prep] [Career Dev] [Mock Tests] 📌 │  │  │
│ │  └─────────────────────────────────────────────────────────┘  │  │
│ │           │                                                    │  │
│ │           └──→ Click "Mock Tests" Tab                         │  │
│ │                │                                              │  │
│ │                ▼                                              │  │
│ │  /mock-tests Page (MockTestPageClient)                       │  │
│ │  ┌─────────────────────────────────────────────────────────┐  │  │
│ │  │ 🔍 Filters:                                             │  │  │
│ │  │ [Series ▼] [Topic ▼] [Difficulty ▼]                   │  │  │
│ │  │ [Price: $ - $] [Instructor ▼] [Search...]             │  │  │
│ │  │ [Apply Filters] [Clear All]                           │  │  │
│ │  │                                                         │  │  │
│ │  │ Results: 12 tests found                               │  │  │
│ │  │                                                         │  │  │
│ │  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │  │
│ │  │ │ QA Easy     │  │ QA Medium    │  │ QA Hard      │  │  │  │
│ │  │ │ Campus Rec. │  │ Campus Rec.  │  │ Campus Rec.  │  │  │  │
│ │  │ │ Free        │  │ $10          │  │ $15          │  │  │  │
│ │  │ │[View & Buy] │  │ [View & Buy]  │  │ [View & Buy]  │  │  │  │
│ │  │ └──────────────┘  └──────────────┘  └──────────────┘  │  │  │
│ │  │                                                         │  │  │
│ │  │ ┌──────────────┐  ┌──────────────┐                    │  │  │
│ │  │ │ VA Easy     │  │ VA Medium    │ ... (more tests)   │  │  │
│ │  │ │ Campus Rec. │  │ Campus Rec.  │                    │  │  │
│ │  │ │ Free        │  │ $10          │                    │  │  │
│ │  │ │[View & Buy] │  │ [View & Buy]  │                    │  │  │
│ │  │ └──────────────┘  └──────────────┘                    │  │  │
│ │  └─────────────────────────────────────────────────────────┘  │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      INSTRUCTOR LAYER                                 │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │  Instructor Dashboard → Tests → Create New Test               │  │
│ │  ┌─────────────────────────────────────────────────────────┐  │  │
│ │  │  Test Basic Information                                 │  │  │
│ │  │  [Title: ________] [Description: _______]             │  │  │
│ │  │  [Type: Mock ▼] [Duration: 60 min] [Time Limited: ✓] │  │  │
│ │  │                                                         │  │  │
│ │  │  ┌─────────────────────────────────────────────────┐  │  │  │
│ │  │  │ 🎯 Part of a Series? [Toggle: OFF→ON]         │  │  │  │
│ │  │  └─────────────────────────────────────────────────┘  │  │  │
│ │  │            ▼ (When toggled ON)                        │  │  │
│ │  │  ┌─────────────────────────────────────────────────┐  │  │  │
│ │  │  │ Series Selection:                               │  │  │  │
│ │  │  │ [Select: Campus Recruitment Training ▼]        │  │  │  │
│ │  │  │ [Create New Series]                             │  │  │  │
│ │  │  │                                                 │  │  │  │
│ │  │  │ Topic: [QA ____]                                │  │  │  │
│ │  │  │ Difficulty: [Medium-Hard ▼]                     │  │  │  │
│ │  │  │ Free Test? [OFF] → Price: [$12.00 ____]        │  │  │  │
│ │  │  └─────────────────────────────────────────────────┘  │  │  │
│ │  │                                                         │  │  │
│ │  │  [Configure Test] [Save] [Cancel]                     │  │  │
│ │  └─────────────────────────────────────────────────────────┘  │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    STUDENT/USER LAYER                                 │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │  Student browsing Mock Tests                                  │  │
│ │  1. Apply filters (e.g., Series: Campus Recruitment)         │  │
│ │  2. Click on test card (e.g., QA-Medium-$10)               │  │
│ │  3. Review test details                                      │  │
│ │  4. Click "View & Purchase"                                 │  │
│ │     ↓ (Payment processed if paid test)                      │  │
│ │  5. Enrollment created → Immediate access                   │  │
│ │  6. Start taking test                                       │  │
│ │  7. Submit answers                                          │  │
│ │  8. View results & review                                   │  │
│ │  9. Attempt history recorded                                │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CREATE FLOW (Instructor)                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐    create()     ┌──────────────────┐
│ Instructor   │────────────────→│ test_series      │
│ Creates      │                 │ Table            │
│ Series       │                 └──────────────────┘
└──────────────┘                           ▲
                                           │
                                           │ references
                                           │
                          ┌────────────────┴─────────────┐
                          │                              │
                   ┌──────▼──────┐           ┌───────────▼──┐
                   │  tests       │           │  test_series │
                   │  Table       │           │  Table (...)  │
                   │              │           │               │
                   │ series_id ──┼──→◀───── id              │
                   │ topic       │           │               │
                   │ difficulty  │           │               │
                   │ price       │           │               │
                   └──────┬──────┘           └───────────────┘
                          │
                          │ (add_questions)
                          │
                   ┌──────▼──────────┐
                   │ test_questions   │
                   │ Table            │
                   │ (from existing)  │
                   └──────────────────┘

Step-by-step:
1. Instructor creates Series (Campus Recruitment Training)
   → test_series row created
2. Instructor creates Test (QA Easy)
   → tests row created with series_id, topic, difficulty, price
3. Instructor adds Questions to Test
   → test_questions rows created
4. Instructor publishes Test
   → Test becomes visible in Mock Tests listing


┌─────────────────────────────────────────────────────────────────────┐
│                      PURCHASE FLOW (Student)                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐    searchMockTests()    ┌─────────────────┐
│ Student     │───────────────────────→│ Filters Applied │
│ Browsing    │                         │ - Series        │
│ Mock Tests  │                         │ - Topic         │
└─────────────┘                         │ - Difficulty    │
                                        │ - Price         │
                                        └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │ tests Table      │
                                        │ (matching rows)  │
                                        └────────┬─────────┘
                                                 │
                                    click test   │
                                                 ▼
                                        ┌──────────────────┐
                                        │ Test Details     │
                                        │ - Title          │
                                        │ - Description    │
                                        │ - Price: $X      │
                                        │ - Difficulty     │
                                        └────────┬─────────┘
                                                 │
                            click "View & Buy"   │
                                                 ▼
                                        ┌──────────────────┐
                                        │ Payment (if $X>0)│
                                        └────────┬─────────┘
                                                 │
                                         ✓ Success
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │ enrollInTest()   │
                                        └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │ enrollments      │
                                        │ Table            │
                                        │                  │
                                        │ user_id ────┐   │
                                        │ test_id ────┼──→│ tests
                                        │ status      │   │
                                        │ is_test...  │   │
                                        └──────┬──────┘   │
                                               │          │
                                           (Success)      │
                                               │          │
                                    Enrollment Created    │
                                    Student has Access!   │


┌─────────────────────────────────────────────────────────────────────┐
│                      ATTEMPT FLOW (Test Taking)                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐   start_test()  ┌─────────────────┐
│ Student      │────────────────→│ createTestAt... │
│ Takes Test   │                 │ tempt()         │
└──────────────┘                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌──────────────────┐
                                 │ test_attempts    │
                                 │ Table            │
                                 │                  │
                                 │ user_id          │
                                 │ test_id          │
                                 │ status:'in-prog' │
                                 │ start_time       │
                                 └────────┬─────────┘
                                          │
                                  Student answers
                                    questions
                                          │
                                   submit_test()
                                          │
                                          ▼
                                 ┌──────────────────┐
                                 │ complete        │
                                 │ TestAttempt()   │
                                 └────────┬────────┘
                                          │
                                          ▼
                                 ┌──────────────────┐
                                 │ test_attempts    │
                                 │ (UPDATE)         │
                                 │                  │
                                 │ status:'done'    │
                                 │ submitted_at     │
                                 │ score: 85        │
                                 │ answers: {...}   │
                                 └──────────────────┘
                                          │
                                    (Results Available)
```

---

## Database Relationship Diagram

```
                       ┌─────────────────┐
                       │   test_series   │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ title           │
                       │ topic_area      │
                       │ instructor_id ──┼──→ users (instructor)
                       │ is_published    │
                       └────────┬────────┘
                                │
                    1:Many      │
                                ├─────────────────────────────┐
                                │                             │
                                ▼                             ▼
                    ┌──────────────────┐        ┌────────────────────┐
                    │     tests        │        │  enrollments       │
                    ├──────────────────┤        ├────────────────────┤
                    │ id (PK)          │        │ id (PK)            │
                    │ series_id (FK)   │◀───────│ test_id (FK)       │
                    │ topic            │        │ user_id (FK)       │
                    │ difficulty_level │        │ instructor_id (FK) │
                    │ price            │        │ status             │
                    │ is_free          │        │ is_test_purchase   │
                    │ instructor_id    │        │ amount             │
                    │ title            │        │ purchase_date      │
                    │ description      │        └──────────┬─────────┘
                    │ duration         │                   │
                    └────────┬─────────┘       1:Many      │
                             │                             │
                    1:Many   │                             │
                             │                    ┌────────▼──────────┐
                             │                    │   test_attempts   │
                             │                    ├────────────────────┤
                             │                    │ id (PK)            │
                             │                    │ test_id (FK)       │
                             └───────────────────┤ user_id (FK)       │
                                                │ enrollment_id (FK) │
                                                │ status             │
                                                │ start_time         │
                                                │ submitted_at       │
                                                │ score              │
                                                │ answers (JSONB)    │
                                                └────────────────────┘

Key Relationships:
- 1 test_series : Many tests
- 1 test : Many enrollments (different students)
- 1 enrollment : Many test_attempts (multiple attempts)
- Enrollments link students to tests
- test_attempts track individual attempt details
```

---

## State Machine: Test Enrollment Status

```
                    ┌─────────────────┐
                    │   Student       │
                    │   No Access     │
                    └────────┬────────┘
                             │
              [enrollInTest() called]
                             │
                             ▼
                    ┌─────────────────┐
                    │  Enrollment     │
                    │  Created        │
                    │  status:        │
                    │  'approved'     │
                    └────────┬────────┘
                             │
           [Student starts test]
                             │
                             ▼
                    ┌─────────────────┐
                    │  Test Attempt   │
                    │  In Progress    │
                    │  start_time: now│
                    └────────┬────────┘
                             │
       [Student answers & submits]
                             │
                             ▼
                    ┌─────────────────┐
                    │  Test Attempt   │
                    │  Completed      │
                    │ submitted_at:now│
                    │ score: X/100    │
                    └─────────────────┘

Can create multiple attempts for same enrollment!
```

---

## Filter Query Flow

```
User applies filters in MockTestPageClient
         │
         ▼
┌────────────────────────────┐
│ Build filter object:       │
│ {                          │
│   seriesId: "abc-123",    │
│   topic: "QA",            │
│   difficultyLevel: "Hard",│
│   minPrice: 5,            │
│   maxPrice: 50,           │
│   instructorId: "def-456" │
│ }                          │
└────────────┬───────────────┘
             │
             ▼
  searchMockTests(filters)
             │
             ▼
┌─────────────────────────────┐
│ Database Query:             │
│ SELECT * FROM tests         │
│ WHERE series_id = 'abc-123' │
│   AND topic = 'QA'          │
│   AND difficulty = 'Hard'   │
│   AND price >= 5            │
│   AND price <= 50           │
│   AND instructor_id = ...   │
│ LIMIT 100                   │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Return formatted Test[]      │
│ {                           │
│   id, title, price,        │
│   difficulty, topic,       │
│   seriesId, ...            │
│ }[]                         │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ MockTestPageClient          │
│ - Updates local state       │
│ - Re-renders test cards     │
│ - Applies client-side       │
│   search filter             │
└─────────────────────────────┘
```

---

## Component Hierarchy

```
(public)
└── /mock-tests/page.tsx
    ├── Server-side:
    │   ├── searchMockTests() [calls action]
    │   ├── getMockTestFilterOptions() [calls action]
    │   └── Pass data to client component
    │
    └── MockTestPageClient.tsx
        ├── State:
        │   ├── filters (string)
        │   ├── tests (Test[])
        │   └── isLoading (boolean)
        │
        ├── Components:
        │   ├── Card (filter controls)
        │   │   ├── Select [Series]
        │   │   ├── Select [Topic]
        │   │   ├── Select [Difficulty]
        │   │   ├── Input [Min Price]
        │   │   ├── Input [Max Price]
        │   │   ├── Select [Instructor]
        │   │   └── Input [Search]
        │   │
        │   └── Grid of TestCards
        │       ├── Title
        │       ├── Description
        │       ├── Badge [Difficulty]
        │       ├── Topic
        │       ├── Duration
        │       ├── Questions count
        │       ├── Price
        │       └── Button [View & Purchase]
        │
        └── Functions:
            ├── applyFilters()
            ├── filteredTests (computed)
            └── getDifficultyColor()


(main/instructor)
└── /tests/create/page.tsx
    └── SeriesTestForm.tsx
        ├── State:
        │   ├── isSeriesTest (boolean)
        │   ├── testSeries (TestSeries[])
        │   ├── showCreateSeries (boolean)
        │   └── newSeriesData (object)
        │
        ├── Sections:
        │   ├── Basic Information
        │   │   ├── Title
        │   │   ├── Description
        │   │   └── Type
        │   │
        │   ├── Series Information
        │   │   ├── Toggle [Part of Series]
        │   │   │   (when ON)
        │   │   │   ├── Select [Series]
        │   │   │   │   └── Button [Create New]
        │   │   │   ├── Input [Topic]
        │   │   │   ├── Select [Difficulty]
        │   │   │   ├── Toggle [Free Test]
        │   │   │   │   (when OFF)
        │   │   │   │   └── Input [Price]
        │   │   │
        │   └── Test Configuration
        │       ├── Input [Duration]
        │       ├── Toggle [Time Limited]
        │       ├── Input [Passing Score]
        │       ├── Input [Max Attempts]
        │       ├── Toggle [Show Results]
        │       └── Toggle [Allow Review]
        │
        └── Functions:
            ├── onSubmit()
            ├── loadTestSeries()
            └── handleCreateNewSeries()
```

---

## Action Flow

```
CLIENT                          SERVER ACTIONS                   DATABASE

MockTestPageClient
└─ searchMockTests()────────→ test-series-actions.ts
                            └─ Query tests with filters
                               ├─ .eq('topic', 'QA')
                               ├─ .eq('difficulty', 'Hard')
                               ├─ .gte('price', minPrice)
                               └─ .lte('price', maxPrice)
                                    │
                                    ▼
                            ┌───────────────────┐
                            │  Supabase Client  │
                            │  test_series      │
                            │  tests tables     │
                            └───────────────────┘

SeriesTestForm
└─ createTestSeries()──────→ test-series-actions.ts
                            └─ INSERT into test_series
                                 │
                                 ▼
                            ┌───────────────────┐
                            │  test_series      │
                            │  (new row)        │
                            └───────────────────┘

EnrollStudent
└─ enrollInTest()──────────→ test-enrollment-actions.ts
                            ├─ SELECT from tests
                            ├─ SELECT from enrollments (check existing)
                            └─ INSERT into enrollments
                                 │
                                 ▼
                            ┌───────────────────┐
                            │  enrollments      │
                            │  (new row)        │
                            │  is_test_purchase=true
                            └───────────────────┘

TakingTest
└─ createTestAttempt()─────→ test-enrollment-actions.ts
                            └─ INSERT into test_attempts
                                 │
                                 ▼
                            ┌───────────────────┐
                            │  test_attempts    │
                            │  (new row)        │
                            │  status='in-progress'
                            └───────────────────┘

SubmitTest
└─ completeTestAttempt()───→ test-enrollment-actions.ts
                            └─ UPDATE test_attempts
                                 │
                                 ▼
                            ┌───────────────────┐
                            │  test_attempts    │
                            │  status='completed'
                            │  score, answers
                            └───────────────────┘
```

---

This architecture supports:
✅ Unlimited test series
✅ Dynamic topic creation
✅ Individual pricing per test variant
✅ Per-test student enrollment
✅ Flexible filtering
✅ Detailed attempt tracking
✅ Secure access control via RLS

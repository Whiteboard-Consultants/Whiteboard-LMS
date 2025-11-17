# Test Section Sequential Locking - Visual Guide

## 🎯 Feature Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-SECTION TEST FLOW                      │
└─────────────────────────────────────────────────────────────────┘

START TEST
    │
    ▼
┌────────────────────────────────────────────┐
│  SECTION 1: Reading (Active)               │  ← Current Section
│  ┌──────────────────────────────────────┐  │
│  │ Time: 20:00 ⏱️                       │  │ ← Section Timer
│  │ Questions 1-10                       │  │
│  │ Answer Status: [1✓ 2✓ 3✓ ... 10]    │  │
│  │                                      │  │
│  │ [Submit Section] ▶                  │  │ ← Primary Action
│  └──────────────────────────────────────┘  │
│  Section Locked Until: [Not Applicable]    │
└────────────────────────────────────────────┘
    │
    │ User clicks "Submit Section"
    ▼
┌────────────────────────────────────────────┐
│  SECTION 1: Reading ✓ [LOCKED]            │  ← Completed (Faded)
│  Submitted at: 2025-11-17 10:45:30        │
└────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────┐
│  SECTION 2: Writing (Active) 🔓            │  ← New Current Section
│  ┌──────────────────────────────────────┐  │
│  │ Time: 15:00 ⏱️                       │  │ ← Fresh Timer
│  │ Questions 11-20                      │  │
│  │ Answer Status: [11 12 13 ... 20]    │  │
│  │                                      │  │
│  │ [Submit Section] ▶                  │  │
│  └──────────────────────────────────────┘  │
│  Section Locked Until: [All Questions]     │
└────────────────────────────────────────────┘
    │
    │ User answers questions, clicks submit
    ▼
┌────────────────────────────────────────────┐
│  SECTION 2: Writing ✓ [LOCKED]            │
│  Submitted at: 2025-11-17 11:00:15        │
└────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────┐
│  SECTION 3: Listening (Active) 🔓         │
│  ┌──────────────────────────────────────┐  │
│  │ Time: 25:00 ⏱️                       │  │
│  │ Questions 21-35                      │  │
│  │ Answer Status: [21 22 23 ... 35]    │  │
│  │                                      │  │
│  │ [Submit Section] ▶                  │  │
│  └──────────────────────────────────────┘  │
│  Section Locked Until: [All Questions]     │
└────────────────────────────────────────────┘
    │
    │ Final section submitted
    ▼
┌────────────────────────────────────────────┐
│         ✅ TEST COMPLETE                   │
│    All Sections Submitted Successfully      │
│                                            │
│ Redirecting to Results Page...            │
└────────────────────────────────────────────┘
```

---

## 🔒 Section State Indicators

### Section Tabs Display

```
┌─────────────────────────────────────────────────────────────┐
│  [Reading ✓]  [Writing ✓]  [Listening 🔒]  [Speaking 🔒]  │
│     100%        60%          Locked           Locked       │
│   (Disabled)   (Disabled)    (Can't click)    (Can't click)│
└─────────────────────────────────────────────────────────────┘

Legend:
  ✓    = Section completed and locked (opacity: 60%)
  🔒   = Section locked - future section (opacity: 40%)
  No icon = Current section - active (opacity: 100%)
  
Color:
  ✓    = Green highlight (completed)
  🔒   = Red (not yet accessible)
  Current = Blue highlight (active)
```

---

## 🚫 Blocked Actions & Error Messages

### Attempt 1: Try to Skip Sections

```
Student is in SECTION 1
Student clicks on SECTION 3 tab
    │
    ▼
┌─────────────────────────────────┐
│ ⚠️  Section Not Submitted       │
├─────────────────────────────────┤
│ You must submit the current     │
│ section before moving to the    │
│ next one.                       │
│                                 │
│ [Got it] ✓                      │
└─────────────────────────────────┘
    │
    ▼
SECTION 1 remains active
SECTION 3 remains locked (🔒)
```

### Attempt 2: Try to Go Back

```
Student submitted SECTION 1
Student is in SECTION 2
Student clicks on SECTION 1 tab
    │
    ▼
┌─────────────────────────────────┐
│ ⚠️  Cannot Go Back              │
├─────────────────────────────────┤
│ You cannot go back to a         │
│ previous section once           │
│ submitted.                      │
│                                 │
│ [Got it] ✓                      │
└─────────────────────────────────┘
    │
    ▼
SECTION 2 remains active
SECTION 1 remains disabled
```

### Attempt 3: Try to Answer Questions from Future Sections

```
Student is answering SECTION 1 questions
Question palette shows questions 1-10 (Section 1)
Question palette shows questions 11-20 (GRAYED OUT - Section 2)
    │
    ▼
Student tries to click on Question 15 (Section 2)
    │
    ▼
┌─────────────────────────────────┐
│ ⚠️  Cannot Access Question      │
├─────────────────────────────────┤
│ You can only access questions   │
│ from the current section.       │
│                                 │
│ [Got it] ✓                      │
└─────────────────────────────────┘
    │
    ▼
Question 15 remains unclickable
Question palette highlights only current section questions
```

---

## ⏱️ Timer Behavior Visualization

### Per-Section Timer with Auto-Submit

```
SECTION 1: Reading Comprehension
┌──────────────────────────────────┐
│                                  │
│  Section Time: 20:00 ⏱️          │  ← Starts at 20 minutes
│  Global Time: 59:45 ⏱️           │
│                                  │
│  Time is counting down...        │
│  20:00 → 19:59 → 19:58 ...      │
└──────────────────────────────────┘

After 5 minutes...
┌──────────────────────────────────┐
│                                  │
│  Section Time: 15:00 ⏱️          │
│  Global Time: 54:45 ⏱️           │
│                                  │
│  Continue answering...           │
└──────────────────────────────────┘

When Section Timer Reaches 0:00...
┌──────────────────────────────────┐
│                                  │
│  Section Time: 00:00 ⏱️ ⚠️        │
│  Global Time: 39:45 ⏱️           │
│                                  │
│  🔔 Auto-submitting section...  │
│                                  │
└──────────────────────────────────┘
    │
    ▼
SECTION 1 automatically submitted
SECTION 2 loads with fresh timer: 15:00
Global timer continues: 39:45
```

---

## 📊 Question Palette Restrictions

### Section 1 - All Questions Accessible

```
┌──────────────────────────────────────┐
│        Question Palette               │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ 1  2  3  4  5                 │  │
│  │ 6  7  8  9  10                │  │ ← All clickable
│  │                               │  │
│  │ 11 12 13 14 15  (GRAYED OUT) │  │ ← Not accessible yet
│  │ 16 17 18 19 20  (GRAYED OUT) │  │
│  └────────────────────────────────┘  │
│                                      │
│  Current: Question 5                │
│  Color Legend:                      │
│  🟢 Answered                        │
│  🔴 Not Answered                    │
│  🟣 Marked for Review               │
│  ⬜ Not Visited                     │
└──────────────────────────────────────┘
```

### After Section 1 Submitted - Section 2 Questions Accessible

```
┌──────────────────────────────────────┐
│        Question Palette               │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ 1  2  3  4  5  (GRAYED OUT)   │  │
│  │ 6  7  8  9  10 (GRAYED OUT)   │  │ ← Previous section disabled
│  │                               │  │
│  │ 11 12 13 14 15                │  │
│  │ 16 17 18 19 20                │  │ ← Current section active
│  │                               │  │
│  │ 21 22 23 24 25  (GRAYED OUT) │  │
│  │ 26 27 28 29 30  (GRAYED OUT) │  │ ← Future section disabled
│  └────────────────────────────────┘  │
│                                      │
│  Current: Question 13               │
└──────────────────────────────────────┘
```

---

## 📱 Progress Indicator Card

```
┌─────────────────────────────────────────┐
│ 📊 Section Progress Card                │
├─────────────────────────────────────────┤
│                                         │
│ Section Progress: 2 of 5                │
│ Current: Writing Section                │
│                                         │
│ ⚠️  You must submit this section       │
│    before accessing the next one.      │
│                                         │
│ Sections:                              │
│  1. Reading ✓           (Submitted)    │
│  2. Writing             (Current)      │
│  3. Listening 🔒        (Locked)       │
│  4. Speaking 🔒         (Locked)       │
│  5. Grammar 🔒          (Locked)       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 State Transitions

### Valid Transitions

```
SECTION 1           SECTION 2           SECTION 3           SECTION 4
(Active) ─────▶ (Active) ─────▶ (Active) ─────▶ (Active)
  │                │                │                │
  │                │                │                │
  └──Submit────────┘                │                │
                   └──Submit────────┘                │
                                    └──Submit────────┘
                                                     └──Complete Test
```

### Invalid Transitions

```
SKIP SECTIONS (NOT ALLOWED)
SECTION 1 ─X─▶ SECTION 3  ✗

GO BACK (NOT ALLOWED)
SECTION 2 ◀─X─ SECTION 1  ✗

REVISIT (NOT ALLOWED)
(After submit) SECTION 1 ◀─X─ SECTION 1  ✗
```

---

## 💾 Data Flow

### Frontend State Management

```
Component: TestTaker

State Variables:
  ├─ currentSectionId: "abc-123"
  ├─ submittedSections: Set {"abc-123", "def-456"}
  ├─ sectionTimeLeft: 900 (seconds)
  ├─ sections: [...] (all test sections)
  ├─ currentQuestionIndex: 5
  ├─ questions: [...] (all questions with sectionId)
  └─ answers: [...] (all answers with status)

Event Handlers:
  ├─ handleSectionChange(sectionId)
  │   └─ Validates permissions before changing
  ├─ handleSubmitSection()
  │   └─ Adds to submittedSections
  │   └─ Moves to next section
  │   └─ Resets section timer
  └─ handleQuestionChange(index)
      └─ Checks question.sectionId == currentSectionId
```

---

## ✅ Compliance Checklist

For instructors setting up multi-section tests:

- [ ] Test has multiple sections defined
- [ ] Each section has allocated time
- [ ] Questions are assigned to sections
- [ ] Questions maintain proper order within sections
- [ ] Section durations make sense for content
- [ ] Total test time = sum of section times
- [ ] Test instructions mention section progression rules

---

*Visual Guide for Test Section Sequential Locking Feature*  
*Created: November 17, 2025*

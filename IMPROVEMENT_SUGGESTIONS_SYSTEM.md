# Improvement Suggestions System Documentation

## Overview

The Improvement Suggestions System automatically analyzes student test performance and generates personalized recommendations for areas that need focus. It works in conjunction with the Certificate system to help students improve their scores.

## Architecture

### Components

#### 1. **Database Layer** (`migrations/add_improvement_tracking_to_attempts.sql`)
- `section_scores` (JSONB): Performance breakdown by section/topic
- `weak_areas` (JSONB): Identified areas scoring below 70%
- `improvement_suggestions` (JSONB): Personalized suggestions
- `suggested_review_resources` (JSONB): Links to learning materials

#### 2. **Business Logic** (`src/app/student/improvement-suggestions-actions.ts`)
- `calculateSectionPerformance()`: Analyze performance by section
- `generateImprovementSuggestions()`: Create personalized suggestions
- `saveImprovementSuggestions()`: Persist to database
- `getImprovementSuggestions()`: Retrieve for display
- `getUserWeakAreas()`: Aggregate weak areas across attempts

#### 3. **UI Components** (`src/components/improvement-suggestions.tsx`)
- `ImprovementSuggestions`: Full-featured display component
- `CompactImprovementSuggestions`: Dashboard widget

### Data Flow

```
Student Submits Test
    ↓
Calculate Section Performance
    ├─ Group questions by section/topic
    ├─ Count correct answers per section
    ├─ Calculate percentage scores
    ↓
Generate Improvement Suggestions
    ├─ Identify weak areas (< 70%)
    ├─ Determine severity (high/medium/low)
    ├─ Generate actionable suggestions
    ├─ Recommend resources
    ↓
Save to Database
    ├─ section_scores: Performance breakdown
    ├─ weak_areas: Summary of problem areas
    ├─ improvement_suggestions: Full suggestions
    ↓
Display on Student Dashboard
    ├─ Show certificate eligibility status
    ├─ Highlight critical focus areas
    ├─ Provide actionable next steps
```

## Key Features

### 1. **Severity Classification**

Suggestions are categorized by performance level:

- **HIGH** (Score < 50%): Critical areas needing immediate attention
  - Most aggressive recommendations
  - Suggests foundational learning
  - Recommends instructor consultation

- **MEDIUM** (Score 50-70%): Areas for improvement
  - Balanced approach to content review
  - Targeted practice recommendations
  - Interactive learning suggestions

- **LOW** (Score 70-85%): Maintenance areas
  - Only shown in detailed view
  - Light practice recommendations

### 2. **Actionable Recommendations**

Each suggestion includes:
- Clear description of the weak area
- Performance score and question breakdown
- Severity level with visual indicator
- 4-5 specific, actionable next steps
- Resource recommendations (when applicable)

### 3. **Multi-Level Aggregation**

System tracks weak areas across multiple attempts:
- Individual attempt analysis
- Persistent weak areas identification
- Trending analysis (which areas keep appearing)
- User-level dashboard showing cumulative weak areas

## Implementation Guide

### Step 1: Apply Database Migration

```bash
# Run the migration to add tracking columns
psql -d whitedge_lms < migrations/add_improvement_tracking_to_attempts.sql

# Or via Supabase:
# Navigate to SQL Editor → Run the migration script
```

### Step 2: Integrate with Test Submission

Update your test submission handler to calculate and save suggestions:

```typescript
// In your test submission action (e.g., src/app/student/tests/actions.ts)

import {
  calculateSectionPerformance,
  generateImprovementSuggestions,
  saveImprovementSuggestions
} from '@/app/student/improvement-suggestions-actions';

export async function submitTest(testAttemptId: string, answers: any[]) {
  // ... existing validation code ...
  
  // Calculate performance
  const sectionPerformance = calculateSectionPerformance(
    test.questions,
    answers,
    test.sections // or extract from questions if not available
  );
  
  // Generate suggestions
  const suggestions = generateImprovementSuggestions(
    sectionPerformance,
    score, // overall percentage
    test.certificate_minimum_score ?? 70
  );
  
  // Save to database
  await saveImprovementSuggestions(testAttemptId, sectionPerformance, suggestions);
  
  // ... rest of submission logic ...
}
```

### Step 3: Display on Test Results Page

```typescript
// In your test results component

import { ImprovementSuggestions } from '@/components/improvement-suggestions';

export function TestResultsPage({ testAttempt }) {
  return (
    <div>
      {/* Existing result display */}
      <div>Score: {testAttempt.score}%</div>
      
      {/* New: Improvement suggestions */}
      <ImprovementSuggestions
        suggestions={testAttempt.improvement_suggestions}
        certificateEligible={testAttempt.score >= testAttempt.certificate_minimum_score}
      />
    </div>
  );
}
```

### Step 4: Add to Student Dashboard

```typescript
// In student dashboard

import { CompactImprovementSuggestions } from '@/components/improvement-suggestions';

export function StudentDashboard({ userId }) {
  const { data: latestAttempt } = await getLatestTestAttempt(userId);
  
  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Recent weak areas widget */}
      {latestAttempt?.improvement_suggestions && (
        <CompactImprovementSuggestions 
          suggestions={latestAttempt.improvement_suggestions}
        />
      )}
    </div>
  );
}
```

## Data Structure Examples

### Section Performance

```json
[
  {
    "sectionId": "section-1",
    "sectionName": "English Grammar",
    "score": 65,
    "correct": 13,
    "total": 20,
    "questions": [
      { "id": "q-1", "correct": true, "userAnswer": 2 },
      { "id": "q-2", "correct": false, "userAnswer": 1 }
    ]
  },
  {
    "sectionId": "section-2",
    "sectionName": "Reading Comprehension",
    "score": 45,
    "correct": 9,
    "total": 20,
    "questions": [...]
  }
]
```

### Improvement Suggestions

```json
[
  {
    "area": "Reading Comprehension",
    "performanceScore": 45,
    "severity": "high",
    "reason": "Score: 45% (9/20 correct)",
    "suggestion": "Critical: You scored 45% in Reading Comprehension. This area needs significant focus.",
    "suggestedActions": [
      "Take our foundational course on Reading Comprehension",
      "Practice 5-10 sample questions daily on this topic",
      "Review the basics and common mistakes",
      "Schedule a doubt-clearing session with an instructor"
    ]
  }
]
```

### Weak Areas Summary

```json
[
  {
    "area": "Reading Comprehension",
    "score": 45,
    "timesIdentified": 2,
    "avgScore": 52,
    "severity": "high"
  }
]
```

## UI Components

### ImprovementSuggestions (Full Display)

**Props:**
- `suggestions: ImprovementSuggestion[]` - Array of suggestions to display
- `certificateEligible: boolean` - Whether student achieved certificate score

**Features:**
- Certificate eligibility banner
- Grouped by severity (Critical, Areas for Improvement)
- Color-coded sections (red for high, amber for medium)
- Detailed actionable items
- Responsive design with dark mode support

**Usage:**
```typescript
<ImprovementSuggestions
  suggestions={testAttempt.improvement_suggestions}
  certificateEligible={score >= minimumScore}
/>
```

### CompactImprovementSuggestions (Dashboard Widget)

**Props:**
- `suggestions: ImprovementSuggestion[]` - Array of suggestions

**Features:**
- Shows only high-priority areas
- Compact display (max 3 items)
- "+N more" indicator when space runs out
- Designed for dashboard sidebar/widget

**Usage:**
```typescript
<CompactImprovementSuggestions suggestions={suggestions} />
```

## Severity Thresholds

| Severity | Score Range | Color  | Icon       | Actions    |
|----------|-------------|--------|------------|------------|
| HIGH     | < 50%       | Red    | AlertIcon  | 4-5 urgent |
| MEDIUM   | 50-70%      | Amber  | TrendIcon  | 3-4 focused|
| LOW      | 70-85%      | Green  | CheckIcon  | Optional   |

## Database Queries

### Get Student's Weak Areas

```sql
SELECT 
  section_scores,
  weak_areas,
  improvement_suggestions,
  created_at
FROM test_attempts
WHERE user_id = $1
ORDER BY created_at DESC;
```

### Get Persistent Weak Areas (High Priority)

```sql
SELECT 
  ta.id,
  ta.weak_areas,
  COUNT(*) as frequency
FROM test_attempts ta
WHERE ta.user_id = $1
  AND ta.weak_areas IS NOT NULL
GROUP BY ta.id, ta.weak_areas
HAVING COUNT(*) > 1
ORDER BY frequency DESC;
```

## Future Enhancements

### 1. **Resource Linking**
- Connect suggestions to specific lessons
- Auto-recommend courses based on weak areas
- Track resource completion

### 2. **AI-Powered Explanations**
- Generate detailed explanations for wrong answers
- Provide conceptual breakdowns
- Suggest alternative approaches

### 3. **Progress Tracking**
- Compare performance across attempts
- Show improvement trends
- Celebrate milestones

### 4. **Instructor Dashboard**
- View class-wide weak areas
- Identify common problem areas
- Tailor lessons accordingly

### 5. **Personalized Study Plans**
- Auto-generate study schedules
- Adjust based on student progress
- Recommend optimal retry timing

### 6. **Social Learning**
- Peer study groups for weak areas
- Collaborative learning sessions
- Discussion forums by topic

## Testing Checklist

- [ ] Migration successfully adds columns to `test_attempts`
- [ ] `calculateSectionPerformance()` correctly groups questions by section
- [ ] `generateImprovementSuggestions()` identifies areas with score < 70%
- [ ] Severity classification works correctly (high/medium/low)
- [ ] `saveImprovementSuggestions()` persists data to database
- [ ] `ImprovementSuggestions` component renders correctly
- [ ] Color coding matches severity levels
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode styling displays correctly
- [ ] Certificate eligibility message shows when score < minimum
- [ ] Compact widget shows only high-priority items
- [ ] "+N more" indicator appears when needed

## Troubleshooting

### Suggestions Not Showing

1. Verify migration was applied: `SELECT column_name FROM information_schema.columns WHERE table_name = 'test_attempts'`
2. Check that test has sections/topics defined
3. Verify answers were recorded correctly
4. Check database for saved suggestions: `SELECT improvement_suggestions FROM test_attempts WHERE id = $1`

### Incorrect Performance Calculation

1. Verify questions have correct `sectionId` values
2. Ensure `correctOption` index matches answer options
3. Check that answers array aligns with questions array order
4. Review console logs in `calculateSectionPerformance()`

### Styling Issues

1. Ensure TailwindCSS is configured correctly
2. Check dark mode class on root element (`dark` class)
3. Verify Lucide icons are installed: `npm install lucide-react`
4. Check component imports and class names

## Performance Considerations

- **Calculation**: Typically < 100ms for 50-100 questions
- **Database Write**: Usually < 500ms (async, non-blocking)
- **Component Render**: Fast (< 50ms for typical suggestion count)
- **Memory**: ~50KB per test attempt's suggestions (varies with content)

## API Reference

### calculateSectionPerformance()

```typescript
function calculateSectionPerformance(
  questions: any[],
  answers: any[],
  sections: any[]
): SectionPerformance[]
```

**Input:**
- `questions`: Array of question objects with `sectionId` and `correctOption`
- `answers`: Array of answer objects with `optionIndex`
- `sections`: Array of section objects with `id` and `name`

**Output:** Array of `SectionPerformance` with scores per section

### generateImprovementSuggestions()

```typescript
function generateImprovementSuggestions(
  sectionPerformance: SectionPerformance[],
  overallScore: number,
  certificateMinimumScore: number
): ImprovementSuggestion[]
```

**Input:**
- `sectionPerformance`: From `calculateSectionPerformance()`
- `overallScore`: Overall test percentage (0-100)
- `certificateMinimumScore`: Minimum score for certificate (e.g., 70)

**Output:** Array of `ImprovementSuggestion` objects

### saveImprovementSuggestions()

```typescript
async function saveImprovementSuggestions(
  testAttemptId: string,
  sectionPerformance: SectionPerformance[],
  suggestions: ImprovementSuggestion[]
): Promise<{ success: boolean; error?: any }>
```

## License

This feature is part of the Whitedge LMS system.

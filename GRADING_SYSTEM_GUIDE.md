# Instructor Grading System Documentation

## Overview

The instructor grading system enables instructors to review and provide feedback on descriptive (non-MCQ) assessment responses from students. This system separates auto-graded multiple-choice questions from instructor-reviewed descriptive answers.

## Architecture

### Question Types
- **MCQ (Multiple Choice)**: Auto-graded, counted toward percentage score
- **Descriptive**: Manually graded by instructors, shown separately on results page

### Grading Status
Each quiz attempt has a `grading_status` that tracks the grading workflow:
- `pending` - Awaiting instructor review
- `reviewed` - Instructor has provided feedback
- `graded` - Complete (feedback + optional score provided)

## Database Schema

### New Columns Added to `quiz_attempts` Table

```sql
grading_status: TEXT CHECK ('pending', 'reviewed', 'graded') DEFAULT 'pending'
instructor_feedback: TEXT -- Instructor's feedback on the attempt
instructor_score: INTEGER -- Optional score (0-100) for descriptive questions
graded_by: UUID REFERENCES auth.users(id) -- Instructor who graded
graded_at: TIMESTAMP WITH TIME ZONE -- When grading was completed
```

### Indexes Created
- `idx_quiz_attempts_grading_status` - For fetching pending/reviewed attempts
- `idx_quiz_attempts_graded_by` - For instructor's grading history
- `idx_quiz_attempts_user_id_status` - For student's review status

## Setup Instructions

### 1. Apply the Database Migration

**Option A: Using Supabase SQL Editor** (Recommended)
1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Click "New Query"
4. Copy and paste the contents of `migrations/add_grading_columns.sql`
5. Click "Run"
6. Verify success (no errors)

**Option B: Using Migration Runner** (if you have one configured)
```bash
npm run migrate:apply
```

### 2. Verify Installation

Run this query in Supabase SQL Editor to verify the columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
  AND column_name IN ('grading_status', 'instructor_feedback', 'instructor_score', 'graded_by', 'graded_at');
```

Expected output: 5 rows with the new columns

## User Flows

### For Instructors

#### 1. Access Grading Dashboard
- Navigate to `/instructor/grading`
- See statistics:
  - Pending Review: Count of assessments awaiting grading
  - Already Reviewed: Count of completed grading
  - Total Attempts: All assessment attempts for instructor's courses
  
#### 2. Grade an Assessment
1. Click "Grade Now" on a pending assessment
2. Navigate to `/instructor/grading/[attemptId]`
3. View student responses to all descriptive questions
4. Compare against suggested model answers (if provided)
5. Type comprehensive feedback in the feedback textarea
6. Optionally provide a score (0-100) for descriptive questions
7. Click "Submit Feedback"

#### 3. View Previously Graded Work
- Graded assessments appear in "Already Reviewed" section
- Click "View Feedback" to see what you previously submitted
- Can update feedback if needed (re-submission creates new feedback record)

### For Students

#### 1. Submit Descriptive Answers
- Descriptive questions show "Submitted for Review" status on results page
- See message: "Your assessment containing X questions has been successfully submitted for review"
- Wait for instructor feedback (typically 3-5 business days)

#### 2. View Feedback After Grading
Once instructor grades their attempt:
- Feedback section appears on results page with blue background
- Shows date when feedback was provided
- If score was provided, shows the descriptive question score (0-100)
- Can compare their answer to model answer

#### 3. Use Feedback for Improvement
- Review detailed feedback from instructor
- Identify specific areas for improvement
- Use suggestions to retake assessment if available

## File Structure

```
src/app/instructor/grading/
├── page.tsx              # Dashboard listing pending/reviewed attempts
├── [attemptId]/
│   └── page.tsx          # Grading interface for single attempt
└── actions.ts            # Server actions for grading operations

src/app/(main)/student/quiz-results/[attemptId]/page.tsx
└── Updated to display instructor feedback section
```

## Server Actions

All grading operations are handled through secure server actions in `src/app/instructor/grading/actions.ts`:

### `getPendingGradingTasks(instructorId, courseId?)`
**Purpose**: Fetch pending assessments for an instructor
**Returns**: Array of quiz attempts with status='pending'
**Filters**: Only returns attempts from instructor's courses

### `getQuizAttemptForGrading(attemptId, instructorId)`
**Purpose**: Get full details of a single attempt for grading
**Returns**: Quiz attempt with questions and student answers
**Security**: Verifies instructor teaches the course

### `submitGradingFeedback(attemptId, instructorId, feedback, score?)`
**Purpose**: Save instructor feedback and optional score
**Parameters**:
- `attemptId`: UUID of the quiz attempt
- `instructorId`: UUID of the instructor
- `feedback`: Text feedback (required)
- `score`: Optional numeric score 0-100
**Updates**:
- Sets grading_status to 'reviewed'
- Saves instructor_feedback text
- Sets instructor_score if provided
- Records graded_by and graded_at timestamps

### `getGradingStats(instructorId)`
**Purpose**: Get summary statistics for instructor's grading workload
**Returns**: Object with pending, reviewed, and total attempt counts

## Features

### Descriptive Question Display
- Shows student's submitted answer
- Displays suggested model answer (if available)
- Clear visual separation (blue boxes)
- Shows "Submitted for Review" status

### Grading Interface
- Clean form with two fields:
  1. **Feedback** (required): Textarea for instructor comments
  2. **Score** (optional): 0-100 points
- Back button to return to dashboard
- Displays student name, course, and submission date
- Shows all descriptive questions for that attempt
- One feedback form covers all descriptive responses

### Feedback Display (Student Results Page)
- Dedicated "Instructor Feedback" section
- Shows feedback text with proper formatting
- Displays score if provided
- Shows date feedback was provided
- Blue theme distinguishes from MCQ results (green/red)

### Statistics
- Automatic count of pending vs reviewed
- Tracks total attempts per instructor
- Updates in real-time as grading is completed

## Security & Permissions

### Instructor Access Control
- Instructors can only grade assessments from their own courses
- Verification via enrollments table: `enrollment.instructor_id == current_user.id`
- Server actions verify permissions before returning data or updating

### Data Access
- Students can only see feedback for their own attempts
- Feedback only displays after instructor grades
- Grading_status prevents accidental visibility of ungraded work

## Best Practices

### For Instructors
1. **Provide Constructive Feedback**: Include specific examples and suggestions
2. **Be Timely**: Grade within 3-5 business days of submission
3. **Optional Scoring**: Use numerical scores only when needed
4. **Balance Feedback**: Acknowledge strengths before areas for improvement
5. **Check Model Answers**: Review provided model answers before grading

### For Students
1. **Wait for Feedback**: Don't expect immediate scoring on descriptive questions
2. **Read Feedback Carefully**: Use instructor insights for improvement
3. **Follow Model Answers**: Study suggested answers to learn better approaches
4. **Ask for Clarification**: Contact instructor if feedback is unclear

## Troubleshooting

### Migration Not Applied
**Symptom**: "column grading_status does not exist" error
**Solution**:
1. Run the migration in Supabase SQL Editor
2. Verify with verification query above
3. Restart development server

### Permissions Denied
**Symptom**: "Permission denied" when trying to grade
**Solution**:
1. Verify instructor_id in enrollments table matches user
2. Verify course_id on quiz_attempts table
3. Check auth token has user ID

### Feedback Not Saving
**Symptom**: "Failed to save feedback" error
**Solution**:
1. Verify database migration applied
2. Check feedback text is not empty
3. Check network connection
4. Check browser console for detailed error

### Feedback Not Visible to Student
**Symptom**: Student can't see feedback on results page
**Solution**:
1. Verify `grading_status = 'reviewed'` in database
2. Verify student is viewing their own attempt
3. Check if feedback text was saved (not empty)
4. Hard refresh browser to clear cache

## Future Enhancements

Potential features for future versions:
- Rubric-based grading with categories
- Grade templates/quick replies
- Batch grading with sorting filters
- Student resubmission workflow
- Peer review assignments
- Grade appeals/revision process
- Analytics on descriptive answer quality
- Export grades to CSV

## Support & Debugging

### Enable Debug Logging
Add to your environment:
```
NEXT_PUBLIC_DEBUG_GRADING=true
```

### Check Server Logs
Look for grading action logs:
```
✅ Grading feedback submitted
❌ Error updating grading
❌ Exception in submitGradingFeedback
```

### Database Query
Verify data in database directly:
```sql
SELECT id, user_id, grading_status, instructor_feedback, graded_at
FROM quiz_attempts
WHERE grading_status = 'pending'
ORDER BY submitted_at DESC
LIMIT 10;
```

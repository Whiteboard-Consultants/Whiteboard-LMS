# Test Sections & Question Types Implementation Guide

## Overview

The test system now supports organizing test questions into **sections** (like Verbal Ability, Quantitative Ability, Logical Reasoning & Data Interpretation) with support for **two question types**: MCQ and Descriptive answers.

## Features Implemented

### 1. **Test Sections**
- Create multiple sections for a test (e.g., Verbal Ability, Quantitative Ability, etc.)
- Each section can have:
  - **Name** (required): Section title
  - **Description** (optional): Brief explanation of the section
  - **Duration** (optional): Time allocated for the section in minutes
- **Drag-and-drop reordering** of sections
- Sections display question count
- Delete sections (questions remain but become unassigned)

### 2. **Question Types**

#### MCQ (Multiple Choice)
- Predefined options to choose from
- Must have at least 2 options
- Select correct answer
- Negative marks support
- Solution/Explanation after submission

#### Descriptive
- Students provide their own written answer
- No predefined options
- Instructor provides model answer
- For manual evaluation

### 3. **Question Assignment**
- Assign each question to a section (optional)
- Questions can remain unassigned
- View questions grouped by section in the edit page
- Reassign questions to different sections

## How to Use

### Step 1: Create Test Sections

1. Go to `/instructor/tests/edit/[testId]`
2. Scroll to **"Test Sections"** card
3. Click **"Add Section"** button
4. Fill in:
   - **Section Name**: e.g., "Verbal Ability", "Quantitative Ability"
   - **Description**: (Optional) e.g., "Reading comprehension and grammar"
   - **Duration**: (Optional) e.g., "40" minutes

5. Click **"Create Section"**
6. Repeat for each section

### Step 2: Organize Sections (Optional)

- Drag sections by the handle icon to reorder
- Edit section details by clicking the edit icon
- Delete sections by clicking the trash icon
- Questions in deleted sections become unassigned

### Step 3: Add Questions to Sections

1. Scroll to **"Test Questions"** section
2. Click **"Add Question"** button
3. Choose **Question Type**:
   - **Multiple Choice (MCQ)**: For options-based questions
   - **Descriptive Answer**: For short/long answer questions

4. **For MCQ Questions**:
   - Enter question text
   - Add at least 2 options
   - Select the correct answer
   - Add solution/explanation
   - Set marks and negative marks

5. **For Descriptive Questions**:
   - Enter question text
   - Provide model answer (appears to instructors during evaluation)
   - Set marks (no negative marks)

6. **Assign to Section**:
   - Select a section from the dropdown
   - Questions can be assigned to any section
   - Optional: Leave unassigned

7. Click **"Add Question"**

### Step 4: View Questions by Section

The **Test Questions** section displays:
- Each section as a collapsible card showing:
  - Section name
  - Question count
  - Duration (if set)
  - All questions in that section
- **Unassigned Questions** card for questions not in any section
- Drag questions to reorder within sections
- Each question shows:
  - Question type badge (MCQ/Descriptive)
  - Marks and negative marks
  - Preview of question text

## Database Structure

### test_sections Table
```sql
- id: UUID (Primary Key)
- test_id: UUID (Foreign Key -> tests)
- name: TEXT (Section name)
- description: TEXT (Optional)
- duration: INTEGER (Minutes, optional)
- order_number: INTEGER (For ordering)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### test_questions Table (Updated)
```sql
- id: UUID (Primary Key)
- test_id: UUID (Foreign Key)
- section_id: UUID (Foreign Key -> test_sections, optional)
- question_type: VARCHAR (mcq | descriptive)
- question_text: TEXT
- options: JSON (empty array for descriptive)
- correct_answer: INTEGER (null for descriptive)
- explanation: TEXT
- points: INTEGER
- order_number: INTEGER
```

## API Actions

All actions are server-side and automatically handle revalidation.

### Section Management

```typescript
// Create a new section
createTestSection(testId: string, {
  name: string,
  description?: string,
  duration?: number
})

// Update section details
updateTestSection(sectionId: string, {
  name: string,
  description?: string,
  duration?: number
})

// Delete a section
deleteTestSection(sectionId: string)

// Get all sections for a test
getTestSections(testId: string)

// Reorder sections
reorderTestSections(testId: string, sections: { id, order_number }[])
```

### Question Management

Questions automatically include `sectionId` and `questionType` in their data.

```typescript
// Add question with section assignment
addTestQuestion(testId: string, {
  type: 'mcq' | 'descriptive',
  text: string,
  options: string[],      // empty for descriptive
  correctOption: number,  // null for descriptive
  marks: number,
  sectionId?: string,     // optional section assignment
  ...
})

// Update question including section
updateTestQuestion(questionId: string, questionData)

// Get questions (returns with section info)
getTestQuestions(testId: string)
```

## Testing Checklist

- [ ] Create a test
- [ ] Add 3+ sections (Verbal, Quantitative, Logical Reasoning)
- [ ] Add MCQ questions to Verbal section
- [ ] Add Descriptive questions to Quantitative section
- [ ] Add mixed question types to Logical Reasoning
- [ ] Verify questions display grouped by section
- [ ] Reorder sections by dragging
- [ ] Edit section details
- [ ] Delete a section and verify questions become unassigned
- [ ] Reassign question to different section
- [ ] View test structure before publishing

## Student Experience

Students taking the test will see:
1. Section-by-section navigation
2. Question counter per section
3. Time tracker (if duration set)
4. MCQ options to select from
5. Descriptive text area for answers
6. Ability to mark questions for review per section

## Instructor Evaluation

For descriptive questions:
1. View student's answer
2. See model answer (guidance)
3. Award marks based on rubric
4. Leave feedback/comments

## Future Enhancements

- [ ] Section-wise time limits
- [ ] Section shuffling for different students
- [ ] Reading passages per section
- [ ] Auto-grading for MCQs
- [ ] Section-wise difficulty levels
- [ ] Analytics by section performance


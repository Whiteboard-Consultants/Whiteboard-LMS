# Instructor Grading System - Complete User Guide

## Overview

The Instructor Grading System is a comprehensive assessment management platform that allows instructors to:
- View pending assessments for grading
- Provide detailed feedback on student responses
- Compare student answers with model answers
- Track grading progress and completion status
- Automatically notify students when feedback is posted

This guide walks you through all features step-by-step.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Accessing the Grading Dashboard](#accessing-the-grading-dashboard)
3. [Dashboard Overview](#dashboard-overview)
4. [Grading an Assessment](#grading-an-assessment)
5. [Answer Comparison Feature](#answer-comparison-feature)
6. [Notifications System](#notifications-system)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- You must be logged in as an instructor
- Your account must be associated with at least one course
- Students must have submitted descriptive assessments in your course

### How to Access

1. **Log in** to WhitedgeLMS with your instructor credentials
2. **Click "Grading"** in the left sidebar navigation menu
3. You will be taken to the **Grading Dashboard**

---

## Accessing the Grading Dashboard

### URL
```
http://localhost:3000/instructor/grading
```

### What You'll See
The Grading Dashboard displays:
- **Total pending assessments** (blue card)
- **Assessments you've reviewed** (green card)
- **Total assessments** (gray card)
- **List of pending assessments** with student names and submission times

---

## Dashboard Overview

### Statistics Cards

#### Pending Review
- Shows assessments **awaiting your feedback**
- Click this card to focus on pending items
- Example: "6" pending means 6 assessments need grading

#### Reviewed
- Shows assessments **you've already graded**
- Tracks your productivity
- Example: "1" reviewed means you've completed 1 assessment

#### Total
- Complete count of all assessments in your courses
- Includes pending, reviewed, and draft submissions

### Pending Assessments List

**Columns:**
- **Student Name**: Name of the student who submitted
- **Assessment**: Name/title of the assessment
- **Submitted**: Date and time of submission
- **Status**: Current grading status
  - 🟡 "Pending Review" - Needs your feedback
  - ✅ "Reviewed" - You've completed grading

**Action:** Click on any assessment to open the grading detail page

---

## Grading an Assessment

### Step 1: Select an Assessment
From the Grading Dashboard, click on any assessment with "Pending Review" status.

**Example:** Click "Question 1 - LinkedIn Profile" under student "Navnit Daniel Alley"

### Step 2: View the Assessment Details

You'll see:

#### Header Section
- **Question Title**: The assessment prompt
- **Question Type Badge**: Shows "Descriptive" (manual grading required)
- **Status Badge**: Shows "Submitted for Review" (blue badge)

#### Student's Answer Section
A card displaying:
- **"Your Answer"** label with checkmark icon
- The complete text of the student's response
- The exact wording they submitted

#### Model Answer Section
A card displaying:
- **"Suggested Model Answer"** label with bookmark icon
- Reference answers for each level (Student, Early Professional, Mid-Career Professional)
- These are guidelines for evaluation, not strict requirements

#### Pending Review Notice
- Yellow banner stating: "Pending Instructor Review: This answer will be reviewed by an instructor who will provide personalized feedback."

### Step 3: Provide Feedback

#### Feedback Form

**Feedback Text Area:**
- Click in the text box that says "Enter your feedback here..."
- Type detailed, constructive feedback for the student
- You can include:
  - Strengths of their answer
  - Areas for improvement
  - Specific examples
  - Suggestions for development
  - Resources or next steps

**Example Feedback:**
```
Great response! Your answer demonstrates a clear understanding of how to 
position yourself differently for various career stages. I especially liked 
how you emphasized hands-on experience and strategic thinking.

For improvement, consider being more specific about the "social media strategies" 
you mentioned. What specific platforms or content types would you prioritize?

Overall, this shows strong career planning awareness. Keep developing these 
narrative skills - they're valuable for interviews and networking.
```

#### Score Field (Optional)
- Enter a numerical score (0-100) if desired
- This is optional - feedback alone is sufficient
- Useful for tracking student performance

#### Submit Button
- Click **"Submit Feedback"** to save and send

---

## Answer Comparison Feature

### What is Answer Comparison?

The Answer Comparison feature allows you to see how the student's response compares to the model answer, helping ensure consistent and fair grading.

### How to Use

#### Step 1: Click "Compare" Button
- Located next to the Model Answer section
- A modal dialog will open showing side-by-side comparison

#### Step 2: Review the Comparison
The dialog shows:
- **Student Answer** (left side): Their actual response
- **Model Answer** (right side): Expected/reference answer
- **Similarity Metrics** (if similar answers are found)

#### Step 3: Use Insights for Grading
- Identify key differences
- Note what the student captured well
- Highlight gaps or misunderstandings
- Use this information to write targeted feedback

#### Step 4: Close the Dialog
- Click the X button or click outside the modal to close
- Return to the feedback form to write your assessment

---

## Notifications System

### How Student Notifications Work

When you submit feedback on an assessment:

1. **Notification is Created**: System automatically creates a notification for the student
2. **Student is Notified**: A notification appears in their **Notifications** page
3. **Student Can Review**: They click "View" to see your feedback and their quiz results

### What Students See

#### Notification Card
```
📌 Feedback Posted
Your instructor has posted feedback on your Assessment/Quiz: "LinkedIn Profile Optimization"
Status: New (blue badge)
Posted: Jan 10, 03:52 PM
[View Button] →
```

#### When They Click "View"
- Taken directly to their quiz results page
- Your feedback is displayed in a blue card
- They can see their score and detailed analysis
- Notification is automatically marked as read

### Notification Frequency
- One notification per assessment
- Sent immediately when you submit feedback
- Only for assessments with instructor-provided feedback

---

## Best Practices

### 1. Be Specific and Constructive
✅ **Good:** "Your explanation of the LinkedIn algorithm was thorough, but you could strengthen it by mentioning specific engagement metrics that LinkedIn prioritizes."

❌ **Avoid:** "Not detailed enough."

### 2. Balance Positive and Developmental Feedback
- Start with what they did well
- Then address areas for improvement
- End with encouragement or next steps

### 3. Reference the Model Answer
- Use the suggestion feature to point students to model answers
- Explain why certain approaches are better
- Help them understand the reasoning, not just the answer

### 4. Keep Track of Progress
- Check your statistics regularly
- Aim to review assessments promptly (within 3-5 business days)
- Track your reviewed count to measure productivity

### 5. Provide Actionable Feedback
- Give specific suggestions for improvement
- Link to resources when helpful
- Explain how to apply feedback to future assessments

### 6. Use Consistent Scoring
- Establish a mental rubric or guideline
- Grade similar answers similarly
- Document your criteria if using numerical scores

---

## Step-by-Step Walkthrough Example

### Scenario
You're grading an assessment about "LinkedIn Profile Optimization" submitted by student "Navnit Daniel Alley"

### Complete Process

**1. Login as Instructor**
   - Navigate to http://localhost:3000
   - Log in with instructor credentials

**2. Access Grading Dashboard**
   - Click "Grading" in left sidebar
   - See "6 Pending Review" card

**3. Select Assessment**
   - Click on "Question 1 - LinkedIn Profile" submitted by "Navnit Daniel Alley"
   - Page loads showing the assessment details

**4. Review Student Answer**
   - Read their response carefully
   - See they mentioned "hands-on experience and strategic thinking"

**5. Review Model Answer (Optional)**
   - Scroll to "Suggested Model Answer"
   - Compare against Student/Professional versions
   - Note key elements they included/missed

**6. Use Answer Comparison (Optional)**
   - Click "Compare" button
   - Review side-by-side comparison
   - Close dialog

**7. Write Feedback**
   - Click in feedback text area
   - Type: "Great response! Your answer demonstrates a clear understanding of how to position yourself differently for various career stages. I especially liked how you emphasized hands-on experience and strategic thinking.

For improvement, consider being more specific about the 'social media strategies' you mentioned. What specific platforms would you prioritize?

Overall, this shows strong career planning awareness. Keep developing these narrative skills - they're valuable for interviews and networking."

**8. Assign Score (Optional)**
   - Enter "85" in score field

**9. Submit Feedback**
   - Click blue "Submit Feedback" button
   - Toast notification appears: "Feedback submitted successfully!"
   - Pending count decreases from 6 to 5
   - Reviewed count increases from 0 to 1

**10. Student Receives Notification**
   - Student's notification count increases by 1
   - Their Notifications page shows: "Feedback Posted" on this assessment
   - They can click "View" to see your feedback

---

## Troubleshooting

### Issue: "Compare" Button Shows Error

**Error:** `userId is not defined`

**Solution:**
- Refresh the page
- Ensure you're logged in as an instructor
- Try again

**If persists:** Contact system administrator

---

### Issue: Feedback Not Appearing

**Problem:** Student doesn't see your feedback on their notifications

**Possible Causes:**
1. Notification system is loading
2. Student hasn't refreshed their page
3. System cache needs clearing

**Solution:**
1. Wait 30 seconds
2. Ask student to refresh their Notifications page (Ctrl+R or Cmd+R)
3. Student can navigate to their quiz results page to see feedback directly

---

### Issue: Assessment Won't Load

**Problem:** "Assessment not found" error

**Possible Causes:**
1. Assessment was deleted
2. You don't have permission to grade it
3. Browser cache issue

**Solution:**
1. Go back to dashboard
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try a different assessment

---

### Issue: Can't See Pending Assessments

**Problem:** Dashboard shows "0 Pending Review"

**Possible Causes:**
1. No students have submitted in your courses
2. You've already graded all submissions
3. You're not the assigned instructor

**Solution:**
1. Have students submit assessments
2. Check if other instructors have graded pending items
3. Verify your instructor assignment for the course

---

## Feature Summary

| Feature | Purpose | When to Use |
|---------|---------|------------|
| **Pending Review** | See what needs grading | Track workload |
| **Feedback Form** | Provide guidance to students | Every assessment |
| **Model Answer** | Reference expected response | Calibrate grading |
| **Compare Tool** | Side-by-side comparison | Ensure consistency |
| **Score Field** | Quantify performance | Track metrics |
| **Notifications** | Alert students of feedback | Automatic |

---

## Common Questions

### Q: How long does it take for students to see my feedback?
**A:** Instantly! Notifications appear immediately after you submit feedback.

### Q: Can I edit feedback after submitting?
**A:** Not currently. Please review your feedback before submitting. If you need to update feedback, contact support.

### Q: What if a student's answer is blank or empty?
**A:** Still provide constructive feedback encouraging them to attempt the question and explaining what's expected.

### Q: Should I always give a numeric score?
**A:** No, verbal feedback is more valuable. Numeric scores are optional and supplementary.

### Q: How many assessments should I grade per day?
**A:** There's no requirement, but students appreciate receiving feedback within 3-5 business days.

### Q: Can multiple instructors grade the same assessment?
**A:** Currently, the system is designed for one instructor per assessment. Contact support if you need to change assignment.

---

## Support

For technical issues or feature requests:
- Contact: support@whitedgelms.com
- Reference this guide section number if reporting a problem
- Include screenshots if possible

---

## Quick Reference

**Navigate to Grading:** Left sidebar → "Grading"

**Grade an Assessment:** 
1. Click assessment from list
2. Read student answer
3. Write feedback
4. Click "Submit Feedback"

**Check Progress:** View statistics cards on dashboard

**Help Students:** They access feedback via Notifications → View button

---

**Last Updated:** January 10, 2026
**Version:** 1.0
**System:** WhitedgeLMS Instructor Grading v1.1

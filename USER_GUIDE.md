# WhitedgeLMS - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Student Guide](#student-guide)
3. [Instructor Guide](#instructor-guide)
4. [Administrator Guide](#administrator-guide)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## Getting Started

### System Requirements

**Minimum Requirements**:
- Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Internet Connection: 2+ Mbps
- Device: Desktop, Laptop, or Tablet
- Screen Resolution: 1024x768 or higher

**Recommended**:
- Browser: Latest version of Chrome/Firefox/Safari/Edge
- Internet: 5+ Mbps
- Desktop with 8GB+ RAM
- Screen Resolution: 1920x1080 or higher

### First Time Login

1. **Create Account**
   - Visit https://whiteboard-lms.vercel.app/
   - Click "Sign Up"
   - Select your role: Student or Instructor
   - Enter email, password, and full name
   - Verify your email (check inbox or spam folder)
   - Account approval by admin may take 24-48 hours

2. **Login**
   - Go to Login page
   - Enter registered email
   - Enter password
   - Click "Sign In"
   - You'll be redirected to dashboard

3. **Profile Setup** (Optional but Recommended)
   - Click profile icon (top-right)
   - Go to "Settings"
   - Add phone number
   - Upload profile picture
   - Update bio or additional info
   - Click "Save Changes"

---

## Student Guide

### Dashboard Overview

**Your Student Dashboard includes**:

1. **Enrolled Courses Section**
   - List of all courses you're enrolled in
   - Progress bar showing completion percentage
   - Quick access to course materials

2. **Available Tests**
   - Tests available for courses you're enrolled in
   - Attempt counter (e.g., "Attempt 1 of 3")
   - "Start Test" button to begin

3. **Performance Summary**
   - Overall performance metrics
   - Recent test results
   - Progress trends

4. **Certificates**
   - Tests you've passed with passing score
   - Download certificate as PDF
   - Certificate ID for verification

### Enrolling in Courses

**Step-by-Step**:

1. **Browse Courses**
   - Click "Explore Courses" from main menu
   - Browse available courses or use search

2. **View Course Details**
   - Click on any course card
   - Review course description, instructor info
   - Check program outcomes and FAQ
   - See course price and discount availability

3. **Apply Coupon (Optional)**
   - If you have a coupon code, enter it
   - Click "Apply Coupon"
   - See discount applied to price

4. **Enroll**
   - Click "Enroll Now" or "Enroll (with coupon)"
   - If free, instant enrollment
   - If paid, complete payment (payment gateway)
   - You'll be enrolled immediately

5. **Access Course**
   - Return to dashboard
   - Course now appears in "Enrolled Courses"
   - Click course to access content and tests

### Taking a Test

**Before You Start**:
- ✅ Ensure stable internet connection
- ✅ Use a desktop/laptop for better experience
- ✅ Close other browser tabs to free up resources
- ✅ Allow pop-ups from the website
- ✅ Have 2-3 minutes buffer for test duration

**During the Test**:

1. **Test Interface Overview**
   ```
   ┌─────────────────────────────────────────────┐
   │  Section Tabs │ Overall Timer │ Question # │
   ├─────────────────────────────────────────────┤
   │ Question | Passage (if any) | Answer Area  │
   │          |                   | Options/Text│
   ├─────────────────────────────────────────────┤
   │ Navigation Buttons │ Submit/Next Button    │
   └─────────────────────────────────────────────┘
   ```

2. **Section Navigation**
   - Click section tabs at top to navigate
   - **Note**: Once you submit a section, you cannot go back
   - Submitted sections show ✓ indicator
   - You can only submit or move forward

3. **Answering Questions**

   **For Multiple Choice (MCQ)**:
   - Click on one option to select
   - Selected option appears highlighted
   - Click again to deselect

   **For Descriptive Questions**:
   - Click in text area
   - Type your answer
   - Text is auto-saved as you type

4. **Question Palette** (Right Side)
   - **Green (🟢)**: You answered this question
   - **Red (🔴)**: You haven't answered this question
   - **Purple (🟣)**: You marked this for review
   - **Purple✓ (🟣✓)**: Answered AND marked for review

5. **Mark for Review**
   - Click "Mark for Review" button
   - Question shows purple in palette
   - You can return and change answer later (in same section)
   - Recommended for tough questions

6. **Review Answers** (Within Section)
   - Click on any question in palette
   - Jump to that question
   - You can change answers anytime before submitting

7. **Submitting a Section**
   - Click "Submit Section & Next"
   - Confirm submission dialog appears
   - Click "Confirm" to submit
   - **Important**: Section is now locked forever
   - Next section automatically loads
   - Previous section cannot be accessed

8. **Timers**
   - **Blue Timer (Section)**: Time left for current section
   - **Gray Timer (Overall)**: Total test time left
   - At 5 minutes remaining, timer turns red
   - When section timer ends, auto-submit section
   - When overall timer ends, auto-submit test

### After Test Submission

**Immediate Results**:
1. Results page appears with:
   - Score obtained
   - Total marks
   - Percentage
   - Percentile (how you rank among others)
   - Pass/Fail status

2. **View Detailed Analysis**
   - Click "View Details" or "Analysis"
   - See question-wise breakdown
   - View your answer vs correct answer
   - Read explanation for each question

3. **Download Certificate** (If Passed)
   - If you passed (≥ passing percentage)
   - "Download Certificate" button appears
   - Click to download PDF
   - Certificate includes score, date, certificate ID

4. **Attempt Again** (If Retakes Available)
   - If test allows multiple attempts
   - "Attempt Again" button available
   - Previous attempts accessible in dashboard

### Tracking Progress

**In Dashboard**:
- View course completion percentage
- See test scores and trends
- Track certificates earned
- Monitor time spent learning

**In Course Page**:
- Check modules completed
- View tests taken
- See performance by section
- Compare with class average

---

## Instructor Guide

### Dashboard Overview

**Instructor Dashboard Shows**:

1. **My Courses**
   - List of courses you teach
   - Student enrollment count
   - Course status (draft/published)
   - Quick actions (edit, delete, publish)

2. **Test Management**
   - Tests in each course
   - Total questions per test
   - Published status
   - Attempts count

3. **Class Analytics**
   - Average class score
   - Test statistics
   - Student performance metrics
   - Question difficulty analysis

### Creating a Course

**Step 1: Basic Info**
1. Click "Create New Course"
2. Fill in:
   - **Course Title**: e.g., "IELTS Preparation 2024"
   - **Description**: Detailed course overview
   - **Category**: Select from dropdown
   - **Pricing**: Set course price or free
   - **Original Price**: For discount calculation

**Step 2: Course Details**
1. Upload course image
2. Add program outcomes (learning goals)
3. Create FAQ sections
4. Add course structure/modules

**Step 3: Publish**
1. Review all information
2. Click "Publish Course"
3. Course is now visible to students

### Creating a Test

**Step 1: Test Configuration**
1. Go to course
2. Click "Create Test" or "Add Test"
3. Fill in:
   - **Test Title**: e.g., "Full Length Practice Test 1"
   - **Description**: What the test covers
   - **Total Marks**: e.g., 100
   - **Duration**: Total test time in minutes
   - **Passing Percentage**: e.g., 70%
   - **Attempts Allowed**: e.g., 3

**Step 2: Create Sections**
1. Click "Add Section" button
2. Configure each section:
   - **Section Name**: e.g., "Verbal Reasoning"
   - **Duration**: Time for this section (e.g., 20 minutes)
   - **Description**: Optional details
3. Reorder sections using drag-drop

**Step 3: Add Questions**
1. Click section to open
2. Click "Add Question"
3. Choose question type:
   - **Multiple Choice (MCQ)**: Select one correct answer
   - **Descriptive**: Free text answer

**For MCQ Questions**:
- Write question stem (use rich text editor)
- Add 4-5 options
- Select the correct option
- Set marks (e.g., +1 for correct)
- Set negative marks (e.g., -0.25 for wrong)
- Add explanation/solution (HTML supported)
- Assign to passage if needed

**For Descriptive Questions**:
- Write question stem (rich text)
- Set marks (no negative marking typical)
- Add sample solution/expected answer
- Set evaluation criteria

**Step 4: Add Passages** (If Applicable)
1. For reading comprehension tests
2. Click "Add Passage"
3. Write or paste passage content
4. Link questions to this passage
5. Questions appear alongside passage

**Step 5: Review & Publish**
1. Review all questions
2. Check total marks = expected
3. Review section timings
4. Click "Publish Test"
5. Test now available for students

### Rich Text Editing

**The Rich Text Editor allows**:

| Feature | How to Use |
|---------|-----------|
| **Bold** | Select text, click Bold icon or Ctrl+B |
| **Italic** | Select text, click Italic icon or Ctrl+I |
| **Strikethrough** | Select text, click Strikethrough icon |
| **Heading 1-3** | Click heading dropdown, select level |
| **Bullet List** | Click list icon, start typing |
| **Numbered List** | Click numbered list icon, start typing |
| **Code Block** | Click code icon for code formatting |
| **Image** | Click image icon, upload or paste URL |
| **Math Equation** | Click Katex icon, write LaTeX equation |
| **Font Size** | Select text, use font size dropdown |
| **Text Color** | Select text, click color picker |
| **Highlight** | Select text, click highlight color |

**Example**: For math: Type `$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`

### Managing Students & Performance

**View Class Performance**:
1. Open a test
2. Click "Statistics" or "Analytics"
3. View:
   - Average score
   - Score distribution
   - Highest/lowest scores
   - Pass rate
   - Question-wise performance

**View Individual Student Performance**:
1. Go to course
2. Click "Student List"
3. Click on any student
4. View their:
   - Tests taken
   - Scores
   - Time spent
   - Attempts

**Provide Feedback**:
1. View student's test attempt
2. Click "View Response"
3. See their answers
4. Add feedback comments
5. Highlight areas of improvement

### Publishing Tests

**Before Publishing**:
- ✅ All sections configured
- ✅ All questions added
- ✅ Total marks verified
- ✅ At least 1 question per section
- ✅ Passages linked correctly
- ✅ Solutions/explanations complete

**To Publish**:
1. Open test
2. Click "Publish Test"
3. Confirm dialog appears
4. Test now visible to enrolled students

**Unpublish** (If needed):
- Go to test settings
- Click "Unpublish"
- Test removed from student view
- Student attempts preserved

### Creating Blog Posts

**Step 1: New Post**
1. Go to "Blog" section
2. Click "Create New Post"

**Step 2: Content**
- **Title**: Post headline
- **Excerpt**: Short summary (shown in list)
- **Content**: Full article (use rich text editor)
- **Category**: Select or create
- **Featured Image**: Upload header image

**Step 3: Publish**
- Set status to "Published"
- Click "Publish"
- Post visible to all users

**Draft Mode**:
- Set status to "Draft"
- Only visible to you
- Useful for work-in-progress

---

## Administrator Guide

### Admin Dashboard

**Key Metrics**:
- Total users
- Active courses
- Tests published
- Student enrollments
- Revenue (if applicable)

### User Management

**Approve New Users**:
1. Go to "User Management"
2. Filter by "Status = Pending"
3. Review each user:
   - Name, email, role
   - Signup date
4. Click "Approve" to activate
5. User can now login

**Suspend Users**:
1. Find user in list
2. Click "Suspend" or ⋮ menu
3. Optionally add suspension reason
4. User cannot login anymore

**View User Details**:
1. Click on any user
2. See:
   - Profile information
   - Courses enrolled/taught
   - Tests taken (if student)
   - Activity log
   - Account status

### Content Moderation

**Review Blog Posts**:
1. Go to "Content Moderation"
2. Filter by "Status = Pending"
3. Review post content
4. Click "Approve" or "Reject"
5. Rejected posts can be edited by author

**Review Courses**:
1. View unpublished courses
2. Check course details
3. Verify content quality
4. Approve or request revisions

### Analytics & Reports

**Viewing Reports**:
1. Go to "Analytics"
2. Select report type:
   - **User Analytics**: Signup trends, active users
   - **Course Analytics**: Enrollment, completion rates
   - **Test Analytics**: Difficulty, discrimination index
   - **Performance Analytics**: Class-wise statistics

**Exporting Data**:
1. Generate report
2. Click "Export as CSV"
3. Save to computer
4. Use with Excel/Data tools for further analysis

### System Settings

**Configuration**:
1. Go to "Settings"
2. Update:
   - **Platform Name/Logo**
   - **Email Templates** for notifications
   - **Payment Gateway** settings
   - **Authentication** settings
   - **Storage Quota** limits

---

## Troubleshooting

### I Can't Login

**Solution 1: Password Reset**
1. Click "Forgot Password" on login page
2. Enter your email
3. Check email (including spam folder)
4. Click reset link
5. Create new password
6. Try logging in again

**Solution 2: Email Not Verified**
1. Check email (spam/promotions folder)
2. Click verification link in email
3. If no email received, click "Resend Verification"

**Solution 3: Account Suspended**
1. Contact administrator
2. Provide email address
3. Admin will investigate and reactivate

### Test Won't Load

**Solution 1: Refresh Page**
1. Press F5 or Ctrl+R
2. Wait for page to reload
3. Try accessing test again

**Solution 2: Clear Browser Cache**
1. Go to browser settings
2. Clear cache/cookies
3. Refresh page
4. Try test again

**Solution 3: Try Different Browser**
1. Open Chrome/Firefox/Safari
2. Login and try test
3. If works, issue is browser-specific
4. Update your browser

**Solution 4: Check Internet**
1. Open another website to verify connection
2. If no internet, reconnect to WiFi
3. Try test again

### Answers Not Saving

**Solution 1: Check Internet Connection**
- Answers auto-save as you select/type
- Verify you have internet connection

**Solution 2: Clear Browser Data**
1. Clear cache/cookies
2. Refresh page
3. Try test again

**Solution 3: Try Different Browser**
- See if issue persists
- Report to support if consistent

### Timer Issues

**Problem: Timer counts too fast/slow**
- Timer is synchronized with server
- If local device time is incorrect, timer may appear off
- Check your device's system time

**Problem: Section auto-submitted unexpectedly**
- This happens when section timer reaches 0:00
- Re-read section timer before answering
- Manage your time accordingly
- Cannot revisit submitted sections

### Can't Download Certificate

**Solution 1: Wait a Moment**
- Certificate generated after test result finalized
- May take 10-30 seconds
- Refresh page if button doesn't appear

**Solution 2: Check PDF Settings**
1. In browser settings, allow PDFs to download
2. Check downloads folder
3. Try downloading again

**Solution 3: Try Different Browser**
- Try Chrome, Firefox, Safari
- If works, use that browser

### Course Not Appearing

**Solution 1: Enrollment Pending**
- Course appears after enrollment confirmed
- Check email for confirmation
- Contact instructor if issue persists

**Solution 2: Course Not Published**
- Instructor may not have published yet
- Course becomes visible after publication
- Contact instructor to check status

### Forgot My Password

1. Click "Forgot Password" on login
2. Enter email address
3. Click "Send Reset Link"
4. Check email (spam folder too)
5. Click reset link in email
6. Enter new password
7. Confirm password
8. Click "Reset Password"
9. Login with new password

---

## FAQ

### General Questions

**Q: Is the platform free?**
A: Platform access is free. Some courses may have a fee set by instructors. Free courses are always available.

**Q: Do I need to install anything?**
A: No. WhitedgeLMS is web-based. Just open a browser and login.

**Q: Can I access on mobile?**
A: Yes, the platform is responsive. Best experience on tablet or desktop for taking tests.

**Q: How do I change my password?**
A: Go to Settings → Account → Change Password. Enter current password, then new password twice.

### Student Questions

**Q: How many times can I take a test?**
A: Depends on the test configuration. Instructor sets "Attempts Allowed" (e.g., 3 attempts). You can retake until you exhaust attempts.

**Q: What if I run out of time during a test?**
A: Test auto-submits when overall timer reaches 0:00. Sections auto-submit when section timer ends.

**Q: Can I submit a section early?**
A: Yes. Click "Submit Section & Next" button anytime. Once submitted, you cannot revisit that section.

**Q: What does "Mark for Review" do?**
A: It flags question as "to review later" (shown in purple in palette). Within the same section, you can jump back and change your answer. Useful for difficult questions.

**Q: When do I get my results?**
A: Immediately after submission. Score, percentile, and question analysis appear on results page.

**Q: What if I disagree with my score?**
A: Contact your instructor. They can review your responses and provide feedback.

**Q: Can I download my certificate?**
A: Yes, if you pass the test (≥ passing percentage). "Download Certificate" button appears on results page.

### Instructor Questions

**Q: How do I create a test with multiple sections?**
A: Create test → Add sections → Set duration per section → Add questions per section → Publish.

**Q: Can I reorder questions?**
A: Yes. Use drag-and-drop to reorder questions within a section.

**Q: Can I edit a test after publishing?**
A: Yes. Click "Edit" button. Changes take effect immediately for new attempts. Previous attempts unaffected.

**Q: How do I see student performance?**
A: Open test → Click "Statistics" for class analytics OR click "Attempts" to see individual student responses.

**Q: Can I provide feedback on student answers?**
A: Yes. View student's test attempt → Click "Add Feedback" → Write comments → Save. Student sees feedback on results page.

**Q: How do I create a blog post?**
A: Go to Blog → Click "Create New Post" → Add title, content, category → Set to "Published" → Click "Publish".

**Q: Can students see my draft posts?**
A: No. Draft posts are only visible to you. Publish to make visible to students.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (latest versions recommended).

**Q: Do you store my data securely?**
A: Yes. All data encrypted in transit (HTTPS) and at rest. Supabase PostgreSQL with Row-Level Security.

**Q: What happens if I lose internet during a test?**
A: Answers are auto-saved. When reconnected, test continues from where you left off.

**Q: Can I use a VPN?**
A: Yes, VPN is supported. Use your location appropriately.

**Q: What's the file size limit for uploads?**
A: Images: 5MB | Documents: 25MB

**Q: Is there an offline mode?**
A: Currently, platform requires internet. Offline mode planned for future.

---

## Contact & Support

**For Technical Issues**:
- Email: support@whiteboard-consultants.com
- Response time: 24 business hours

**For Account Issues**:
- Contact your administrator
- Or email support with account email

**For Course-Specific Issues**:
- Contact your instructor directly
- Use course messaging/support channel

**For Feedback & Suggestions**:
- Email: feedback@whiteboard-consultants.com
- We read and appreciate all feedback!

---

**Document Version**: 1.0  
**Last Updated**: November 14, 2025  
**Status**: Current

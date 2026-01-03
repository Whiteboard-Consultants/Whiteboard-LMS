# Student-Instructor Messaging - Quick Test Guide

## Pre-requisites

1. **Database Setup** ✓
   - Run `/database/create-messaging-system.sql` in Supabase SQL Editor
   - Run `/database/messaging-rls-policies.sql` in Supabase SQL Editor

2. **Enrollment Required**
   - Student must be enrolled in a course
   - Instructor must be the course instructor

## Quick Test Scenario

### Test Case 1: Create a Message Thread

**Setup:**
- Login as a student
- Enroll in a course (if not already)
- Go to course page

**Test Steps:**
1. Navigate to `/student/{courseId}/messaging`
2. Click "New Message" button
3. Enter thread title: "Help with Module 3"
4. Enter description: "I'm struggling with the quadratic equation examples"
5. Click "Create Thread"

**Expected Result:**
- Thread created successfully
- Redirected to thread view
- Compose box visible and ready for input
- Thread appears in thread list

**Database Check:**
```sql
SELECT * FROM message_threads 
WHERE student_id = '{current_user_id}' 
  AND course_id = '{course_id}';
```

---

### Test Case 2: Send a Message

**Setup:**
- Have created a message thread (Test Case 1)
- Be on thread detail page

**Test Steps:**
1. Type message: "I'm confused about step 2 in the example"
2. Click "Send Message"
3. Observe character counter updates

**Expected Result:**
- Message appears in conversation
- "Read" indicator shows (checkmark)
- Message timestamp displays correctly
- Character counter resets
- Compose box clears

**Database Check:**
```sql
SELECT * FROM messages 
WHERE thread_id = '{thread_id}' 
ORDER BY created_at;
```

---

### Test Case 3: View Message History

**Setup:**
- Have sent multiple messages in a thread

**Test Steps:**
1. Go to thread detail page
2. Scroll through messages
3. Observe message order and details

**Expected Result:**
- Messages appear in chronological order
- Older messages first, newest last
- Sender name shows correctly
- Timestamps use relative format ("2 minutes ago")
- Page auto-scrolls to newest message

---

### Test Case 4: Search and Sort Threads

**Setup:**
- Have created multiple message threads

**Test Steps:**
1. Go to `/student/{courseId}/messaging`
2. Use search box to filter by title
3. Click sort dropdown
4. Try each option: "Most Recent", "Oldest First", "Unread First"

**Expected Result:**
- Search filters threads by title
- Sort order changes correctly
- Thread list updates without page reload

---

### Test Case 5: Thread List Display

**Setup:**
- No threads created yet

**Test Steps:**
1. Go to `/student/{courseId}/messaging`
2. Observe empty state
3. Create a thread
4. Return to messaging page
5. Observe thread in list

**Expected Result:**
- Empty state shows helpful message
- "New Message Thread" button visible
- After creating thread, appears in list
- Thread shows:
  - Title
  - Description preview
  - Creation date
  - Any status badges

---

## Manual Testing Checklist

### UI Functionality
- [ ] Messaging pages load without errors
- [ ] Navigation works (breadcrumbs, back buttons)
- [ ] Forms submit correctly
- [ ] Loading spinners appear during API calls
- [ ] Success/error toasts appear
- [ ] Character counters update in real-time
- [ ] Buttons are properly enabled/disabled

### Message Display
- [ ] Messages show in correct order
- [ ] Sender information displays
- [ ] Timestamps are correct
- [ ] Own messages styled differently
- [ ] Read receipts visible
- [ ] Closed threads show status

### Course Integration
- [ ] Can access messaging from course page
- [ ] Correct course is passed to messaging page
- [ ] Breadcrumb shows course reference
- [ ] Back navigation returns to correct course

### Error Handling
- [ ] Network errors show toast
- [ ] Validation errors prevent submit
- [ ] Empty messages are rejected
- [ ] Authorization errors handled gracefully

### Performance
- [ ] Pages load within 2-3 seconds
- [ ] Message list scrolls smoothly
- [ ] Search responds quickly
- [ ] No console errors

---

## API Testing with curl

### Get All Threads for a Course
```bash
curl -X POST https://{your-domain}/api/messages/message-actions \
  -H "Content-Type: application/json" \
  -d '{"action":"getMessageThreads","courseId":"{courseId}"}'
```

### Send a Message
```bash
curl -X POST https://{your-domain}/api/messages/message-actions \
  -H "Content-Type: application/json" \
  -d '{"action":"sendMessage","threadId":"{threadId}","body":"Test message"}'
```

### Get Thread Messages
```bash
curl -X POST https://{your-domain}/api/messages/message-actions \
  -H "Content-Type: application/json" \
  -d '{"action":"getThreadMessages","threadId":"{threadId}"}'
```

---

## Troubleshooting

### Thread Not Created
- [ ] Check user is logged in
- [ ] Check user has valid enrollment in course
- [ ] Check message_threads table has appropriate RLS policies
- [ ] Check browser console for error details

### Messages Not Appearing
- [ ] Refresh the page
- [ ] Check message was actually sent (check DB)
- [ ] Check RLS policies allow message access
- [ ] Verify message_threads and messages tables exist

### Styling Issues
- [ ] Clear browser cache
- [ ] Check Tailwind CSS is properly configured
- [ ] Verify lucide-react icons are installed
- [ ] Check no console errors

### Performance Issues
- [ ] Check database query performance
- [ ] Verify indexes are created
- [ ] Check for N+1 queries in getThreadMessages
- [ ] Consider pagination for large conversations

---

## Database Verification

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'message%';
```

### Check RLS Policies
```sql
SELECT * FROM pg_policies 
WHERE tablename LIKE 'message%';
```

### Check Data
```sql
-- Threads for a student
SELECT * FROM message_threads 
WHERE student_id = '{user_id}';

-- Messages in a thread
SELECT * FROM messages 
WHERE thread_id = '{thread_id}' 
ORDER BY created_at;

-- Notifications
SELECT * FROM message_notifications 
WHERE user_id = '{user_id}';
```

---

## Notes

- Messages are auto-marked as read when thread is viewed
- Read receipts (checkmark) only show on own messages
- Closed threads prevent new message submission
- Thread creation automatically sets instructor from course
- All operations subject to RLS policies
- Service role used for admin operations only

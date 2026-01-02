# Student-Instructor Messaging System - Implementation Guide

## Overview
Complete messaging system allowing students to create multiple message threads with their course instructor, with features like read receipts, file attachments, typing indicators, and notifications.

## Database Schema

### Tables Created
1. **message_threads** - Conversation topics per course
2. **messages** - Individual messages within threads
3. **message_attachments** - Files attached to messages
4. **message_notifications** - In-app notifications for new messages
5. **typing_indicators** - Real-time typing status (polling-based)

## Setup Instructions

### Step 1: Run Database Migration

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy content from `/database/create-messaging-system.sql`
3. Run the SQL
4. Then run SQL from `/database/messaging-rls-policies.sql`

This creates:
- ✓ All 5 tables with indexes
- ✓ Triggers for `updated_at` fields
- ✓ Row Level Security (RLS) policies
- ✓ Performance indexes

### Step 2: Understand the Architecture

**Server Actions** (`src/app/api/messages/message-actions.ts`)

All actions are 'use server' and use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for administrative operations.

Key exports:
```typescript
// Thread Management
- createMessageThread(courseId, enrollmentId, title, description)
- getMessageThreads(courseId?)
- closeMessageThread(threadId)

// Messaging
- sendMessage(threadId, body)
- getThreadMessages(threadId)
- searchMessages(threadId, query)

// Attachments
- addMessageAttachment(messageId, fileUrl, fileName, fileType, fileSize)
- getMessageAttachments(messageId)

// Notifications
- getUnreadNotifications()
- markNotificationAsRead(notificationId)

// Typing Indicators
- setTypingIndicator(threadId)
- clearTypingIndicator(threadId)
- getTypingIndicators(threadId)
```

### Step 3: Access Control Rules

**Students:**
- ✓ Can create threads for courses they're enrolled in
- ✓ Can only view/message their own threads
- ✓ Cannot see other students' threads

**Instructors:**
- ✓ Can see all student threads for their courses
- ✓ Can reply to any student's thread
- ✓ Can close threads
- ✓ Can view all messages in their course threads

**RLS Enforced:**
- Students can't query other students' threads
- Only message sender and recipient can see messages
- Only enrolled students can create threads for their courses

## Implementation Phases

### Phase 1: Core Backend (Done ✓)
- [x] Database schema
- [x] RLS policies
- [x] Server actions for messaging
- [x] Notification system
- [x] Typing indicators

### Phase 2: Student Messaging UI (Next)
Need to build:
1. **Student Course Page Integration**
   - Button: "Message Instructor"
   - Shows current message threads for course
   - Click to open messaging interface

2. **Message Thread List**
   - Show all threads for a course
   - Display: thread title, last message preview, unread count, last activity time
   - Button to create new thread

3. **Message Thread View**
   - Display messages chronologically
   - Show sender name, timestamp, read status
   - Inline typing indicators
   - Unread badge for new messages

4. **Compose/Reply Interface**
   - Text input with rich formatting
   - File upload button (integrates with Supabase Storage)
   - Send button
   - Auto-clear typing indicator on send

5. **Notifications**
   - Badge on instructor icon showing unread count
   - Toast notification for new messages
   - Mark as read when viewing thread

### Phase 3: Instructor Messaging Dashboard (After Phase 2)
Need to build:
1. **All Threads Dashboard**
   - List all threads from all students
   - Filter by: course, status (open/closed), unread
   - Search by student name or thread title

2. **Thread Management**
   - Quick reply interface
   - Close/reopen threads
   - View student enrollment info
   - Mark messages as read

3. **Analytics**
   - Response time metrics
   - Most active courses
   - Student engagement tracking

### Phase 4: Advanced Features (Polish)
- Email notifications for new messages
- Message search across all threads
- Thread templates/quick responses
- Message history export
- @mentions for instructors to tag messages

## File Structure

```
src/app/
├── api/
│   └── messages/
│       └── message-actions.ts          # All server actions
│
├── (main)/
│   ├── student/
│   │   └── [courseId]/
│   │       └── messaging/              # Student messaging UI
│   │
│   └── instructor/
│       └── dashboard/
│           └── messages/               # Instructor messaging UI
│
database/
├── create-messaging-system.sql         # Schema
└── messaging-rls-policies.sql          # RLS policies
```

## Testing the System

### Test 1: Create Thread
```typescript
const result = await createMessageThread(
  'course-id',
  'enrollment-id',
  'How do I solve problem 3?',
  'I\'m stuck on the derivative calculation'
);
```

### Test 2: Send Message
```typescript
const result = await sendMessage(
  'thread-id',
  'Can you explain step by step?'
);
```

### Test 3: Get Notifications
```typescript
const result = await getUnreadNotifications();
// Returns: [{ id, thread_id, notification_type, created_at }]
```

### Test 4: Search Messages
```typescript
const result = await searchMessages(
  'thread-id',
  'derivative'
);
// Returns messages containing "derivative"
```

## Important Notes

### Typing Indicators (Polling-Based)
- Client polls `/api/messages/getTypingIndicators` every 1 second
- Indicators auto-delete after 5 seconds
- No real-time WebSocket (as per requirements)

### Notifications
- Created automatically when:
  - New thread created → notifies instructor
  - New message sent → notifies recipient
- Not email notifications yet (can add in Phase 4)

### File Attachments
- Files stored in Supabase Storage
- Create bucket: `message-attachments`
- Path: `/messages/{threadId}/{messageId}/{filename}`
- Max file size: implement on client (e.g., 10MB)

### Read Receipts
- Unread messages auto-marked when thread opened
- `read_at` timestamp recorded
- UI shows: "Seen at 2:34 PM"

## Security Considerations

✓ All queries use RLS
✓ Service role only used in server actions
✓ Users can't access other users' threads
✓ Enrollment verification before creating threads
✓ Sender verification before adding attachments

## Next Steps

1. **Deploy Database**
   - Run SQL migrations in Supabase
   - Test RLS policies

2. **Build UI Components** (Phase 2)
   - Start with student message list
   - Then thread view
   - Then instructor dashboard

3. **Integrate with Courses**
   - Add messaging button on course page
   - Link to student messaging dashboard

4. **Add Notifications**
   - Toast for new messages
   - Badge count for unread

5. **Testing**
   - Test student can't see other threads
   - Test instructor sees all threads
   - Test message history persistence

Ready to build the UI components?

# Instructor Messaging Feature - Setup Guide

## Problem
Instructors were unable to send messages to students. When attempting to send a message through a student's profile modal, they received the error: **"Failed to send notification"**.

## Root Causes
1. **Missing Database Table**: The `notifications` table did not exist in Supabase
2. **Wrong Supabase Client**: The `sendNotification` function was using the client-side `supabase` client which respects RLS policies, instead of the server-side `supabaseAdmin` client which bypasses RLS

## Solution

### 1. Create the Notifications Table
Execute the SQL migration in `database/create-notifications-table.sql` in your Supabase dashboard:

**File**: `database/create-notifications-table.sql`

This SQL script:
- ✅ Creates the `notifications` table with proper schema
- ✅ Sets up indexes for performance
- ✅ Enables Row-Level Security (RLS)
- ✅ Creates RLS policies for:
  - Users can view their own notifications (as sender or receiver)
  - Senders can create new notifications
  - Receivers can mark notifications as read
  - Receivers can delete their notifications
- ✅ Creates a trigger for automatic `updated_at` timestamp

### 2. Fix the sendNotification Function
**File**: `src/app/actions.ts`

**Changes**:
- Added import for `supabaseAdmin` from `@/lib/supabase-admin`
- Updated `sendNotification()` to use `supabaseAdmin` instead of `supabase`
- Added null check for `supabaseAdmin`
- Enhanced error logging for better debugging
- Improved error messages with detailed information

**Before**:
```typescript
import { supabase } from '@/lib/supabase';

export async function sendNotification(data: {...}) {
  try {
    const { error } = await supabase  // ❌ Uses client, respects RLS
      .from('notifications')
      .insert({...});
  }
}
```

**After**:
```typescript
import { supabase } from '@/lib/supabase';
import supabaseAdmin from '@/lib/supabase-admin';  // ✅ Added

export async function sendNotification(data: {...}) {
  if (!supabaseAdmin) {  // ✅ Added safety check
    return { success: false, error: 'Server configuration error.' };
  }
  
  try {
    const { error } = await supabaseAdmin  // ✅ Uses admin client, bypasses RLS
      .from('notifications')
      .insert({...});
  }
}
```

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY
  sender_id UUID NOT NULL -- Who sent the message
  sender_name TEXT NOT NULL -- Sender's name for UI display
  receiver_id UUID NOT NULL -- Who receives the message
  message TEXT NOT NULL -- The message content
  is_read BOOLEAN DEFAULT FALSE -- Track if student read it
  created_at TIMESTAMP -- When created
  updated_at TIMESTAMP -- When updated
)
```

## How It Works

1. **Instructor opens student profile** → Sees "Send a Message" form
2. **Instructor types message** → Validates message is at least 10 characters
3. **Instructor clicks Send** → Calls `sendNotification()` server action
4. **Server action**:
   - Validates required fields
   - Uses `supabaseAdmin` to bypass RLS
   - Inserts notification into database
5. **Student receives notification** → Appears in notification center
6. **RLS protects data** → Each user can only see their own notifications

## Testing

### For Instructors
1. Navigate to **Courses & Reports** → Select a course
2. Click on student name to open profile modal
3. Fill in the "Send a Message" form
4. Click "Send"
5. Should see success message: "Your message has been sent"

### For Students
1. Check notification bell icon in top navigation
2. Instructor's message should appear in notification center
3. Can mark as read or dismiss

## Environment Requirements
- ✅ Supabase project with service role key configured
- ✅ `SUPABASE_SERVICE_ROLE_KEY` environment variable set (server-only)
- ✅ Database migration executed

## Security
- **RLS Enabled**: Only users can see their own messages
- **Server-Side Only**: Uses admin credentials on server, never exposed to browser
- **Validation**: Messages must be at least 10 characters
- **Audit Trail**: All messages timestamped with `created_at` and `updated_at`

## Troubleshooting

### Error: "Table notifications does not exist"
→ Execute the SQL migration in Supabase dashboard

### Error: "Server configuration error"
→ Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### Error: "Failed to send notification: permission denied"
→ Check that RLS policies were created correctly (see create-notifications-table.sql)

### Messages not appearing for students
→ Verify notification center is subscribed to real-time updates (see student-notification-center.tsx)

## Files Modified
- ✅ `src/app/actions.ts` - Fixed sendNotification function
- ✅ `database/create-notifications-table.sql` - New migration file

## Files Referenced (No changes needed)
- `src/components/student-profile.tsx` - UI component for sending messages
- `src/components/student-notification-center.tsx` - Displays notifications
- `src/lib/supabase-admin.ts` - Admin client configuration

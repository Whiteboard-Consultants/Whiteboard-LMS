# Instructor Messaging - Implementation Steps

## ⚠️ CRITICAL: Execute Database Migration

You must execute the SQL migration to create the notifications table before the messaging feature will work.

### Step 1: Go to Supabase Dashboard
1. Navigate to [Supabase Dashboard](https://app.supabase.com/)
2. Select your **WhitedgeLMS** project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy and Execute SQL
Copy the entire contents of `database/create-notifications-table.sql` and paste it into the SQL editor.

**File Location**: `database/create-notifications-table.sql`

The SQL creates:
- ✅ `notifications` table with all required columns
- ✅ Indexes for performance
- ✅ RLS (Row-Level Security) policies
- ✅ Automatic timestamp trigger

### Step 3: Execute
Click **Run** or press `Cmd+Enter` to execute the query.

You should see a message like:
```
Query successful - Created X objects
```

### Step 4: Verify
Go to **Table Editor** and verify the `notifications` table appears in the list.

---

## Code Changes Summary

### Fixed: `src/app/actions.ts`
- ✅ Imported `supabaseAdmin` from `@/lib/supabase-admin`
- ✅ Updated `sendNotification()` function to use admin client
- ✅ Added proper error logging
- ✅ No TypeScript errors

### Created: `database/create-notifications-table.sql`
- ✅ Creates notifications table
- ✅ Sets up RLS policies
- ✅ Creates database indexes

---

## How to Test

### As an Instructor:
1. Log in to the app
2. Go to **Courses & Reports** → Select a course
3. Click on a student name in the report
4. Fill in "Send a Message" form (min 10 characters)
5. Click **Send**
6. Should see: "Your message has been sent"

### As a Student:
1. Check the notification bell icon (top right)
2. Your instructor's message should appear
3. Click to expand and read the full message

---

## If You Get Errors

### Error: "Table notifications does not exist"
→ You haven't executed the SQL migration yet. Follow Step 1-4 above.

### Error: "new row violates row-level security policy"
→ Make sure you executed the **latest version** of the SQL migration. The RLS policy was updated to allow admin client inserts.

### Error: "Permission denied"
→ Verify `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`

---

## Database Schema Created

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
  sender_name TEXT NOT NULL
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
  message TEXT NOT NULL
  is_read BOOLEAN DEFAULT FALSE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

---

## RLS Policies

1. **SELECT**: Users can see notifications they sent or received
2. **INSERT**: Anyone can create (called by server with admin credentials)
3. **UPDATE**: Only receivers can mark as read
4. **DELETE**: Only receivers can delete

---

## Technical Details

### Why Admin Client?
- `supabaseAdmin` uses the service role key
- Allows bypassing RLS for trusted server operations
- Only used in server actions, never exposed to browser

### Why New RLS Policy?
- When using admin client, `auth.uid()` is NULL
- Old policy `WITH CHECK (auth.uid() = sender_id)` would fail
- New policy `WITH CHECK (true)` allows admin client inserts
- Regular users still have restrictions via SELECT/UPDATE/DELETE policies

---

## Files Modified

✅ `src/app/actions.ts` - Uses admin client for notifications  
✅ `database/create-notifications-table.sql` - New migration file

## Status

- 📝 Code: ✅ Complete (no TypeScript errors)
- 🗄️ Database: ⏳ Pending (execute SQL migration)
- 🧪 Testing: ⏳ After migration executed

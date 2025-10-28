# Database Migrations Checklist for Production

This document tracks all database setup and migrations required for production deployment.

---

## ✅ VERIFIED MIGRATIONS (Already Exists)

### Users Table
- **Status**: ✅ EXISTS (core auth table)
- **Check**: 
  ```sql
  SELECT * FROM information_schema.tables WHERE table_name = 'auth.users';
  ```

### Courses Table
- **Status**: ✅ EXISTS
- **Verify RLS**:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'courses';
  -- Should show read policy for students, full access for instructors
  ```

### Enrollments Table
- **Status**: ✅ EXISTS
- **Check Schema**:
  ```sql
  SELECT column_name, data_type FROM information_schema.columns 
  WHERE table_name = 'enrollments';
  -- Verify columns: id, user_id, course_id, enrolled_at, progress, status
  ```

### Lessons Table
- **Status**: ✅ EXISTS
- **Check**:
  ```sql
  SELECT COUNT(*) FROM lessons;
  ```

### Storage Bucket for Course Assets
- **Status**: ✅ EXISTS
- **Check in Supabase Dashboard**:
  - Storage > course-assets bucket should exist
  - RLS policies should allow authenticated users to upload
  - Public read access for course materials

---

## 🔄 PENDING MIGRATIONS (Ready to Deploy)

### 1. Notifications Table ⚠️ PRIORITY: HIGH

**Purpose**: Enable instructor-to-student messaging and notifications

**Status**: SQL created, awaiting execution

**SQL to Execute**:
```sql
-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read_at timestamp,
  created_at timestamp DEFAULT now(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  notification_type text DEFAULT 'message', -- 'message', 'announcement', 'grade', etc
  related_entity_id uuid,
  related_entity_type text -- 'course', 'lesson', 'quiz', etc
);

-- Create index for faster queries
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (auth.uid() = recipient_id);

-- Policy: Admin and instructors can send notifications
CREATE POLICY "Admin and instructors can send notifications"
ON notifications FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM user_profile
    WHERE id = auth.uid()
    AND role IN ('admin', 'instructor')
  )
);

-- Policy: Recipients can mark their notifications as read
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO service_role;
```

**Execution Steps**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Paste SQL above
5. Click "Execute"
6. Verify success

**Verification**:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'notifications';
-- Should return 1 row
```

---

### 2. Announcements Table (If Not Exists)

**Purpose**: Course-wide announcements separate from individual messaging

**Status**: May need creation

**Check First**:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'announcements';
```

**SQL If Needed**:
```sql
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  content text NOT NULL,
  pinned boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Instructors can read and modify announcements for their courses
CREATE POLICY "Instructors can manage announcements"
ON announcements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN user_profile up ON c.instructor_id = up.id
    WHERE c.id = announcements.course_id
    AND up.id = auth.uid()
  )
);

-- Students can read announcements for their enrolled courses
CREATE POLICY "Students can read announcements"
ON announcements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.course_id = announcements.course_id
    AND e.user_id = auth.uid()
  )
);
```

---

### 3. Certificates Table (If Not Exists)

**Purpose**: Track issued certificates and completion

**Status**: May need creation

**Check First**:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'certificates';
```

**SQL If Needed**:
```sql
CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at timestamp DEFAULT now(),
  certificate_url text,
  verification_code text UNIQUE DEFAULT gen_random_uuid()::text,
  expiry_date timestamp
);

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can read their own certificates
CREATE POLICY "Users can read own certificates"
ON certificates FOR SELECT
USING (auth.uid() = user_id);

-- Admin and instructors can manage certificates
CREATE POLICY "Admin and instructors can manage certificates"
ON certificates FOR ALL
USING (
  auth.uid() IN (
    SELECT DISTINCT c.instructor_id 
    FROM courses c 
    WHERE c.id = certificates.course_id
  ) OR
  EXISTS (
    SELECT 1 FROM user_profile 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

### 4. Progress Tracking Table (If Not Exists)

**Purpose**: Track student progress through lessons and quizzes

**Status**: Likely needs verification

**Check First**:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'lesson_progress';
```

**SQL If Needed**:
```sql
CREATE TABLE lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at timestamp,
  progress_percentage integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  last_accessed_at timestamp DEFAULT now(),
  quiz_score integer -- NULL if no quiz or not completed
);

CREATE INDEX idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own progress
CREATE POLICY "Users can manage own progress"
ON lesson_progress FOR ALL
USING (auth.uid() = user_id);

-- Instructors can read their students' progress
CREATE POLICY "Instructors can read student progress"
ON lesson_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = lesson_progress.user_id
    AND c.instructor_id = auth.uid()
  )
);
```

---

## 🔍 RLS POLICY VERIFICATION

**Run this to check all RLS policies are in place**:

```sql
-- List all tables with RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- List all policies
SELECT table_name, policy_name, command
FROM information_schema.table_constraints
WHERE constraint_type = 'POLICY';

-- Or better, use:
SELECT * FROM pg_policies ORDER BY tablename, policyname;
```

**Expected Policies**:
- users table: Read access for admins, update for self
- courses table: Read for all authenticated, modify for instructors
- enrollments table: Read own, create for authenticated
- lessons table: Read based on course enrollment
- certificates table: Read own or manage for instructors
- notifications table: Read own, create for instructors
- lesson_progress table: Manage own, read for instructors

---

## 🧹 DATA CLEANUP SCRIPTS (For Production)

### Remove Test Data
```sql
-- Delete test courses
DELETE FROM courses WHERE title LIKE '%test%' OR title LIKE '%demo%';

-- Delete stale enrollments (older than 90 days with no progress)
DELETE FROM enrollments 
WHERE enrolled_at < NOW() - INTERVAL '90 days'
AND (SELECT COUNT(*) FROM lesson_progress lp 
     WHERE lp.user_id = enrollments.user_id 
     AND lp.course_id = enrollments.course_id) = 0;

-- Delete unverified accounts (older than 30 days)
-- If you have an email_verified field:
-- DELETE FROM auth.users WHERE email_verified = false AND created_at < NOW() - INTERVAL '30 days';
```

### Archive Old Data
```sql
-- Copy old enrollments to archive (if you have archive table)
INSERT INTO enrollments_archive
SELECT * FROM enrollments
WHERE enrolled_at < NOW() - INTERVAL '1 year'
AND completed_at IS NOT NULL;

DELETE FROM enrollments
WHERE enrolled_at < NOW() - INTERVAL '1 year'
AND completed_at IS NOT NULL;
```

---

## 📊 DATA VALIDATION QUERIES

**Run these after all migrations to ensure data integrity**:

```sql
-- Check for orphaned enrollments (user deleted but enrollment exists)
SELECT e.id, e.user_id
FROM enrollments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE u.id IS NULL;

-- Check for missing courses
SELECT e.id, e.course_id
FROM enrollments e
LEFT JOIN courses c ON e.course_id = c.id
WHERE c.id IS NULL;

-- Count users by role
SELECT role, COUNT(*) as count
FROM user_profile
GROUP BY role;

-- Count enrollments by status
SELECT status, COUNT(*) as count
FROM enrollments
GROUP BY status;

-- Check for notifications with missing users
SELECT n.id, n.sender_id, n.recipient_id
FROM notifications n
LEFT JOIN auth.users u1 ON n.sender_id = u1.id
LEFT JOIN auth.users u2 ON n.recipient_id = u2.id
WHERE u1.id IS NULL OR u2.id IS NULL;
```

---

## 🔧 POST-MIGRATION VERIFICATION CHECKLIST

After all migrations, verify:

- [ ] All tables created successfully
- [ ] All indexes created successfully
- [ ] All RLS policies applied and working
- [ ] No orphaned records (run validation queries above)
- [ ] Admin user can access admin functions
- [ ] Instructors can manage their courses
- [ ] Students can enroll in courses
- [ ] Notifications can be sent/received
- [ ] Certificates can be generated
- [ ] Progress tracking works

---

## 🚨 ROLLBACK PROCEDURE

**If something goes wrong, Supabase has automated backups:**

1. Go to Supabase Dashboard
2. Settings → Backups
3. Find backup before migration
4. Click "Restore" (this will restore the entire database)

**Note**: Always test migrations on a staging/dev database first!

---

## 📝 MIGRATION EXECUTION LOG

**Date Executed**: _______________  
**Executed By**: _______________  
**Notifications Table**: ✅ / ⏳ / ❌  
**Announcements Table**: ✅ / ⏳ / ❌  
**Certificates Table**: ✅ / ⏳ / ❌  
**Progress Tracking Table**: ✅ / ⏳ / ❌  
**RLS Policies Verified**: ✅ / ⏳ / ❌  
**Data Validation**: ✅ / ⏳ / ❌  

**Issues Encountered**: 
```
_________________________________________
_________________________________________
```

**Resolution**:
```
_________________________________________
_________________________________________
```

---

**For help with Supabase SQL**: https://supabase.com/docs/guides/database  
**For RLS policy examples**: https://supabase.com/docs/guides/auth/row-level-security

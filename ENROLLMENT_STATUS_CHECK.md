# Enrollment Status Check

Use this to understand what's happening with enrollments:

## Check Enrollment Status
```sql
-- For a specific course (replace course_id)
SELECT 
  e.id,
  e.user_id,
  u.name as student_name,
  e.course_id,
  c.title as course_title,
  e.status,
  e.created_at,
  e.enrolled_at
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
WHERE e.course_id = 'c48f5246-0355-42bd-925c-6161d4984de7'
ORDER BY e.created_at DESC;
```

## Check Pending Enrollments
```sql
-- All pending enrollments across all courses
SELECT 
  e.id,
  u.name as student_name,
  c.title as course_title,
  e.status,
  e.created_at
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
WHERE e.status = 'pending'
ORDER BY e.created_at DESC;
```

## Check Enrollment Counts by Status
```sql
-- Summary of enrollments by course and status
SELECT 
  c.id,
  c.title,
  e.status,
  COUNT(*) as count
FROM enrollments e
LEFT JOIN courses c ON e.course_id = c.id
GROUP BY c.id, c.title, e.status
ORDER BY c.title, e.status;
```

## What You Should See

**With the new system:**
- New enrollments start with `status='pending'`
- Admin must approve before `status='approved'` and `enrolled_at` is set
- Once approved, instructors can see the student in their reports

**If instructor sees "No students":**
- Either: No enrollments exist yet
- Or: All enrollments are still `pending` (need admin approval)
- Or: The database wasn't updated

Check the queries above to diagnose the issue.

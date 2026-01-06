# Programs Table Setup Guide

## Quick Start (5 minutes)

### Step 1: Apply Database Migration
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `database/add-programs-table.sql`
4. Click "Run"
5. Verify: You should see tables for `programs` and `programs_with_courses` view created

### Step 2: Test the Implementation

#### As a Regular User:
1. Navigate to `http://localhost:3000/courses`
2. You should see the "All Online Programs" table at the top
3. The table shows: Program, Start Date, Last Enrollment Date, Courses count
4. Table is **read-only** - no edit buttons visible

#### As an Admin User:
1. Navigate to `http://localhost:3000/courses`
2. Look for **Edit** (pencil icon) and **Delete** (trash icon) buttons
3. Click **Edit** on any program row to modify fields inline
4. Click **+ Add Program** to create a new program
5. Click **Save** or **Cancel** after editing
6. Note: Initially, there may be no programs - you'll need to create them

### Step 3: Access Admin Programs Dashboard
1. Login as admin user
2. Navigate to `http://localhost:3000/admin/programs`
3. You'll see:
   - **All Programs** table with edit/delete controls
   - **+ New Program** button
   - Click course count to manage which courses belong to this program

### Step 4: Link Courses to Programs
1. From `/admin/programs` page
2. Click on the course count button (e.g., "0 courses")
3. A dialog opens showing:
   - **Linked Courses** (currently linked to this program)
   - **Available Courses** (not yet linked)
4. Click **Link** button to add a course
5. Click **Unlink** button to remove a course

## Database Schema Reference

### programs table
```sql
id            UUID PRIMARY KEY
name          TEXT NOT NULL
description   TEXT
start_date    DATE
last_enrollment_date DATE
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### programs_with_courses view
- Includes all program fields plus `course_count`
- Auto-calculated based on courses linked to each program

### courses table (updated)
- Added `program_id` column (nullable)
- Links to `programs.id`

## User Roles & Permissions

### Public Users:
- ✅ Can view programs table on `/courses`
- ✅ Can see program details (name, dates, course count)
- ❌ Cannot edit/delete programs
- ❌ Cannot create programs

### Admin Users:
- ✅ Can view all programs
- ✅ Can edit program details (inline on `/courses` or `/admin/programs`)
- ✅ Can delete programs
- ✅ Can create new programs
- ✅ Can link/unlink courses to programs
- ✅ Can access `/admin/programs` dashboard

## File Changes Summary

### Created:
- ✅ `database/add-programs-table.sql` - Database migration
- ✅ `src/app/admin/programs-actions.ts` - Server actions (CRUD + linking)
- ✅ `src/components/programs-table.tsx` - Public programs table component
- ✅ `src/app/(main)/admin/programs/page.tsx` - Admin programs management page

### Modified:
- ✅ `src/components/course-page-client.tsx` - Integrated programs table
- ✅ `src/components/sidebar-nav.tsx` - Added Programs link to admin nav

## Troubleshooting

### "Programs not loading" on `/courses`
- Check if database migration was run successfully
- Verify `programs` table exists in Supabase
- Check browser console for errors

### Edit buttons not showing for admins
- Verify you're logged in as admin (`role = 'admin'` in users table)
- Check that auth context is loading correctly
- Refresh the page

### RLS error when editing
- Ensure Supabase service role key is set in environment
- Verify admin RLS policy was created
- Check that user has admin role in database

### Can't link courses to program
- Verify courses exist in database
- Check that courses table has `program_id` column
- Ensure you're viewing the correct program

## API Endpoints (Server Actions)

All operations are server actions (not HTTP endpoints). Call them like:

```typescript
import { getPrograms, createProgram, updateProgram } from '@/app/admin/programs-actions';

// Fetch all programs
const result = await getPrograms();
if (result.success) {
  console.log(result.data);
}

// Create program
const newProgram = await createProgram({
  name: 'IELTS Preparation',
  description: 'Complete IELTS course bundle',
  start_date: '2026-02-01',
  last_enrollment_date: '2026-03-31'
});
```

## Performance Notes

- Programs table uses view (`programs_with_courses`) for efficient querying
- Course counts calculated at query time (no redundant storage)
- Indexes on `program_id` for fast lookups
- RLS policies minimize queries on public access

## Next: Customization Ideas

Once basic setup is working, you could:

1. **Add more program fields**:
   - Duration in weeks
   - Max capacity
   - Enrollment status (open/closed)
   - Certification type

2. **Add program metadata**:
   - Curriculum overview
   - Learning outcomes
   - Prerequisites
   - Target audience

3. **Enhance the UI**:
   - Program detail page with full info
   - Course listing under each program
   - Enrollment count per program
   - Program status badges

4. **Admin features**:
   - Bulk actions (edit multiple programs)
   - Program templates
   - Archive vs delete
   - Audit log of changes

---

**Ready?** Start with Step 1 above! 🚀

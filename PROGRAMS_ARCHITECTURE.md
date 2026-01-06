# Programs Table Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interfaces                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Public /courses Page          Admin /admin/programs Page      │
│  ┌──────────────────────┐      ┌──────────────────────────┐    │
│  │ Programs Table       │      │ Programs Management      │    │
│  │ (Read-only for      │      │ ✏️ Edit Fields            │    │
│  │  regular users)     │      │ 🗑️ Delete Programs       │    │
│  │ + Add Program (admin)│      │ 🔗 Link Courses         │    │
│  │ 📋 View/Edit (admin)│      │ + Create New Program     │    │
│  │                      │      │                          │    │
│  │ Displays:           │      │ All features from        │    │
│  │ • Program Name      │      │ public page +            │    │
│  │ • Start Date        │      │ course management        │    │
│  │ • Last Enrollment   │      │                          │    │
│  │ • Course Count      │      │                          │    │
│  └──────────────────────┘      └──────────────────────────┘    │
│           ↓                               ↓                    │
└─────────────────────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│        Client-Side Components (React + TypeScript)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ProgramsTable Component        AdminProgramsPage Component    │
│  ┌─────────────────────┐       ┌─────────────────────────┐    │
│  │ • Render table      │       │ • Program CRUD          │    │
│  │ • Handle edit mode  │       │ • Course linking dialog │    │
│  │ • Delete confirm    │       │ • Form validation       │    │
│  │ • Create dialog     │       │ • Error handling        │    │
│  │ • Date formatting   │       │ • Loading states        │    │
│  └─────────────────────┘       └─────────────────────────┘    │
│           ↓                               ↓                    │
└─────────────────────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│    Server Actions (programs-actions.ts - Server-Side)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  getPrograms()                  createProgram()                │
│  ├─ Query all programs          ├─ Validate input              │
│  ├─ Join with course counts     ├─ Insert new record           │
│  └─ Return paginated results    └─ Return created program      │
│                                                                 │
│  getProgramById()               updateProgram()                │
│  ├─ Query single program        ├─ Validate changes            │
│  └─ Return program details      ├─ Update record              │
│                                  └─ Return updated program     │
│                                                                 │
│  deleteProgram()                linkCourseToProgram()          │
│  ├─ Verify exists               ├─ Update course.program_id    │
│  ├─ Delete record               └─ Return updated course       │
│  └─ Handle CASCADE               unlinkCourseFromProgram()    │
│                                  └─ Set course.program_id=NULL │
│                                                                 │
│  getCoursesByProgram()                                          │
│  ├─ Query courses by program_id                                │
│  └─ Return filtered courses                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│        Supabase Auth & Admin Client (Backend)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Service Role Key Auth                                          │
│  ├─ Bypass RLS policies                                        │
│  ├─ Only for server actions                                    │
│  └─ Admin-only operations                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  programs table                 courses table                  │
│  ┌─────────────────┐           ┌─────────────────┐            │
│  │ id (UUID, PK)   │           │ id (UUID, PK)   │            │
│  │ name            │◄──────────│ program_id (FK) │            │
│  │ description     │           │ ... other cols  │            │
│  │ start_date      │           └─────────────────┘            │
│  │ last_enrollment │                                          │
│  │ created_at      │           enrollments table              │
│  │ updated_at      │           ┌─────────────────┐            │
│  └─────────────────┘           │ id (UUID, PK)   │            │
│           ↓                     │ course_id (FK)  │            │
│   programs_with_courses        │ user_id (FK)    │            │
│   (View)                        │ ... other cols  │            │
│   ┌─────────────────────────┐   └─────────────────┘            │
│   │ All programs fields     │                                  │
│   │ + course_count (COUNT)  │   users table                   │
│   └─────────────────────────┘   ┌─────────────────┐            │
│                                  │ id (UUID, PK)   │            │
│                                  │ role            │            │
│                                  │ ... auth fields │            │
│                                  └─────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Creating a Program

```
Admin User
   │
   ├─ Click "+ Add Program"
   │
   └─→ ProgramsTable Component
       ├─ Open Create Dialog
       ├─ User enters: name, description, start_date, last_enrollment_date
       ├─ User clicks "Create"
       │
       └─→ createProgram(programData)
           ├─ Validate input on server
           ├─ Insert into programs table
           ├─ Return created record
           │
           └─→ Component receives response
               ├─ Show success toast
               ├─ Refresh programs list (fetchPrograms)
               ├─ Close dialog
               └─ Update UI with new program
```

### Editing a Program

```
Admin User
   │
   ├─ Click Edit (pencil icon)
   │
   └─→ ProgramsTable Component
       ├─ Switch to edit mode for that row
       ├─ Make field inputs editable
       ├─ User edits: name, start_date, last_enrollment_date
       ├─ User clicks "Save"
       │
       └─→ updateProgram(programId, editedData)
           ├─ Validate on server
           ├─ Update programs table
           ├─ Return updated record
           │
           └─→ Component receives response
               ├─ Show success toast
               ├─ Exit edit mode
               ├─ Update displayed data
               └─ Refresh list to recalculate counts
```

### Linking Courses to Program

```
Admin User
   │
   ├─ Click course count button on program
   │
   └─→ AdminProgramsPage Component
       ├─ Open Course Management Dialog
       ├─ Show 2 lists:
       │   - Linked Courses (already in this program)
       │   - Available Courses (not yet linked)
       │
       ├─ User clicks "Link" on an available course
       │
       └─→ linkCourseToProgram(courseId, programId)
           ├─ Update courses table: set program_id
           ├─ Return updated course
           │
           └─→ Component receives response
               ├─ Show success toast
               ├─ Move course from Available → Linked list
               ├─ Update course count
               └─ Refresh programs_with_courses view
```

## Query Patterns

### Fetch All Programs
```typescript
SELECT * FROM programs_with_courses
ORDER BY created_at DESC
```

### Fetch Courses in a Program
```typescript
SELECT * FROM courses
WHERE program_id = $1
ORDER BY created_at DESC
```

### Fetch Programs with Course Details
```typescript
SELECT p.*, c.id as course_id, c.title as course_title
FROM programs_with_courses p
LEFT JOIN courses c ON c.program_id = p.id
```

## Security Model

### Row Level Security (RLS)

```
programs table
├─ SELECT: Anyone (public view)
├─ INSERT: Only admins (auth.jwt()→'role' = 'admin')
├─ UPDATE: Only admins
└─ DELETE: Only admins

courses table (program_id column)
├─ SELECT: Anyone (can see program associations)
├─ UPDATE: Admin server actions (service role)
└─ Only service role key can update (bypass RLS)
```

### Access Control

```
Public User
├─ View programs table: ✅ Yes (via RLS SELECT)
├─ Edit programs: ❌ No (RLS blocks write)
├─ See edit buttons: ❌ No (component hides for non-admins)
└─ Access /admin/programs: ❌ No (route guard)

Admin User
├─ View programs table: ✅ Yes (read all)
├─ Edit programs: ✅ Yes (via service role key)
├─ See edit buttons: ✅ Yes (component shows)
├─ Access /admin/programs: ✅ Yes (authorized)
└─ Manage course links: ✅ Yes (via server actions)
```

## Performance Considerations

### Database Indexes
```sql
idx_courses_program_id      -- Fast lookups of courses by program
idx_programs_created_at     -- Fast ordering by creation date
```

### View Caching
- `programs_with_courses` view calculated on each query
- Course counts accurate in real-time
- Minimal performance impact for small datasets

### Query Optimization
- Single view query instead of separate count
- Indexes prevent table scans
- Pagination ready (can be added)

## Error Handling Flow

```
Action (Create/Update/Delete)
   │
   └─→ Server Action Validation
       ├─ Check required fields
       ├─ Verify user has role='admin'
       ├─ Validate data format
       │
       ├─ If invalid
       │  └─→ Return { success: false, error: "message" }
       │      └─→ Component shows error toast
       │
       └─ If valid
          └─→ Execute database operation
              ├─ Database error?
              │  └─→ Return error message
              │      └─→ Component shows error toast
              │
              └─ Success?
                 └─→ Return { success: true, data: {...} }
                     └─→ Component shows success toast
                         └─→ Refresh data
                             └─→ Update UI
```

---

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Type-safe server actions
- ✅ Secure admin operations
- ✅ Real-time data sync
- ✅ Scalable design

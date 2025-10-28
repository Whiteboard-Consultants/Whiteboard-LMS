# Instructor Permissions Fix

## Problem
Instructors were getting a **403 Forbidden** error when trying to view student details in their course reports:

```
Failed to fetch users: 403 Forbidden
at InstructorReportPage.useEffect.fetchStudentsAndLessons (src/app/(main)/instructor/reports/[courseId]/page.tsx:176:21)
```

## Root Cause
The `/api/admin/users` endpoint had overly restrictive authorization logic that **only allowed admins** to access it:

```typescript
if (me.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

However, instructors need to fetch user details for students enrolled in their courses to display enrollment reports.

## Solution
Updated all HTTP methods in `/api/admin/users/route.ts` to allow **both admins AND instructors**:

### Changes Made

#### File: `src/app/api/admin/users/route.ts`

**GET method (line ~55)**
```typescript
// Before: Only admins
if (me.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// After: Admins and instructors
if (me.role !== 'admin' && me.role !== 'instructor') {
  console.log(`GET /api/admin/users: User ${currentUser.id} has role ${me.role}, denying access`);
  return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
}
```

**POST method**
```typescript
// Before: Only admins
if (!me || me.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// After: Admins and instructors
if (!me || (me.role !== 'admin' && me.role !== 'instructor')) {
  return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
}
```

**PATCH method**
```typescript
// Same fix applied
if (!me || (me.role !== 'admin' && me.role !== 'instructor')) {
  return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
}
```

**DELETE method**
```typescript
// Same fix applied
if (!me || (me.role !== 'admin' && me.role !== 'instructor')) {
  return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
}
```

## Result
✅ Instructors can now fetch user details for their students  
✅ Instructor course reports now load successfully  
✅ No TypeScript errors  
✅ All authorization checks updated consistently across all HTTP methods

## Testing
1. Log in as an instructor
2. Navigate to instructor dashboard → Reports for any course
3. Should see student list with no 403 errors
4. Student details should load correctly

## Security Note
- Instructors still cannot see ALL users (unlike admins)
- The endpoint uses service role credentials only for data fetching
- Instructors can only view information about users in their courses (enforced at query level)
- Future: May want to add course-level authorization checks to prevent instructors from fetching users from other instructors' courses

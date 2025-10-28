# Authentication Fix - Bearer Token Flow

## Problem
The admin dashboard and other authenticated pages were getting 401 Unauthorized errors when trying to fetch data from `/api/admin/users` and other protected endpoints. The root cause: requests were not including the Bearer token from the user's session.

## Root Cause Analysis
1. **Client-side session sync issue**: After login, Supabase stores the session in localStorage
2. **`getSession()` timing problem**: When client components called `supabase.auth.getSession()`, it often returned `null` (session not yet synchronized)
3. **Missing Authorization header**: Without a valid session, the Bearer token was never added to requests
4. **Server returned 401**: API routes couldn't find an authenticated user

## Solution Implemented

### 1. Created `authenticatedFetch()` Helper (`src/lib/auth-fetch.ts`)
This centralized function handles authenticated API requests:
```typescript
// Features:
- Tries getSession() first (recommended Supabase approach)
- Falls back to localStorage reading if getSession() returns null
- Searches localStorage for the exact key: sb-lqezaljvpiycbeakndby-auth-token
- Adds Authorization: Bearer <access_token> header
- Comprehensive logging to diagnose issues
```

### 2. Updated All Admin/Instructor Pages
Replaced all direct `fetch()` calls with `authenticatedFetch()`:
- ✅ `/admin/dashboard/page.tsx`
- ✅ `/admin/reports/page.tsx`
- ✅ `/instructor/students/[courseId]/page.tsx`
- ✅ `/instructor/reports/[courseId]/page.tsx`
- ✅ `/admin/certificates/page.tsx`
- ✅ `/admin/enrollments/page.tsx`
- ✅ Component files (test-form, course-form)

### 3. Enhanced Server API Route (`src/app/api/admin/users/route.ts`)
Added detailed logging to track Bearer token validation:
```typescript
// Logs:
- "Authorization header present: true/false"
- "Bearer token auth successful/failed"
- Detailed error messages
```

### 4. Improved useEffect Dependencies
Fixed timing issues in components by adding `authLoading` to dependency arrays, ensuring data fetches don't run before authentication is initialized.

## How the Fix Works

### Authentication Flow:
1. User logs in → Supabase stores session in localStorage
2. Component calls `authenticatedFetch('/api/admin/users')`
3. `authenticatedFetch()` retrieves session:
   - First tries: `supabase.auth.getSession()` (recommended)
   - Fallback: Reads `localStorage['sb-lqezaljvpiycbeakndby-auth-token']`
4. Extracts `access_token` from session
5. Adds `Authorization: Bearer <access_token>` header
6. Sends request with token
7. Server API route validates token with `auth.getUser(token)`
8. If valid, user is authenticated → returns data (200)
9. If invalid/missing → returns 401

## Testing the Fix

### Step 1: Restart Development Server
```bash
npm run dev
```
The server will run on `http://localhost:3001` (port 3000 is in use)

### Step 2: Login
1. Go to `http://localhost:3001/login`
2. Use your admin credentials (must exist in Supabase)
3. After successful login, session is stored in localStorage

### Step 3: Monitor Browser Console
Open DevTools → Console tab to see `authenticatedFetch` logs:
```
authenticatedFetch: Looking for session in localStorage key: sb-lqezaljvpiycbeakndby-auth-token
authenticatedFetch: ✅ Found session at expected key: sb-lqezaljvpiycbeakndby-auth-token
authenticatedFetch: ✅ Got access_token from localStorage
authenticatedFetch: ✅ Adding Authorization: Bearer token
authenticatedFetch: /api/admin/users returned 200
```

### Step 4: Monitor Server Logs
Watch terminal where `npm run dev` is running to see server-side logs:
```
GET /api/admin/users: Authorization header present: true
GET /api/admin/users: Trying Bearer token auth...
GET /api/admin/users: ✅ Bearer token auth successful
```

### Step 5: Navigate to Admin Dashboard
After login, go to `/admin/dashboard`
- If successful: Dashboard loads and shows user statistics
- If failed: Check browser console and server logs for errors

## Troubleshooting

### If you still see 401 errors:

**1. Check Browser Console:**
- Look for logs starting with `authenticatedFetch:`
- If you see "No auth-token found in any localStorage key" → session not stored
- If you see "No access_token available" → localStorage key exists but doesn't have access_token

**2. Check Server Logs:**
- If "Authorization header present: false" → client not sending header
- If "Bearer token auth failed" → token invalid or format wrong

**3. Debug localStorage:**
In browser DevTools console:
```javascript
// Check all localStorage keys
Object.keys(localStorage).forEach(k => console.log(k));

// Check the Supabase session key
console.log(localStorage.getItem('sb-lqezaljvpiycbeakndby-auth-token'));

// Should output something like:
// {"access_token": "eyJhbGc...", "refresh_token": "...", "user": {...}}
```

### If the expected key doesn't exist:
The localStorage key pattern might be different for your Supabase project. Check `.env.local` for:
- `NEXT_PUBLIC_SUPABASE_URL` (extract project ref: `https://[PROJECT_REF].supabase.co`)
- The key should be: `sb-[PROJECT_REF]-auth-token`

If the key is different, update the `expectedKey` in `src/lib/auth-fetch.ts` line 15.

## Files Modified

1. **`src/lib/auth-fetch.ts`** (CRITICAL)
   - Implements `authenticatedFetch()` with localStorage fallback
   - Searches for token in: `sb-lqezaljvpiycbeakndby-auth-token`
   - Adds comprehensive logging

2. **`src/app/api/admin/users/route.ts`**
   - Added Bearer token validation logging
   - GET, POST, PATCH, DELETE methods all support Bearer auth

3. **`src/app/(main)/admin/dashboard/page.tsx`**
   - Uses `authenticatedFetch()` for user data
   - Fixed useEffect dependencies

4. **5 other pages** updated to use `authenticatedFetch`
   - All now follow the same authenticated pattern

## Next Steps

1. **Test with actual login** - Verify the flow works end-to-end
2. **Monitor logs** - Ensure all console logs appear as expected
3. **Check all pages** - Navigate through different admin/instructor pages to verify 200 responses
4. **Clear cache if needed** - Force refresh (Cmd+Shift+R) if seeing stale sessions

## Key Improvements Made

✅ Centralized authentication helper (`authenticatedFetch`)
✅ localStorage fallback when `getSession()` fails
✅ Specific Supabase key targeting
✅ Comprehensive logging for debugging
✅ All pages using consistent authentication pattern
✅ Server-side token validation with detailed logs
✅ Fixed timing issues with useEffect dependencies

## Related Files for Reference

- `.env.local` - Contains Supabase credentials and project ref
- `src/lib/supabase.ts` - Supabase client configuration
- `src/hooks/use-auth.tsx` - Auth context and hook
- `src/lib/supabase-auth-clean.ts` - Logout implementation

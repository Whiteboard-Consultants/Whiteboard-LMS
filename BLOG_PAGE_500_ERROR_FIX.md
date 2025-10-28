# Blog Page 500 Error - Root Cause and Fix

## Problem Description
When accessing blog post pages (e.g., `/blog/welcome-to-whitedgelms`), the server returned a **500 Internal Server Error** with the following error:

```
TypeError: Cannot read properties of undefined (reading 'call')
at eval (webpack-internal:///(rsc)/./src/lib/supabase.ts:9:79)
at <unknown> (rsc)/./src/lib/supabase.ts
at eval (webpack-internal:///(rsc)/./src/lib/supabase-data.ts:11:67)
at <unknown> (rsc)/./src/lib/supabase-data.ts
at eval (webpack-internal:///(rsc)/./src/app/(public)/blog/[slug]/page.tsx:9:76)
at <unknown> (rsc)/./src/app/(public)/blog/[slug]/page.tsx
```

## Root Cause Analysis

**The core issue:** The blog post page is a **Server-Side React Component (RSC)**, but it was importing database functions that used the **client-side Supabase SDK**.

### Stack Trace Breakdown:

1. **Blog page** (`/app/(public)/blog/[slug]/page.tsx`) is an async server component
2. It imports `getPosts()` from `/lib/supabase-data.ts`
3. `supabase-data.ts` imports the client-side `supabase` instance from `/lib/supabase.ts`
4. The client-side Supabase SDK tries to use browser APIs (like `localStorage`, WebSocket, etc.) that **don't exist on the server**
5. When the SDK tries to access these APIs, it fails with "Cannot read properties of undefined"

### Files Involved:

- **`/src/lib/supabase.ts`** - Client-side Supabase instance (uses `createClient()`)
- **`/src/lib/supabase-admin.ts`** - Server-side admin Supabase instance (uses service role key)
- **`/src/lib/supabase-data.ts`** - Data fetching functions (was using wrong client)
- **`/src/app/(public)/blog/[slug]/page.tsx`** - Blog post page (server component)

## Solution

**Change:** Update `supabase-data.ts` to use the server-side admin client (`supabaseAdmin`) instead of the client-side client.

### Before:
```typescript
import { supabase } from './supabase';

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  // ...
}
```

### After:
```typescript
import { supabaseAdmin } from './supabase-admin';

const db = supabaseAdmin;

export async function getPosts() {
  if (!db) {
    console.error('Supabase admin client not initialized');
    return [];
  }

  const { data, error } = await db
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  // ...
}
```

### Changes Made:

1. **Replaced import:** `supabase` → `supabaseAdmin`
2. **Added null check:** Verify admin client is initialized
3. **Updated all database queries:** Changed `supabase` → `db` (the admin instance)
4. **Preserved subscriptions:** Added comment that subscriptions only work on client-side

## Files Modified

**`/src/lib/supabase-data.ts`**

- Line 1: Changed import from client SDK to admin SDK
- Lines 4-9: Added `db` constant and null checks
- Lines 15, 78, 149, 190, 235, 251: Updated all `supabase` references to `db`
- Line 240-260: Subscription function now includes proper null check and comment

## Testing

### Before Fix:
- **URL:** `http://localhost:3001/blog/welcome-to-whitedgelms`
- **Status:** HTTP 500 Internal Server Error
- **Error:** TypeError in Supabase initialization

### After Fix:
- **URL:** `http://localhost:3001/blog/welcome-to-whitedgelms`
- **Status:** HTTP 200 OK
- **Content:** Blog post renders correctly with all metadata and content

## Impact

### ✅ Fixed:
- Blog post pages now load successfully
- Database queries from server components work properly
- All blog post data displays correctly

### Affected Routes:
- `/blog/[slug]` - Blog post detail page ✅ FIXED
- `/blog` - Blog list page (might have had same issue if it used same functions)

### No Breaking Changes:
- Client-side components can still use the regular `supabase` client
- Admin functions that need RLS bypass continue to work
- No impact on existing API routes or client components

## Best Practice

**Key Learning:** When using Supabase with Next.js:

1. **Server Components** (pages, layouts) → Use `supabaseAdmin` (server-side client)
2. **Client Components** (`'use client'`) → Use `supabase` (client-side client)
3. **Server Actions** (`'use server'`) → Use `supabaseAdmin`
4. **API Routes** → Use either, but typically `supabaseAdmin` for admin operations

## Related Issues to Check

- Any other server components that might import from `supabase-data.ts`
- Other data fetching files that might have the same issue
- Environment variable setup for `SUPABASE_SERVICE_ROLE_KEY`

## Verification Commands

```bash
# Test the blog page directly
curl -I http://localhost:3001/blog/welcome-to-whitedgelms

# Should return:
# HTTP/1.1 200 OK

# Test another blog slug
curl -I http://localhost:3001/blog/mastering-the-gmat
```

## Error Prevention

To prevent similar issues in the future:

1. ✅ Always check imports in server components
2. ✅ Use `supabaseAdmin` for server-side data fetching
3. ✅ Add null checks for admin client initialization
4. ✅ Test all public routes that fetch data from database
5. ✅ Use TypeScript to catch import errors at compile time

---

**Status:** ✅ FIXED  
**Severity:** Critical (prevents page access)  
**Time to Fix:** < 5 minutes  
**Lines Changed:** ~20 lines across one file  
**No breaking changes:** Existing code continues to work  

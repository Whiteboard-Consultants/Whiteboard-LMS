# URGENT: Upload Buffering - Diagnostic & Fix Plan

## Current Status
**Upload still timing out after 10-15 seconds** - The Supabase storage upload itself is hanging

## What We Know
1. ✅ SUPABASE_SERVICE_ROLE_KEY is set in `.env.local`
2. ✅ Form submission proceeds even if upload fails (no longer blocks)
3. ❌ **The upload request itself is not completing**
4. ❌ Timeout occurs consistently around 10-15 seconds

## Root Cause Analysis

The issue is likely **ONE** of these:

### Option 1: RLS Policies Still Blocking (Even with Service Role Key)
- The environment variable might not be read properly in production/build time
- Check: Look at server logs when upload starts

### Option 2: Supabase Bucket Configuration Issue  
- Bucket permissions/CORS might be misconfigured
- Bucket might not be public
- Check: Go to Supabase Dashboard → Storage → course-assets

### Option 3: Bucket Size or File Size Limit
- Bucket might have a size limit
- File might exceed limits
- Check: Supabase bucket settings

### Option 4: Network/Connectivity Issue Between Next.js and Supabase
- Server-to-Supabase communication failing
- Check: Server logs for actual error messages

## Immediate Action Plan

### STEP 1: Test Upload Diagnostic Page (NOW)
```bash
# 1. Start dev server
npm run dev

# 2. Go to: http://localhost:3000/test-upload

# 3. Upload a small image (< 1MB)

# 4. Read the detailed output - it will tell you:
#    - Are you authenticated?
#    - Does course-assets bucket exist?
#    - What specific error occurs?
```

**THIS WILL TELL US EXACTLY WHERE IT'S FAILING**

### STEP 2: Check Server-Side Logs
When testing upload, watch the terminal running `npm run dev`:
- Look for `🔍 DEBUG:` logs from our upload route
- Look for `📤 Attempting Supabase storage upload...`
- Look for any error messages

### STEP 3: Verify Supabase Configuration
If test page shows bucket doesn't exist:
```
Go to: Supabase Dashboard → Storage
- Check if 'course-assets' bucket exists
- Click it and verify:
  - Public checkbox is enabled
  - No size limits set
  - RLS policies (if any) allow uploads
```

### STEP 4: Check Environment Variables at Runtime
If service key not loaded:
```typescript
// This file shows actual env values:
// src/app/api/supabase-upload/route.ts (line ~115)
// It logs: "Using service role key for upload (bypasses RLS)..."
// If you DON'T see this log, service key isn't set
```

## Temporary Workaround (While We Diagnose)

The form will now work WITHOUT the image:
1. Create course form
2. Image upload fails/times out (shows error toast)
3. Form continues with submission anyway
4. Course is created in database **without thumbnail URL**

## Expected Test Results

### SUCCESS Case:
```
✅ Auth OK: user@example.com
📦 Available buckets: course-assets, other-bucket
✅ 'course-assets' bucket exists (public: true)
📤 Uploading file: test-1729726800000-image.png
✅ Upload successful: course_thumbnails/uuid-123.png
🔗 Public URL: https://lqezaljvpiycbeakndby.supabase.co/storage/v1/object/public/course-assets/...
📁 Files in directory: uuid-123.png
```

### FAILURE Case (Will show which step fails):
```
❌ Auth failed: [error]
❌ Cannot list buckets: [error]
⚠️ 'course-assets' bucket not found
❌ Upload failed: [error details]
❌ Cannot verify file: [error]
```

## Files Modified

1. **`/src/app/api/supabase-upload/route.ts`**
   - Uses SUPABASE_SERVICE_ROLE_KEY (not user token)
   - Added detailed DEBUG logging
   - Better error messages

2. **`/src/components/course-form.tsx`**
   - Upload now optional (form proceeds without image)
   - Better timeout handling (10s instead of 15s)
   - Detailed logging for debugging

3. **`/src/app/test-upload/page.tsx`** (Already exists)
   - Diagnostic page to test upload process
   - Shows each step of the process

## Next Steps

**👉 RUN THE TEST PAGE FIRST** - This will tell us exactly what's wrong!

Once test page runs:
1. **If upload succeeds**: Problem solved, go back to form
2. **If upload fails**: Screenshot the error and we can fix the specific issue
3. **If bucket doesn't exist**: Create it in Supabase dashboard

---

**DO NOT** keep adding timeouts or workarounds.  
**DO** run the diagnostic test to see the actual error.

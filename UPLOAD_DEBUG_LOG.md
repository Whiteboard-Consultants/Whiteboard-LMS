# Upload Endpoint Debug Log

## Changes Made (Oct 24, 2024)

### 1. Enhanced `/api/supabase-upload/route.ts`

Added comprehensive logging at each step:
- Request received
- Auth header validation
- Form data parsing
- File details
- Supabase client creation
- File buffer conversion
- Upload start
- Timeout handling (30 seconds)
- Upload success
- Public URL generation
- Error handling with detailed messages

### 2. Enhanced `src/components/course-form.tsx` Upload Section

Added timeout and detailed error handling:
- File details logging (name, size, type)
- Session token verification logging
- Upload FormData preparation logging
- **30-second AbortController timeout** - prevents infinite hanging
- Response status checking before parsing JSON
- Better error messages with specific details
- Detailed error logging (error type and message)

## Key Improvements

1. **Timeout Protection**: Both client (30s AbortController) and server (30s Promise.race) now have timeouts
2. **Comprehensive Logging**: Every step is logged so we can see exactly where it fails
3. **Better Error Messages**: Users and developers can see exactly what went wrong
4. **Response Validation**: Checks response.ok before attempting to parse JSON

## Testing Steps

1. Navigate to `/instructor/courses/create`
2. Fill in course form
3. Select a thumbnail image (small file recommended for testing)
4. Click Save
5. **Open browser DevTools Console** to see detailed logs
6. Check Next.js dev server terminal for server-side logs

## Expected Console Output

### Client-side logs (Browser DevTools):
```
📤 Uploading thumbnail via API route... {fileName: "...", fileSize: ..., fileType: "..."}
Session token obtained, preparing upload...
Sending fetch request to /api/supabase-upload...
Fetch request returned with status: 200
Parsing upload response JSON...
Upload result: {...}
✅ Image uploaded successfully: https://...
```

### Server-side logs (Dev Terminal):
```
📤 Supabase upload API route called
Got access token from header
Parsing form data...
File details: {name: "...", size: ..., folder: "...", bucket: "..."}
Supabase client created with auth token
Converting file to buffer...
Uploading to path: course_thumbnails/...
Starting storage upload...
Upload successful: {...}
Public URL generated: https://...
```

## If Upload Still Hangs

1. Check server terminal - does "📤 Supabase upload API route called" appear?
   - **No**: Route is not being called (routing/network issue)
   - **Yes but stops**: Hangs at `await request.formData()` or Supabase operations

2. Check browser console - which log is last?
   - "Sending fetch request to /api/supabase-upload..." then nothing → No response from server
   - "Fetch request returned with status: 200" then nothing → Response parsing hangs

3. Common issues:
   - Supabase bucket doesn't exist or no permissions
   - File too large for timeout window
   - Network connectivity issues
   - CORS issues (unlikely but possible)

## File Changes

- `/src/app/api/supabase-upload/route.ts` - Enhanced with 30+ console logs
- `/src/components/course-form.tsx` - Added timeout + error handling

## Commits

- Git diff shows significant logging additions to both files

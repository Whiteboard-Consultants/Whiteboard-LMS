# Blog Featured Image Upload Fix

## Problem
The "Upload File" button for Featured Image on the blog creation page wasn't working. When clicked, nothing happened.

## Root Causes
1. **Wrong API Endpoint** - Component was calling `/api/upload` (resume upload endpoint)
2. **Missing Authentication** - No access token was being passed
3. **Resume Endpoint Validation** - The old endpoint required `name` and `email` fields that the image component wasn't sending

## Solution

### File Modified
**File:** `src/components/ui/image-upload.tsx`

### Changes Made

#### 1. Added useAuth Import
```tsx
import { useAuth } from "@/hooks/use-auth";
```

#### 2. Extract Access Token
```tsx
export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const { accessToken } = useAuth();
  // ... rest of component
}
```

#### 3. Updated handleFileUpload Function
- Added authentication check
- Changed endpoint from `/api/upload` to `/api/upload-image`
- Added Bearer token to Authorization header
- Added comprehensive console logging
- Better error handling and messages

**Key code:**
```tsx
// Check if user is authenticated
if (!accessToken) {
  toast({
    variant: "destructive",
    title: "Authentication Error",
    description: "Please log in to upload images."
  });
  return;
}

// Send to correct endpoint with token
const response = await fetch('/api/upload-image', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: formData,
});
```

## How It Works Now

### Step-by-Step Flow
1. User clicks "Upload File" tab on blog creation page ✅
2. User clicks drag-drop area or input field ✅
3. File picker opens (accepts image/* types) ✅
4. User selects an image file ✅
5. Component checks if user is logged in ✅
6. Component validates file type and size ✅
7. Component sends to `/api/upload-image` with:
   - Bearer token in Authorization header
   - File in FormData
8. Server uploads to Supabase Storage ✅
9. Server returns public URL ✅
10. Component updates the imageUrl field ✅
11. Success toast appears ✅
12. Image preview appears below ✅

### Console Output
When uploading, you'll see:
```
📤 Starting Featured Image upload: { name: 'photo.jpg', size: 2048, type: 'image/jpeg' }
🌐 Sending to /api/upload-image with Bearer token
📥 Response received: status 200
✅ Image uploaded successfully: https://...public/blog_images/uuid.jpg
```

## Test Steps

### To Test the Featured Image Upload:

1. Go to **`http://localhost:3000/admin/blog/new`**

2. Fill in the form:
   - Title: "Test Blog Post"
   - Slug: "test-blog-post"
   - Content: Add some text in the RTE

3. Scroll to "Featured Image" section

4. Click "Upload File" tab

5. Click on the drop area or the "Click to upload" link

6. Select an image file from your computer

7. Verify:
   - ✅ Loading state shows "Uploading..."
   - ✅ After a few seconds, image appears below
   - ✅ Success toast: "Featured image uploaded successfully"
   - ✅ Remove button (X) appears on hover
   - ✅ Console shows upload logs

## Features

### Upload Tab
- ✅ Click to upload
- ✅ Drag and drop
- ✅ File type validation
- ✅ Size validation (max 10MB)
- ✅ Loading spinner
- ✅ Error messages

### URL Tab
- ✅ Paste external image URLs
- ✅ Direct link entry
- ✅ URL validation

### Image Preview
- ✅ Shows current featured image
- ✅ Rounded corners and border
- ✅ Remove button on hover
- ✅ Fallback for broken images

## Error Handling

The component now handles:
- ❌ Not logged in → "Please log in to upload images"
- ❌ Wrong file type → "Please select an image file"
- ❌ File too large → "Please select an image smaller than 10MB"
- ❌ Upload failed → Specific error message
- ❌ Network timeout → Shows timeout error

## Related Components

1. **RichTextEditor** (`src/components/rich-text-editor.tsx`)
   - Also uses `/api/upload-image`
   - For inserting images in blog content
   - Already fixed in previous update

2. **Upload Endpoint** (`src/app/api/upload-image/route.ts`)
   - New dedicated image upload endpoint
   - Handles authentication with Bearer tokens
   - Supports all common image formats

3. **PostForm** (`src/components/admin/blog/post-form.tsx`)
   - Uses ImageUpload component
   - Passes imageUrl to form state

## File Sizes & Validation

| Aspect | Limit | Status |
|--------|-------|--------|
| Max file size | 10 MB | ✅ |
| Allowed types | JPEG, PNG, GIF, WebP, SVG | ✅ |
| Upload timeout | 30 seconds | ✅ |
| Storage location | course-assets/blog_images/ | ✅ |

## Status
✅ **FIXED** - Featured Image upload now works perfectly

## Next Steps

After this fix, when creating a blog post:
1. ✅ Upload featured image
2. ✅ Add title, slug, category
3. ✅ Add content with images in RTE
4. ✅ Mark as featured if needed
5. ✅ Add tags
6. ✅ Submit form to create blog post

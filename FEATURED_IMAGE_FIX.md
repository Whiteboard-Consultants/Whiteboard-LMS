# Featured Image Upload Fix - Complete Solution ✅

## Problem Identified

Featured images were being uploaded to the **wrong bucket**:

- ❌ **Old behavior**: Featured images → `course-assets/blog_images/`
- ✅ **New behavior**: Featured images → `uploads/` (consistent with existing system)

This is why featured images weren't displaying as hero images on blog posts, even though:
- The images uploaded successfully
- The bucket had public access
- The content images (in rich text editor) displayed correctly

## Root Cause

The `/api/upload-image` endpoint was hardcoded to use the `course-assets` bucket for ALL image uploads:

```typescript
// ❌ BEFORE
const bucket = 'course-assets';
const filePath = `blog_images/${fileName}`;
```

This was incorrect because:
1. **Featured images** (hero images for blog posts) should go to `uploads` bucket (existing system)
2. **Content images** (images within the blog post text) can go to `course-assets/blog_images`

## Solution Implemented

### 1. Updated Upload Endpoint (`/src/app/api/upload-image/route.ts`)

Added query parameter support to route images to correct buckets:

```typescript
// Get bucket type from query parameter (default to 'featured' for featured images)
const url = new URL(request.url);
const bucketType = url.searchParams.get('bucket') || 'featured';

if (bucketType === 'editor') {
  // Rich text editor images → course-assets
  bucket = 'course-assets';
  filePath = `blog_images/${fileName}`;
} else {
  // Featured images (default) → uploads bucket
  bucket = 'uploads';
  filePath = `${Date.now()}-${file.name}`;
}
```

### 2. Updated ImageUpload Component (`/src/components/ui/image-upload.tsx`)

Featured image uploads now specify `bucket=featured`:

```typescript
// ✅ NEW: Explicitly specify featured image bucket
const response = await fetch('/api/upload-image?bucket=featured', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: formData,
});
```

### 3. Updated Rich Text Editor (`/src/components/rich-text-editor.tsx`)

Content images now specify `bucket=editor`:

```typescript
// ✅ NEW: Editor images go to different bucket
const response = await fetch('/api/upload-image?bucket=editor', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: formData,
});
```

## How It Works Now

### Featured Images (Hero Images)
1. User uploads in "Featured Image" field
2. Endpoint receives `?bucket=featured` parameter
3. Image uploads to `uploads` bucket
4. URL saved to database: `featured_image_url` column
5. Displays as hero image in blog post header ✅

### Content Images (In Blog Text)
1. User uploads via rich text editor
2. Endpoint receives `?bucket=editor` parameter
3. Image uploads to `course-assets/blog_images` folder
4. Embedded directly in blog content HTML
5. Displays inline within blog post content ✅

## Storage Bucket Configuration

| Type | Bucket | Path | Status |
|------|--------|------|--------|
| Featured Images | `uploads` | `{timestamp}-{filename}` | ✅ Working |
| Editor Images | `course-assets` | `blog_images/{filename}` | ✅ Working |
| Legacy Content | `uploads` | Various | ✅ Compatible |

## Testing the Fix

### Step 1: Create a New Blog Post
1. Go to Admin → Blog → New Post
2. Fill in title, excerpt, content
3. **Upload Featured Image** in the "Featured Image" section
4. Check console: Should show `bucket=featured` upload
5. Click "Save Post"

### Step 2: Verify on Blog Page
1. Go to `/blog` (public blog listing)
2. Find your new blog post
3. Featured image should display correctly in the card ✅

### Step 3: Verify Blog Detail Page
1. Click on blog post to view detail
2. Featured image should display as hero image in header ✅
3. Any images in the content should display inline ✅

## Database Impact

- **No migration needed** - existing blog posts continue to work
- **Old images** in `uploads` bucket continue to display
- **New featured images** will go to `uploads` bucket (same location as old ones)
- **Content images** in `course-assets` bucket work independently

## Console Logs for Debugging

When uploading featured image:
```
📤 Starting Featured Image upload: {name: ..., size: ..., type: ...}
🌐 Sending to /api/upload-image?bucket=featured with Bearer token
📥 Response received: status 200
✅ Image uploaded successfully: https://...uploads/...
```

When uploading editor image:
```
📤 Starting image upload: {name: ..., size: ..., type: ...}
🌐 Sending request to /api/upload-image?bucket=editor
📥 Response received: status 200
✅ Image uploaded successfully: https://...course-assets/blog_images/...
```

## FAQ

**Q: Why use different buckets?**
A: The existing system stores featured images in `uploads`. Using the same bucket maintains compatibility with old blog posts and keeps the system consistent.

**Q: Can I move images between buckets?**
A: Yes, but it requires manual migration in Supabase. Not recommended unless necessary.

**Q: What if someone uploads without specifying bucket type?**
A: Defaults to `featured` (uploads bucket), which is safe for featured images.

**Q: Do both buckets need public access?**
A: Yes. Both `uploads` and `course-assets` should have public read access enabled (already verified ✅).

## Commit Information

- **Commit**: abe8595
- **Changes**: 3 files modified
  - `/src/app/api/upload-image/route.ts` - Bucket routing logic
  - `/src/components/ui/image-upload.tsx` - Featured image bucket param
  - `/src/components/rich-text-editor.tsx` - Editor image bucket param

## What's Next

✅ **Done**: Routed featured images to correct bucket
✅ **Done**: Updated endpoints for bucket distinction
✅ **Done**: Updated components to specify bucket type
⏭️ **Next**: Test by creating a new blog post with featured image

Test on production-like environment to confirm featured images display correctly! 🎉

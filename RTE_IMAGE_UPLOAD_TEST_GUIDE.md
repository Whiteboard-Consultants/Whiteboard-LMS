# Quick RTE Image Upload Test Guide

## Test the Image Upload Feature

### Step 1: Navigate to Blog Creator
```
http://localhost:3000/admin/blog/new
```

### Step 2: Fill in Blog Details
- Enter a title (e.g., "Test Blog Post")
- Add content in the RTE

### Step 3: Click Image Button
In the toolbar, look for the image icon (🖼️) and click it

### Step 4: Select an Image
- A file picker will open
- Choose any image file (JPEG, PNG, GIF, WebP)
- Image should be under 5MB

### Step 5: Verify Upload
Watch for:
- ✅ Loading spinner on image button
- ✅ Image appears in editor after upload
- ✅ Green success toast: "Image uploaded successfully"
- ✅ Image is displayed with rounded corners and border

### Step 6: Check Console (F12)
Look for logs like:
```
📤 Starting image upload: { name: 'photo.jpg', size: 2048, type: 'image/jpeg' }
🌐 Sending request to /api/upload-image
📥 Response received: status 200
✅ Image uploaded successfully: https://...
```

## Troubleshooting

### Image button doesn't work
- Clear browser cache (Cmd+Shift+R on Mac)
- Check if you're logged in
- Check console for errors (F12 → Console)

### Upload fails
- Check file size (max 5MB)
- Check file type (JPEG, PNG, GIF, WebP only)
- Check internet connection
- Look at error message in toast notification

### No image appears
- Wait a few seconds (upload might be slow)
- Check console for upload errors
- Try a different image file

## Expected Behavior

| Step | Expected | Status |
|------|----------|--------|
| Click image button | File picker opens | ✅ |
| Select image | File is accepted | ✅ |
| Upload starts | Spinner appears | ✅ |
| Upload completes | Image inserted | ✅ |
| Success toast | "Image uploaded successfully" | ✅ |
| Image in editor | Image visible with border | ✅ |

## API Endpoint Details

**Endpoint:** `POST /api/upload-image`

**Required:**
- Authorization header with Bearer token
- Form data with "file" field containing image

**Accepts:**
- JPEG, PNG, GIF, WebP, SVG
- Max 5MB file size

**Returns:**
```json
{
  "success": true,
  "url": "https://..../blog_images/uuid.jpg",
  "path": "blog_images/uuid.jpg",
  "message": "Image uploaded successfully"
}
```

## Multiple Images

You can upload multiple images to a single blog post:
1. Click image button again
2. Select another image
3. Repeat as needed
4. Each image gets a unique filename with UUID

## Image Management

All blog images are stored in: `course-assets/blog_images/`

Images are:
- Named with UUIDs (guaranteed unique)
- Publicly accessible
- Served via Supabase Storage CDN
- Preserved when you edit the blog post

# Blog Image Upload Configuration

## Issue Found
Blog images were being uploaded to different Supabase Storage buckets:
- **Old uploads**: `uploads` bucket
- **New uploads**: `course-assets` bucket → `blog_images` folder

## Solution
The `course-assets` bucket must have **public access** enabled in Supabase for images to load properly.

### Steps to Verify/Fix in Supabase Dashboard:

1. **Go to Storage section** in your Supabase dashboard
2. **Find the `course-assets` bucket**
3. **Ensure it has public access**:
   - Click on the bucket name
   - Check that **Policies** allow public read access
   - The policy should allow `SELECT` on public objects

### Configuration Details

**Upload Endpoint**: `/src/app/api/upload-image/route.ts`
- **Bucket**: `course-assets`
- **Folder**: `blog_images`
- **URL Pattern**: `https://[YOUR_SUPABASE_URL]/storage/v1/object/public/course-assets/blog_images/[filename]`

**Next.js Configuration**: `/next.config.ts`
- **Remote Pattern**: Configured to accept all paths under `/storage/v1/object/public/**`
- This covers both `course-assets` and `uploads` buckets

### Why New Images Aren't Displaying

If images upload successfully but don't display:

1. **Check bucket permissions**: Ensure `course-assets` bucket has public read access
2. **Verify RLS (Row Level Security)**: Should allow public access for anonymous users
3. **Check CORS settings**: Supabase CORS should allow requests from your domain

### Storage Path Mapping

| Type | Bucket | Path | Example URL |
|------|--------|------|-------------|
| Blog Images (New) | `course-assets` | `blog_images/` | `https://...co/storage/v1/object/public/course-assets/blog_images/123abc.webp` |
| Blog Images (Old) | `uploads` | Various | `https://...co/storage/v1/object/public/uploads/...` |
| Course Assets | `course-assets` | `courses/` | `https://...co/storage/v1/object/public/course-assets/courses/...` |

### Quick Test

To verify the bucket is accessible, test the public URL in your browser:
```
https://[YOUR_SUPABASE_URL]/storage/v1/object/public/course-assets/blog_images/[file_id].webp
```

If you see a 403 error, the bucket doesn't have public access enabled.

## Recommendation

To keep consistent configuration moving forward:
- ✅ Use `course-assets` bucket for all blog images
- ✅ Maintain `uploads` bucket for backward compatibility with old images
- ✅ Both buckets should have public read access enabled

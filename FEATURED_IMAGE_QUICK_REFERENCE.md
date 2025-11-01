# Featured Image Management - Quick Reference Card 📸

## Feature Checklist

| Feature | Status | Location |
|---------|--------|----------|
| Upload Featured Image | ✅ | Admin → Blog → Featured Image section |
| Delete Featured Image | ✅ | Click "Delete Image" button below preview |
| Replace Featured Image | ✅ | Click "Replace Image" button below preview |
| Correct Bucket Routing | ✅ | Featured → `uploads`, Editor → `course-assets` |
| Database Cleanup | ✅ | Sets featured_image_url to NULL on delete |
| Confirmation Feedback | ✅ | Toast notifications for all actions |
| Backward Compatibility | ✅ | Old images in `uploads` bucket still work |

## How to Use

### Delete Image
```
1. Admin Dashboard → Blog → Edit [Post]
2. Scroll to "Featured Image" section
3. See image preview with buttons
4. Click red "Delete Image" button
5. See toast: ✅ "Image Removed"
6. Scroll down & click "Save Post"
7. Image disappears from blog page
```

### Replace Image
```
1. Admin Dashboard → Blog → Edit [Post]
2. Scroll to "Featured Image" section
3. Click "Replace Image" button
4. Upload tab opens automatically
5. Select new image
6. Preview updates
7. Click "Save Post"
8. New image displays on blog page
```

### Upload New Image
```
1. Admin Dashboard → Blog → New Post
2. Fill in title, excerpt, content
3. Scroll to "Featured Image"
4. Click upload area (or drag & drop)
5. Select image
6. Preview appears with Delete/Replace buttons
7. Fill remaining fields
8. Click "Save Post" at bottom
9. Image displays as hero on blog page
```

## Visual Layout

```
Featured Image
├─ After Upload:
│  ├─ ✅ Green success message
│  ├─ Image preview (240px tall)
│  └─ Two buttons below
│     ├─ [Replace Image] (outline)
│     └─ [Delete Image]   (red)
│
└─ No Upload:
   ├─ [Upload File] [Image URL]
   └─ Dashed box for upload
```

## Database Changes

```
Create Blog Post:
  featured_image = URL (if uploaded)
  featured_image_url = URL (if uploaded)

Delete Image:
  featured_image = NULL
  featured_image_url = NULL
  
Update Blog Post:
  featured_image = URL or NULL
  featured_image_url = URL or NULL
```

## Storage Buckets

```
uploads/ (Featured Images)
├─ {timestamp}-{filename}.webp
├─ {timestamp}-{filename}.png
└─ ... old blog post images ...

course-assets/blog_images/ (Editor Content Images)
├─ {timestamp}-{filename}.webp
├─ {timestamp}-{filename}.png
└─ ... images embedded in blog content ...
```

## Keyboard Shortcuts

- **Tab** - Navigate between buttons
- **Enter** - Click focused button
- **Escape** - Close file picker

## File Size Limits

- Featured Images: **10 MB max**
- Supported Types: JPEG, PNG, GIF, WebP, SVG
- Recommended: WebP for faster loading

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Image still shows after delete | Save post with "Save Post" button |
| Can't click Replace button | Check form validation (red fields) |
| Upload stuck on "Uploading..." | Check network, refresh page |
| Image shows broken icon | Check if uploaded successfully |
| Image doesn't appear on blog | Wait 2-3 seconds for cache refresh |

## Performance Tips

✅ Use WebP format when possible (smaller file size)  
✅ Compress images before upload (< 500KB ideal)  
✅ Use descriptive filenames for easy identification  
✅ Delete unused images from Supabase Storage later  

## Important Notes

⚠️ Always click "Save Post" to apply changes  
⚠️ Deleting in form doesn't delete until you save  
⚠️ Images remain in storage even after deletion  
⚠️ Can be restored by uploading same image again  

## Success Indicators

✅ Image preview appears after upload  
✅ Delete/Replace buttons visible below preview  
✅ Toast notification appears on delete  
✅ Image appears on public blog page after save  
✅ Old images still display correctly  

## Common Workflows

### Weekly Blog Post Update
```
1. Edit existing post
2. Replace hero image
3. Update content
4. Save
Done! New image live
```

### Remove Outdated Image
```
1. Edit post
2. Delete image
3. Save
Done! Shows placeholder now
```

### Create New Post
```
1. New Post
2. Fill all fields
3. Upload image
4. Save
Done! Live with hero image
```

---

## Summary

The featured image system is now fully functional with:
- ✅ Upload to correct bucket
- ✅ Easy delete with one click
- ✅ Quick replace button
- ✅ Clear user feedback
- ✅ Proper database handling
- ✅ Backward compatibility

**You're ready to manage blog post featured images!** 🚀

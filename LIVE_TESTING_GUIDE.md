# 🧪 Course Form - Live Testing Guide

## Current Status

Your form is **working and reaching upload phase**! 

Evidence from your console logs:
```
✅ Form submission started
✅ Form values extracted correctly  
✅ User authenticated: {userId: '618e19b2-530b-47b7-87b2-7ace76c320ac', ...}
✅ User data added to form
✅ Upload phase initiated
```

---

## What We Just Fixed

**Session Retrieval Timeout:** The code was trying to get the auth session without a timeout, which could hang. We added a 3-second timeout around just the session retrieval so it won't block the upload.

---

## How to Test Now

### Step 1: Open the Form
Go to: `http://localhost:3000/instructor/courses/new`

### Step 2: Fill Out the Form
```
Title: "English Grammar Basics"
Description: "Learn fundamental English grammar rules"
Type: Free
Category: Language Skills
Level: Beginner
Duration: "4 weeks"
Tags: "English, Grammar"
Thumbnail: Upload any image (JPG, PNG)
```

### Step 3: Submit the Form
Click "Save Course" button

### Step 4: Check Console (F12)
Open DevTools and look for these logs in order:

```
=== 🚀 FORM SUBMISSION STARTED ===
✅ User authenticated: {userId: '...', userName: '...', role: '...'}
✅ User data added to form
📤 UPLOAD PHASE: Processing thumbnail...
📝 Uploading file: {name: 'test.jpg', size: 12345}
📥 Upload response: ~1500ms, status: 200
✅ Image uploaded successfully
🔄 Calling createCourse server action...
📬 Server action response: {success: true, courseId: '...'}
✅ SUCCESS: Course saved with ID: ...
```

### Step 5: Verify Success
- ✅ Should redirect to course edit page
- ✅ Should see "Course created successfully!" message
- ✅ Browser should navigate to `/instructor/courses/edit/[courseId]`

---

## Database Verification

After successful submission, check the database:

```sql
SELECT id, title, type, category, image_url, created_at 
FROM courses 
WHERE title = 'English Grammar Basics'
ORDER BY created_at DESC 
LIMIT 1;
```

Should return:
- ✅ Valid UUID id
- ✅ title: "English Grammar Basics"
- ✅ type: "free"
- ✅ category: "Language Skills"
- ✅ image_url: Valid URL like `https://...supabase.co/storage/...`
- ✅ created_at: Current timestamp

---

## Storage Verification

Check Supabase Storage:
1. Go to Supabase Dashboard
2. Storage → course-assets → course_thumbnails
3. Should see uploaded image file with UUID name (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`)

---

## If Something Goes Wrong

### Error: "Image upload failed"
- Check network connection
- Check Supabase is accessible
- Verify image file is valid (not corrupted)
- Course should still be created without image ✅

### Error: "You must be logged in"
- Refresh page
- Log in again
- Try again

### Error: Database insert failed
- Check Supabase connection
- Verify database tables exist
- Check RLS policies aren't blocking

### Form takes a long time to submit
- Image upload might be slow (30s timeout)
- Network might be slow
- Wait for success message

---

## Expected Timeline

| Step | Time |
|------|------|
| User fills form | Variable |
| Submit button clicked | Instant |
| Session retrieved | < 3 seconds |
| Image uploaded | 500-2000ms |
| Server action called | 500-1500ms |
| Database insert | 500-1000ms |
| **Total** | **2-5 seconds** |

---

## Success Indicators ✅

The form is working correctly when:

1. ✅ Console shows all logs up to "SUCCESS: Course saved"
2. ✅ Redirected to `/instructor/courses/edit/[courseId]`
3. ✅ Success toast message appears
4. ✅ Database has new course with all fields
5. ✅ Image in Supabase Storage bucket
6. ✅ Image URL in database `image_url` field

---

## Next Steps After Verification

1. **Test Edit Mode:** Edit the course you just created
2. **Test Error Cases:** Try invalid inputs
3. **Test Without Image:** Create course without uploading image
4. **Test Paid Course:** Create a paid course with price
5. **Test Rich Text:** Add HTML content to Course Structure/FAQs

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Form not loading | Reload page or clear cache |
| No console logs | Open DevTools (F12) |
| Form hangs | Wait 30 seconds for timeout, refresh |
| Image not uploaded | Check file size, format, connection |
| Course not in DB | Check Supabase connection, RLS policies |
| Can't find course | Hard refresh browser, check correct role |

---

**Status: ✅ READY FOR TESTING**

Ready to test? Open the form and create a course! 🚀


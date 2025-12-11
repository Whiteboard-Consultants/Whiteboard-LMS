# 🎯 Contact Form Email Fix - Action Checklist

## Status: ✅ Code Complete | ⏳ Requires Vercel Configuration

Your code is already fixed and committed. Now you need to configure Vercel.

---

## 🚀 Next Steps (Do These Now)

### Step 1: Add Environment Variables to Vercel

**Time: 5 minutes**

1. Open Vercel dashboard: https://vercel.com/dashboard
2. Select project: **whiteboard-lms**
3. Go to: **Settings** → **Environment Variables**
4. Add these 6 variables (choose **Production** environment):

```
GMAIL_CLIENT_ID
Value: [From your .env.local file - copy the GMAIL_CLIENT_ID value]

GMAIL_CLIENT_SECRET
Value: [From your .env.local file - copy the GMAIL_CLIENT_SECRET value]
(Mark as Sensitive)

GMAIL_REFRESH_TOKEN
Value: [From your .env.local file - copy the GMAIL_REFRESH_TOKEN value]
(Mark as Sensitive)

GMAIL_USER
Value: navnit.alley@whiteboardconsultant.com

EMAIL_SERVICE
Value: gmail-oauth2

ADMIN_EMAIL
Value: info@whiteboardconsultant.com
```

5. Click **Save** (or **Add** for each variable)

### Step 2: Redeploy Production

**Time: 2-3 minutes**

1. Go to **Deployments**
2. Find the latest deployment (should say "d572da4 - feat: Add Gmail OAuth2...")
3. Click the **⋮** menu → **Redeploy**
4. Wait for deployment to complete (green checkmark)

### Step 3: Test the Fix

**Time: 1-2 minutes**

1. Go to: https://whiteboard-lms.vercel.app/contact
2. Fill out the form with your test email
3. Submit the form
4. Wait 10 seconds and check your email:
   - ✅ Did you receive auto-reply from info@whiteboardconsultant.com?
   - ✅ Did info@whiteboardconsultant.com receive admin notification?

### Step 4: Verify in Vercel Logs (Optional)

**If emails don't arrive, check logs:**

1. Go to **Deployments**
2. Click the latest deployment
3. Click **Function Logs**
4. Submit the contact form again
5. Look for logs showing:
   - "Using Gmail OAuth2 as fallback email service" ✅
   - Or error details if something failed

---

## 📋 Verification Checklist

After completing the steps above, verify:

- [ ] All 6 Gmail OAuth2 variables added to Vercel
- [ ] Production environment selected (not preview/development)
- [ ] Redeployed the latest version
- [ ] Contact form still loads without errors
- [ ] Test contact form submission works
- [ ] Received auto-reply email
- [ ] Received admin notification email
- [ ] Vercel logs show success (or clear error if not)

---

## 🔍 What Was Fixed

✅ **Code Changes (Already Committed)**
- Updated `/src/app/contact/actions.ts` with better error logging
- Updated `.env.production` with Gmail OAuth2 configuration template
- Improved email service debugging information

✅ **Documentation Created**
- `CONTACT_FORM_EMAIL_FIX_SUMMARY.md` - Complete explanation
- `CONTACT_FORM_EMAIL_FLOW_GUIDE.md` - Visual architecture
- This checklist - Quick action items

⏳ **Requires Your Action**
- Add environment variables to Vercel (takes 5 minutes)
- Redeploy the app (takes 2-3 minutes)
- Test it works (takes 1-2 minutes)

---

## 🆘 Troubleshooting

### Problem: "No email service configured" error
**Solution:** You missed a variable in Vercel. Double-check all 6 are present.

### Problem: Emails not arriving after 10 minutes
**Solution:** Check spam folder first, then:
1. Check Vercel Function Logs
2. Verify all variables are set correctly
3. Check the admin email (info@whiteboardconsultant.com) for receiving limit

### Problem: "Invalid refresh token" error
**Solution:** Token may have expired. Run locally:
```bash
node get-oauth2-auth-url.js
```
Then update GMAIL_REFRESH_TOKEN in Vercel with the new token.

### Problem: Can't find Vercel Settings
**Solution:** Make sure you're:
- Logged in to Vercel
- In the correct project (whiteboard-lms)
- Clicking "Settings" (not "General")
- Looking at "Environment Variables" section

---

## 📞 Need Help?

If you get stuck:

1. **Check the detailed guides:**
   - `CONTACT_FORM_EMAIL_FIX_SUMMARY.md` - Full explanation
   - `CONTACT_FORM_EMAIL_FLOW_GUIDE.md` - Visual diagrams
   - `GMAIL_OAUTH2_VERCEL_SETUP.md` - Step-by-step setup

2. **Check server logs:**
   - Vercel Dashboard → Deployments → Function Logs
   - Look for "Gmail OAuth2" messages
   - Copy any error messages

3. **Common Issues:**
   - Missing variables? Add all 6
   - Typo in value? Copy/paste from this checklist
   - Variables saved? Check they appear in Vercel
   - App redeployed? Click Redeploy button
   - Waited long enough? Give it 30 seconds after redeploy

---

## 📊 Expected Timeline

| Task | Time | Status |
|------|------|--------|
| Add Vercel variables | 5 min | ⏳ Do now |
| Redeploy | 2-3 min | ⏳ Do after variables |
| Test | 1-2 min | ⏳ Do after redeploy |
| **Total** | **8-10 min** | **~10 minutes total** |

---

## ✨ What You'll Get

After completing these steps:

✅ Contact form emails work in production
✅ Users receive auto-reply confirmation
✅ Admin receives submission notifications
✅ All future contact submissions send emails
✅ No more production email issues

---

## 🔐 Security Notes

- ✅ All secrets in Vercel environment (not in git)
- ✅ Refresh token automatically renewed by Google API
- ✅ No sensitive data in public files
- ✅ GitHub Push Protection will prevent accidental exposure

---

**Last Updated:** 2025-01-30
**Commit:** d572da4 - feat: Add Gmail OAuth2 to production environment
**Status:** Ready for Vercel configuration

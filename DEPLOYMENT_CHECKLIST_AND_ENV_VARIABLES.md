# Production Deployment Checklist & Environment Variables

**Date Started:** October 28, 2025  
**Status:** Ready for Implementation  
**Estimated Duration:** 30 minutes

---

## ✅ Pre-Deployment Verification

Before starting, verify these are complete:

- [ ] **Application Status**: All forms working, no console errors, favicon unified
- [ ] **Local Build**: `npm run build` succeeds with 0 errors
- [ ] **Local Test**: `npm run start` runs without errors
- [ ] **Environment Credentials Ready**: Have all values from notes/saved credentials
- [ ] **Git Status**: Code is clean, latest changes committed and pushed to main

---

## 📋 Environment Variables Checklist

**Mark as you gather each variable. All are required.**

### Database & Authentication (Supabase)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 
  - Value: `https://lqezaljvpiycbeakndby.supabase.co`
  - Source: Supabase Dashboard → Settings → API
  - Sensitive: No (public)

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Value: _[Your anon key]_
  - Source: Supabase Dashboard → Settings → API
  - Sensitive: No (public)

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Value: _[Your service role key]_
  - Source: Supabase Dashboard → Settings → API
  - Sensitive: **YES - Mark as Secret in Vercel**

### Application URLs

- [ ] `NEXT_PUBLIC_SITE_URL`
  - Value: `https://whitedgelms.vercel.app` (or custom domain)
  - Sensitive: No

- [ ] `NEXT_PUBLIC_APP_URL`
  - Value: `https://whitedgelms.vercel.app` (or custom domain)
  - Sensitive: No

### Payments (Razorpay - LIVE Keys)

- [ ] `RAZORPAY_KEY_ID`
  - Value: _[Your live key - should start with `rzp_live_`]_
  - Source: Razorpay Dashboard → Settings → API Keys
  - Sensitive: No (public ID)

- [ ] `RAZORPAY_KEY_SECRET`
  - Value: _[Your live secret key]_
  - Source: Razorpay Dashboard → Settings → API Keys
  - Sensitive: **YES - Mark as Secret in Vercel**

### Email Service (SMTP2GO)

- [ ] `SMTP_HOST`
  - Value: `mail.smtp2go.com`
  - Sensitive: No

- [ ] `SMTP_PORT`
  - Value: `2525`
  - Sensitive: No

- [ ] `SMTP_USER`
  - Value: _[Your SMTP username - usually domain name]_
  - Source: SMTP2GO Dashboard → SMTP Users
  - Sensitive: **YES - Mark as Secret in Vercel**

- [ ] `SMTP_PASSWORD`
  - Value: _[Your SMTP password]_
  - Source: SMTP2GO Dashboard → SMTP Users
  - Sensitive: **YES - Mark as Secret in Vercel**

- [ ] `SMTP_FROM_EMAIL`
  - Value: `noreply@whiteboardconsultant.com` (or your domain)
  - Sensitive: No

- [ ] `ADMIN_EMAIL`
  - Value: `info@whiteboardconsultant.com` (or admin email)
  - Sensitive: No

- [ ] `SMTP_SECURE`
  - Value: `false`
  - Sensitive: No

### AI Service (Gemini API)

- [ ] `GEMINI_API_KEY`
  - Value: _[Your Gemini API key]_
  - Source: https://aistudio.google.com/app/apikey
  - Sensitive: **YES - Mark as Secret in Vercel**

### Node Environment

- [ ] `NODE_ENV`
  - Value: `production`
  - Sensitive: No

---

## 🔐 Security Checklist

In Vercel, after adding each variable, mark as **Secret** if it says "Sensitive: YES":

- [ ] `SUPABASE_SERVICE_ROLE_KEY` → Mark "Secret"
- [ ] `RAZORPAY_KEY_SECRET` → Mark "Secret"
- [ ] `SMTP_USER` → Mark "Secret"
- [ ] `SMTP_PASSWORD` → Mark "Secret"
- [ ] `GEMINI_API_KEY` → Mark "Secret"

All other variables can remain as "Production" (non-secret)

---

## 📝 Variable Collection Template

**Print this out or fill in digitally:**

```
# Copy-paste these values from your sources

NEXT_PUBLIC_SUPABASE_URL=[                                    ]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[                               ]
SUPABASE_SERVICE_ROLE_KEY=[                                   ]
NEXT_PUBLIC_SITE_URL=[                                        ]
NEXT_PUBLIC_APP_URL=[                                         ]
RAZORPAY_KEY_ID=[                                             ]
RAZORPAY_KEY_SECRET=[                                         ]
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=[                                                   ]
SMTP_PASSWORD=[                                               ]
SMTP_FROM_EMAIL=[                                             ]
ADMIN_EMAIL=[                                                 ]
SMTP_SECURE=false
GEMINI_API_KEY=[                                              ]
NODE_ENV=production
```

---

## 🚀 Deployment Step-by-Step

### Step 1: Local Build Verification

```bash
# In terminal, from project root
cd /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS

# Clean build
rm -rf .next

# Build production
npm run build

# ✅ If you see "✓ Ready for production" → Go to Step 2
# ❌ If you see errors → Fix them before proceeding
```

**Expected Output:**
```
> next build
...
✓ Compiled successfully
✓ Linting and type checking
...
✓ Ready for production
```

### Step 2: Local Production Test

```bash
# Start production server
npm run start

# Open browser: http://localhost:3000
# Test:
# - Homepage loads
# - No console errors (F12 → Console)
# - Can click navigation
# - Registration form visible

# Stop with: Ctrl+C
```

### Step 3: Go to Vercel

1. Open https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Search for "WhitedgeLMS" (or similar) GitHub repo
4. Click "Import"
5. Click "Deploy" (don't worry about env vars yet)

**Wait for initial deployment to complete** (~2-5 minutes)

**You'll see:** "Success! Your site is live at https://whitedgelms.vercel.app"

### Step 4: Add Environment Variables

1. In Vercel dashboard, select your project
2. Click "Settings" tab
3. Left sidebar → "Environment Variables"
4. For each variable from your checklist:
   - Click "Add New"
   - Paste variable name
   - Paste variable value
   - Select "Production" scope
   - If marked "Secret" above, click "Secret" checkbox
   - Click "Save"
5. Repeat for all variables

### Step 5: Redeploy with Variables

1. In Vercel, click "Deployments" tab
2. Find most recent deployment
3. Click "..." → "Redeploy"
4. Confirm "Redeploy"
5. Watch build complete (usually 2-5 minutes)

**You'll see:** Green checkmark when deployment completes successfully

### Step 6: Smoke Test Production

1. Visit: https://whitedgelms.vercel.app (or your custom domain)
2. Test these:
   - [ ] Page loads without errors
   - [ ] Open DevTools (F12) → Console → No red errors
   - [ ] Click "Register" or menu items → Works
   - [ ] Images load (check logo, icons)
   - [ ] Try submitting a form → Submits (may show validation errors, OK)
3. If you see 500 errors:
   - Check Vercel logs (Deployments → View Log)
   - Likely: Missing or wrong environment variable
   - Fix in Settings → Environment Variables
   - Redeploy

### Step 7: Enable Backups

1. Go to Supabase → Your project
2. Click "Settings" (bottom left)
3. Click "Backups" tab
4. Verify "Automated backups" is enabled
5. Note backup schedule (usually daily)

### Step 8: Create Deployment Record

Create file: `PRODUCTION_DEPLOYMENT_RECORD.md`

```markdown
# Production Deployment Record

**Date:** [Today's date]
**Time:** [Current time]
**Deployed By:** [Your name]

## Status
✅ DEPLOYED SUCCESSFULLY

## URLs
- Production: https://whitedgelms.vercel.app
- Vercel Dashboard: [Link to project]

## Environment Variables
✅ All 15 variables configured

## Tests Completed
- ✅ Homepage loads
- ✅ No console errors
- ✅ Navigation works
- ✅ Forms visible
- ✅ Registration accessible

## Services Verified
- ✅ Database connection (Supabase)
- ✅ Backup enabled
- ✅ SSL/HTTPS active

## Post-Launch Actions
- Monitor for 24 hours
- Daily logs review
- Test registration if users arrive
```

---

## 🆘 Troubleshooting

### Problem: Build fails with "Cannot find module"

**Solution:**
1. Ensure all dependencies installed: `npm install`
2. Try clean install: `rm package-lock.json && npm install`
3. Push to GitHub
4. Vercel will auto-redeploy

### Problem: 500 errors on production but not locally

**Solution:**
1. Check Vercel logs: Deployments → View Log
2. Look for specific error (usually environment variable issue)
3. Most common: SUPABASE_SERVICE_ROLE_KEY not set or incorrect
4. Fix in Settings → Environment Variables
5. Redeploy

### Problem: Environment variables not loading

**Solution:**
1. Verify variable is in "Production" scope (not just Preview)
2. Verify spelling exactly matches (case-sensitive)
3. Redeploy after fixing
4. If still issues: Delete variable and re-add

### Problem: Email not sending

**Solution:**
1. Verify SMTP_USER is correct (should be domain, not email)
2. Verify SMTP_PASSWORD is set (not just username)
3. Check in SMTP2GO dashboard that credentials match
4. Test locally first: `npm run dev` then trigger email

### Problem: Payment gateway showing errors

**Solution:**
1. Ensure using LIVE keys, not test keys
2. RAZORPAY_KEY_ID should start with `rzp_live_`
3. Verify RAZORPAY_KEY_SECRET is set and correct
4. Check Razorpay dashboard that keys are active
5. Redeploy after fixing

---

## 📊 Success Indicators

**Your deployment is successful when:**

- ✅ Website loads at https://whitedgelms.vercel.app
- ✅ No 500 errors on any page
- ✅ Console has no red errors
- ✅ Registration form displays
- ✅ Images load correctly
- ✅ Navigation works
- ✅ Links function
- ✅ Database is responsive
- ✅ Backup is enabled
- ✅ Vercel shows green deployment

---

## 📞 Support Resources

### If You Get Stuck

1. **Check Vercel Logs**
   - Vercel Dashboard → Deployments → View Log
   - Look for specific error messages

2. **Check Application Logs**
   - Open website
   - Press F12 for DevTools
   - Click "Console" tab
   - Look for red error messages
   - Copy full error text

3. **Review Supabase**
   - Go to Supabase Dashboard
   - Click "Logs" or "SQL Editor"
   - Check for connection errors

4. **Reference Documents**
   - `PRODUCTION_DEPLOYMENT_IMPLEMENTATION.md` (full guide)
   - `TASK_1_6_PRODUCTION_SETUP.md` (detailed reference)
   - `DEPLOYMENT_ACTION_PLAN.md` (comprehensive plan)

---

## ⏱️ Estimated Timeline

```
Task                                    Time
────────────────────────────────────────────
1. Read this checklist                  2 min
2. Gather all environment variables     5 min
3. Verify local build                   5 min
4. Deploy to Vercel                     3 min
5. Add env variables in Vercel          5 min
6. Trigger Vercel redeploy              5 min
7. Smoke test production                3 min
8. Enable backups                       2 min
────────────────────────────────────────────
TOTAL                                  ~30 min
```

---

## ✨ You're Ready!

All prerequisites are complete. Your application is production-ready.

**Next Action:** Follow the "Deployment Step-by-Step" section above.

**Estimated Result:** Production website live in 30 minutes.

---

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Status:** Ready for Use


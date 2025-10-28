# ✅ PHASE 1 EXECUTION CHECKLIST - USE THIS TO TRACK PROGRESS

**Start Date**: _______________  
**Start Time**: _______________  

---

## 📋 PRE-EXECUTION (Before Starting)

- [ ] Read PHASE_1_READY_TO_START.md (5 min)
- [ ] Read PHASE_1_QUICK_START.md (10 min)
- [ ] Opened this checklist to track progress
- [ ] Have access to all service dashboards (Supabase, Razorpay, Google)
- [ ] Have 3-4 hours available
- [ ] Created backup of WhitedgeLMS directory

---

## 🔐 TASK 1.1: SUPABASE KEYS ROTATION (45 min)

**Estimated Duration**: 45 minutes  
**Start Time**: _______________  
**End Time**: _______________  

- [ ] Opened TASK_1_1_SUPABASE_ROTATION.md
- [ ] Accessed Supabase dashboard at https://app.supabase.com
- [ ] Navigated to Settings → API
- [ ] Found my project: lqezaljvpiycbeakndby.supabase.co
- [ ] Regenerated Anon Key
  - [ ] Clicked regenerate button
  - [ ] Confirmed the action
  - [ ] Copied new anon key
  - [ ] Saved to temporary location
- [ ] Regenerated Service Role Key
  - [ ] Clicked regenerate button
  - [ ] Confirmed the action
  - [ ] Copied new service role key
  - [ ] Saved to temporary location
- [ ] Updated .env.local
  - [ ] Found NEXT_PUBLIC_SUPABASE_ANON_KEY line
  - [ ] Replaced with NEW anon key
  - [ ] Found SUPABASE_SERVICE_ROLE_KEY line
  - [ ] Replaced with NEW service role key
  - [ ] Saved file
- [ ] Tested new credentials
  - [ ] Stopped dev server: `pkill -f "next dev"`
  - [ ] Started dev server: `npm run dev`
  - [ ] Visited http://localhost:3000
  - [ ] Tried logging in/signing up
  - [ ] No "Unauthorized" errors
- [ ] ✅ TASK 1.1 COMPLETE

**Notes**: _________________________________________________

---

## 💳 TASK 1.2: RAZORPAY KEYS ROTATION (30 min)

**Estimated Duration**: 30 minutes  
**Start Time**: _______________  
**End Time**: _______________  

⚠️ **WARNING**: These are LIVE keys controlling real payments!

- [ ] Opened TASK_1_2_RAZORPAY_ROTATION.md
- [ ] Accessed Razorpay dashboard at https://dashboard.razorpay.com
- [ ] Went to Settings → API Keys
- [ ] Confirmed in "Live Mode" (not Test Mode)
- [ ] Found current keys:
  - [ ] Key ID: rzp_live_RS4vYhESlsRtar
  - [ ] Secret: WHuCvGKnbOmNNSD51LGuvF93
- [ ] Regenerated LIVE API Keys
  - [ ] Clicked "Regenerate API Key"
  - [ ] Confirmed the warning dialog
  - [ ] Waited for generation (10-15 sec)
  - [ ] Copied NEW Key ID
  - [ ] Copied NEW Secret
  - [ ] Saved both to temporary location
- [ ] Updated .env.local
  - [ ] Found RAZORPAY_KEY_ID line
  - [ ] Replaced with NEW key ID
  - [ ] Found RAZORPAY_KEY_SECRET line
  - [ ] Replaced with NEW secret
  - [ ] Saved file
- [ ] Tested payment flow (optional)
  - [ ] Started dev server
  - [ ] Navigated to course enrollment
  - [ ] Tried to initiate payment
  - [ ] Razorpay modal opened without errors
- [ ] ✅ TASK 1.2 COMPLETE

**Notes**: _________________________________________________

---

## 🤖 TASK 1.3: GEMINI API KEY ROTATION (30 min)

**Estimated Duration**: 30 minutes  
**Start Time**: _______________  
**End Time**: _______________  

- [ ] Opened TASK_1_3_1_4_API_KEYS.md (section 1.3)
- [ ] Accessed Google AI Studio at https://aistudio.google.com/app/apikey
- [ ] Logged in with correct Google account
- [ ] Found API Keys section
- [ ] Located current key: AIzaSyCVTl7RSaWuygOiOcyeGGyL6Ek1-RgEMow
- [ ] Created new API key
  - [ ] Clicked "Create new API key"
  - [ ] Selected project (or created new project)
  - [ ] Waited for key generation (5-10 sec)
  - [ ] Copied NEW key
  - [ ] Saved to temporary location
- [ ] (Optional) Configured key restrictions
  - [ ] Clicked on new key to edit
  - [ ] Set API restrictions to "Generative Language API only"
  - [ ] Set website restrictions if needed
  - [ ] Saved settings
- [ ] Deleted old key
  - [ ] Found old key: AIzaSyCVTl7RSaWuygOiOcyeGGyL6Ek1-RgEMow
  - [ ] Clicked delete/remove
  - [ ] Confirmed deletion
  - [ ] Verified old key no longer in list
- [ ] Updated .env.local
  - [ ] Found GEMINI_API_KEY line
  - [ ] Replaced with NEW key
  - [ ] Saved file
- [ ] ✅ TASK 1.3 COMPLETE

**Notes**: _________________________________________________

---

## 📧 TASK 1.4: GMAIL APP PASSWORD ROTATION (30 min)

**Estimated Duration**: 30 minutes  
**Start Time**: _______________  
**End Time**: _______________  

- [ ] Opened TASK_1_3_1_4_API_KEYS.md (section 1.4)
- [ ] Verified 2-Step Verification enabled
  - [ ] Went to https://myaccount.google.com/security
  - [ ] Found "Two-Step Verification"
  - [ ] Confirmed it shows "On" or enabled ✅
  - [ ] (If not enabled, set it up first - takes 5-10 min)
- [ ] Navigated to App Passwords at https://myaccount.google.com/apppasswords
- [ ] Generated new app password
  - [ ] Selected app: "Mail"
  - [ ] Selected device: "Custom" or generic option
  - [ ] Typed "WhitedgeLMS" or similar
  - [ ] Clicked "Generate"
  - [ ] Received 16-character password
  - [ ] Copied password (without spaces)
  - [ ] Saved to temporary location
- [ ] Deleted old app password
  - [ ] Found old password entry (looked for Mail Windows PC or similar)
  - [ ] Clicked delete/remove button
  - [ ] Confirmed deletion
  - [ ] Verified old password no longer in list
- [ ] Updated .env.local
  - [ ] Found SMTP_PASSWORD line (was: cykmrsgnxeygbeak)
  - [ ] Replaced with NEW 16-character app password
  - [ ] Removed any spaces
  - [ ] Saved file
- [ ] (Optional) Tested email sending
  - [ ] Restarted dev server: `npm run dev`
  - [ ] Went to signup page
  - [ ] Signed up with test email
  - [ ] Checked if verification email arrived
  - [ ] Email sent successfully ✅
- [ ] ✅ TASK 1.4 COMPLETE

**Notes**: _________________________________________________

---

## 🔄 TASK 1.5: GIT HISTORY CLEANUP (30 min)

**Estimated Duration**: 30 minutes  
**Start Time**: _______________  
**End Time**: _______________  

⚠️ **WARNING**: This operation is destructive but necessary!

- [ ] Created backup first
  - [ ] Ran: `cp -r WhitedgeLMS WhitedgeLMS-backup`
  - [ ] Backup created: /Users/.../WhitedgeLMS-backup-[date]
- [ ] Opened TASK_1_5_1_6_GIT_AND_ENV.md (section 1.5)
- [ ] Verified .gitignore
  - [ ] Opened .gitignore file
  - [ ] Verified .env.local is listed
  - [ ] If not, added it: `echo ".env.local" >> .gitignore`
- [ ] Added other env files to .gitignore
  - [ ] Added: .env.production
  - [ ] Added: .env.staging
  - [ ] Added: .env.*.local
  - [ ] Committed: `git add .gitignore && git commit -m "chore: add env files to gitignore"`
- [ ] Cleaned git history
  - [ ] Ran: `git filter-branch --tree-filter 'rm -f .env.local' HEAD -- --all`
  - [ ] Waited for completion (10-30 seconds)
  - [ ] Saw: "Ref 'refs/heads/main' was rewritten"
- [ ] Force pushed to remote
  - [ ] Ran: `git push origin --force --all`
  - [ ] Ran: `git push origin --force --tags`
  - [ ] Saw successful push confirmation
- [ ] Verified removal
  - [ ] Ran: `git log -p -- .env.local | head -20`
  - [ ] Result shows no content (expected behavior)
  - [ ] ✅ Confirmed: .env.local removed from history
- [ ] Notified team (if applicable)
  - [ ] Sent message about force push
  - [ ] Told them to: `git fetch origin && git reset --hard origin/main`
- [ ] ✅ TASK 1.5 COMPLETE

**Notes**: _________________________________________________

---

## 🔐 TASK 1.6: CREATE .ENV.PRODUCTION (60 min)

**Estimated Duration**: 60 minutes  
**Start Time**: _______________  
**End Time**: _______________  

- [ ] Opened TASK_1_5_1_6_GIT_AND_ENV.md (section 1.6)
- [ ] Created .env.production from template
  - [ ] Ran: `cp .env.example .env.production`
  - [ ] File created: .env.production
- [ ] Updated Supabase credentials (use NEW keys from Task 1.1)
  - [ ] NEXT_PUBLIC_SUPABASE_URL: https://lqezaljvpiycbeakndby.supabase.co
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY: [NEW from Task 1.1]
  - [ ] SUPABASE_SERVICE_ROLE_KEY: [NEW from Task 1.1]
- [ ] Updated production URLs
  - [ ] NEXT_PUBLIC_SITE_URL: https://yourdomain.com (NOT localhost!)
  - [ ] NEXT_PUBLIC_APP_URL: https://yourdomain.com (NOT localhost!)
  - [ ] ⚠️ Critical: Replace localhost with actual domain
- [ ] Updated payment credentials (use NEW keys from Task 1.2)
  - [ ] RAZORPAY_KEY_ID: [NEW from Task 1.2]
  - [ ] RAZORPAY_KEY_SECRET: [NEW from Task 1.2]
- [ ] Updated email credentials (use NEW from Task 1.4)
  - [ ] SMTP_HOST: smtp.gmail.com
  - [ ] SMTP_PORT: 587
  - [ ] SMTP_USER: info@whiteboardconsultant.com
  - [ ] SMTP_PASSWORD: [NEW from Task 1.4]
  - [ ] SMTP_FROM: noreply@yourdomain.com
- [ ] Updated API credentials (use NEW from Task 1.3)
  - [ ] GEMINI_API_KEY: [NEW from Task 1.3]
- [ ] (Optional) Added monitoring credentials
  - [ ] NEXT_PUBLIC_ANALYTICS_ID: [if using Google Analytics]
  - [ ] SENTRY_DSN: [if using Sentry]
- [ ] (Optional) Added feature flags
  - [ ] FEATURE_ENABLE_PAYMENTS: true
  - [ ] FEATURE_ENABLE_AI_SUGGESTIONS: true
  - [ ] FEATURE_ENABLE_CERTIFICATES: true
  - [ ] FEATURE_ENABLE_MESSAGING: true
- [ ] Verified .env.production NOT in git
  - [ ] Checked .gitignore has .env.production
  - [ ] If not: `echo ".env.production" >> .gitignore`
- [ ] Created .env.production.notes.md
  - [ ] Documented credentials rotation date: October 21, 2025
  - [ ] Listed all rotated keys
  - [ ] Noted production domain
  - [ ] Added deployment instructions
- [ ] Backed up .env.production securely
  - [ ] ⚠️ Keep this file secure (not in git, not shared via Slack)
  - [ ] Store in secure location or password manager
- [ ] ✅ TASK 1.6 COMPLETE

**Notes**: _________________________________________________

---

## ✅ PHASE 1 COMPLETION SUMMARY

**All Tasks Completed**: _______________

### Credentials Rotated ✅
- [ ] Supabase Anon Key (was: FehxMVZlGq1w... → now: NEW)
- [ ] Supabase Service Role Key (was: 4fzjOpiTl6cb... → now: NEW)
- [ ] Razorpay Key ID (was: rzp_live_RS4vYhES... → now: NEW)
- [ ] Razorpay Secret (was: WHuCvGKnbOmNN... → now: NEW)
- [ ] Gemini API Key (was: AIzaSyCVTl7RS... → now: NEW)
- [ ] Gmail App Password (was: cykmrsgnxeygbeak → now: NEW)

### Files Created ✅
- [ ] .env.production (production config)
- [ ] .env.production.notes.md (team documentation)
- [ ] Clean git history (no exposed credentials)

### Security Status ✅
- [ ] Old credentials REVOKED
- [ ] New credentials ACTIVE
- [ ] .env.local NOT in git
- [ ] .env.production ready for deployment

### Next Steps ✅
- [ ] Ready for Phase 1 Part B (Debug Logging - 8-12 hours)
- [ ] Then ready for Phase 2-7 (see DEPLOYMENT_ACTION_PLAN.md)

---

## 📊 PHASE 1 TIME TRACKING

| Task | Duration | Actual Time | Status |
|------|----------|------------|--------|
| 1.1 Supabase | 45 min | ________ | ☐ |
| 1.2 Razorpay | 30 min | ________ | ☐ |
| 1.3 Gemini | 30 min | ________ | ☐ |
| 1.4 Gmail | 30 min | ________ | ☐ |
| 1.5 Git | 30 min | ________ | ☐ |
| 1.6 .env | 60 min | ________ | ☐ |
| **TOTAL** | **3.5 hrs** | **________** | **✅** |

---

## 🎉 PHASE 1 COMPLETE!

**Date Completed**: _______________  
**Total Time Spent**: _______________  
**Notes**: 
```
_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________
```

---

## 👉 NEXT STEPS

✅ Phase 1 DONE - Credentials secured & git cleaned  
🚀 Next: Phase 1 Part B - Remove debug logging (8-12 hours)  
🚀 Then: Phase 2-7 - Complete 7-phase deployment process  

**See DEPLOYMENT_ACTION_PLAN.md for next phases**

---

*Keep this checklist for reference!*  
*Print and check off as you complete each task.*

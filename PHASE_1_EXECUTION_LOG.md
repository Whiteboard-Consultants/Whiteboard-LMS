# Phase 1 Execution Log - Security Hardening

**Start Date**: October 21, 2025  
**Phase**: 1 of 7  
**Duration**: Days 1-3 (12-18 hours total)  
**Status**: 🚀 IN PROGRESS

---

## Task 1.1: Credential Rotation - Supabase

**Status**: ⏳ PENDING  
**Time Estimate**: 45 minutes  
**Steps**:

### Step 1: Get Your Current Supabase Project Details
From `.env.local`:
- **Supabase URL**: https://lqezaljvpiycbeakndby.supabase.co
- **Current Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI... (EXPOSED - NEEDS ROTATION)
- **Current Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI... (EXPOSED - NEEDS ROTATION)

### Step 2: Navigate to Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project: "WhitedgeLMS" or similar
3. Go to: **Settings → API Keys**

### Step 3: Rotate Anon Key
1. Click "Generate new" next to Anon Key
2. Copy the NEW anon key
3. **UPDATE**: Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
4. ✅ Mark as complete below

### Step 4: Rotate Service Role Key
1. Click "Generate new" next to Service Role Key
2. Copy the NEW service role key
3. **UPDATE**: Replace `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
4. ✅ Mark as complete below

### Step 5: Test Connection
```bash
# Test that new keys work
npm run dev
# Visit http://localhost:3000 and verify login still works
```

**✅ Completion Checklist**:
- [ ] Navigated to Supabase dashboard
- [ ] Generated new Anon Key
- [ ] Generated new Service Role Key
- [ ] Updated .env.local with new keys
- [ ] Tested npm run dev - login works

**Completed**: No
**Time Spent**: 0 min / 45 min

---

## Task 1.2: Credential Rotation - Razorpay

**Status**: ⏳ PENDING  
**Time Estimate**: 30 minutes  
**⚠️ CRITICAL**: These are LIVE keys! Regenerate immediately.

From `.env.local`:
- **RAZORPAY_KEY_ID**: rzp_live_RS4vYhESlsRtar (LIVE - EXPOSED)
- **RAZORPAY_KEY_SECRET**: WHuCvGKnbOmNNSD51LGuvF93 (LIVE - EXPOSED)

### Steps:
1. Go to: https://dashboard.razorpay.com
2. Navigate to: **Settings → API Keys**
3. Click: **Regenerate API Key**
4. Copy new Key ID and Secret
5. Update in `.env.local`:
   - `RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXX` (new)
   - `RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXX` (new)
6. Test: Make a test payment to verify keys work

**✅ Completion Checklist**:
- [ ] Accessed Razorpay dashboard
- [ ] Generated new API keys
- [ ] Updated .env.local
- [ ] Tested payment flow

**Completed**: No
**Time Spent**: 0 min / 30 min

---

## Task 1.3: Credential Rotation - Gemini API

**Status**: ⏳ PENDING  
**Time Estimate**: 30 minutes  

From `.env.local`:
- **GEMINI_API_KEY**: AIzaSyCVTl7RSaWuygOiOcyeGGyL6Ek1-RgEMow (EXPOSED)

### Steps:
1. Go to: https://aistudio.google.com/app/apikey
2. Click: **Create new API key**
3. Copy new key
4. Update in `.env.local`:
   - `GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (new)
5. Delete old key from Google (if visible)

**✅ Completion Checklist**:
- [ ] Created new Gemini API key
- [ ] Updated .env.local
- [ ] Deleted old key

**Completed**: No
**Time Spent**: 0 min / 30 min

---

## Task 1.4: Credential Rotation - Gmail App Password

**Status**: ⏳ PENDING  
**Time Estimate**: 30 minutes  

From `.env.local`:
- **SMTP_USER**: info@whiteboardconsultant.com
- **SMTP_PASSWORD**: (EXPOSED - needs rotation)

### Steps:
1. Go to: https://myaccount.google.com/security
2. Verify: **2-Step Verification** is enabled
3. Go to: https://myaccount.google.com/apppasswords
4. Select: Mail & Custom app
5. Generate: New app password
6. Copy password
7. Update in `.env.local`:
   - `SMTP_PASSWORD=XXXXXXXXXXXXXXXXXXX` (new)
8. Revoke old password from account

**✅ Completion Checklist**:
- [ ] Generated new Gmail app password
- [ ] Updated .env.local
- [ ] Revoked old password

**Completed**: No
**Time Spent**: 0 min / 30 min

---

## Task 1.5: Git History Cleanup

**Status**: ⏳ PENDING  
**Time Estimate**: 30 minutes  
**⚠️ WARNING**: This is destructive. Back up first!

### Steps:

**Step 1: Verify .gitignore includes env files**
```bash
grep ".env" .gitignore
# Should show: .env.local, .env.production, etc
```

**Step 2: If .gitignore missing entries, add them**
```bash
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo ".env.staging" >> .gitignore
git add .gitignore
git commit -m "chore: add env files to gitignore"
```

**Step 3: Remove .env.local from git history**
```bash
# This removes .env.local from ALL previous commits
git filter-branch --tree-filter 'rm -f .env.local' HEAD -- --all

# Force push to update remote (WARNING: affects all developers)
git push origin --force --all
```

**Step 4: Verify it's removed**
```bash
git log -p -- .env.local | head -20
# Should show: Path .env.local does not exist (or similar)
```

**✅ Completion Checklist**:
- [ ] Backed up current work
- [ ] Added .env.local to .gitignore
- [ ] Ran git filter-branch
- [ ] Verified removal from history
- [ ] Notified team about force push

**Completed**: No
**Time Spent**: 0 min / 30 min

---

## Task 1.6: Create .env.production

**Status**: ⏳ PENDING  
**Time Estimate**: 1 hour  

### Steps:

**Step 1: Copy template**
```bash
cp .env.example .env.production
```

**Step 2: Edit .env.production**
- Replace all placeholder values with ACTUAL production values
- Use NEW rotated credentials from Tasks 1.1-1.4
- Change URLs from localhost to production domain

**Step 3: Verify .env.production NOT in git**
```bash
grep ".env.production" .gitignore
# Should show .env.production
```

**Step 4: Document production setup**
Create `.env.production.notes.md` for team reference

**✅ Completion Checklist**:
- [ ] Created .env.production from template
- [ ] Updated with NEW credentials
- [ ] Verified it's in .gitignore
- [ ] Backed up safely (not committed)

**Completed**: No
**Time Spent**: 0 min / 60 min

---

## Summary

| Task | Status | Time | Owner |
|------|--------|------|-------|
| 1.1 Supabase Keys | ⏳ | 45 min | DevOps |
| 1.2 Razorpay Keys | ⏳ | 30 min | DevOps |
| 1.3 Gemini API | ⏳ | 30 min | Backend |
| 1.4 Gmail App Password | ⏳ | 30 min | Ops |
| 1.5 Git History | ⏳ | 30 min | DevOps |
| 1.6 .env.production | ⏳ | 60 min | Backend |
| **TOTAL** | ⏳ | **3.5 hours** | **Team** |

---

## Next Steps After Phase 1.1 Complete

Once credentials are rotated:
1. Move to Task 1.2 (Razorpay)
2. Continue through Tasks 1.3-1.6
3. Then proceed to Phase 1 Part B: Debug Logging Cleanup

---

**Generated**: October 21, 2025, 22:58  
**Priority**: 🔴 CRITICAL - START IMMEDIATELY

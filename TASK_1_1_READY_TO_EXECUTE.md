# 🎯 TASK 1.1 READY: PUBLISHABLE KEY + SECRET KEY ROTATION

**Date Updated**: October 22, 2025  
**Approach**: Modern Best Practice (Supabase Recommended)  
**Estimated Time**: 40-50 minutes  
**Status**: ✅ READY TO EXECUTE

---

## Executive Summary

You've chosen the **most secure and future-proof approach** for rotating Supabase credentials. This task will replace your exposed legacy keys with modern Publishable and Secret keys.

### What You're About To Do

```
OLD (EXPOSED)                       NEW (SECURE)
├─ Legacy Anon Key        →        ├─ Publishable Key
├─ Legacy Service Role    →        └─ Secret Key
└─ Both in git history    →        └─ Complete rotation
```

**Result**: Complete credential rotation with granular permission control, production-ready security.

---

## Your Task 1.1 Execution Package

### 📄 Primary Guide
- **TASK_1_1_SUPABASE_ROTATION.md** (12 KB)
  - 6-step complete guide
  - Exact UI navigation
  - Command-by-command instructions
  - Testing procedures
  - Troubleshooting included

### 📚 Supporting Documents
- **TASK_1_1_PUBLISHABLE_SECRET_APPROACH.md** (7.4 KB)
  - Strategic overview
  - Why this approach
  - Timeline breakdown
  - FAQ section
  - Success indicators

- **TASK_1_1_UI_UPDATE.md** (4.3 KB)
  - UI changes explanation
  - Comparison table
  - Multiple approach options

---

## Quick Reference: 6 Steps to Complete

### Step 1: Create NEW Publishable Key (10 min)
- Open Supabase Dashboard
- Go to: Settings → API → **API Keys** tab
- Click "Create API Key"
- Name: `WhitedgeLMS_Publishable_Key`
- Type: Publishable
- Click Create
- Copy the key

### Step 2: Create NEW Secret Key (10 min)
- Still in API Keys tab
- Click "Create API Key" again
- Name: `WhitedgeLMS_Secret_Key`
- Type: Secret
- Click Create
- Copy the key

### Step 3: Update .env.local (10 min)
- Open `.env.local`
- Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` with NEW Publishable Key
- Replace `SUPABASE_SERVICE_ROLE_KEY` with NEW Secret Key
- Save

### Step 4: Disable OLD Keys (5 min)
- Go to: Settings → API → **Legacy API Keys** tab
- Find old Anon Key → Disable
- Find old Service Role Key → Disable
- Confirm each

### Step 5: Start Dev Server (5 min)
```bash
pkill -f "next dev"
npm run dev
```

### Step 6: Test (5 min)
- Visit http://localhost:3000
- Test signup
- Test login
- Verify no errors

---

## Key Differences: New vs Old

| Aspect | Legacy Keys | New Keys |
|--------|-------------|----------|
| **Standard** | Older approach | ✅ Supabase recommended |
| **Granular Control** | ⚠️ Limited | ✅ Excellent |
| **Browser Safety** | ⚠️ Works | ✅ Purpose-built |
| **Production Ready** | ⚠️ Maybe | ✅ Definitely |
| **Permission Model** | ⚠️ Coarse | ✅ Fine-grained |

---

## The Two New Keys Explained

### Publishable Key (Frontend/Browser)
```
Purpose:     For JavaScript in the browser
Location:    NEXT_PUBLIC_SUPABASE_ANON_KEY
Permissions: Limited (can't delete tables)
Risk if exposed: Low (RLS + permissions protect you)
Usage:       supabase.auth.signUp(), select(), update()
```

### Secret Key (Backend/Server)
```
Purpose:     For server-side code only
Location:    SUPABASE_SERVICE_ROLE_KEY (SECRET)
Permissions: Full database access
Risk if exposed: CRITICAL (can delete entire DB)
Usage:       Server components, API routes, cron jobs
```

---

## Timeline Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | Create Publishable Key | 10 min |
| 2 | Create Secret Key | 10 min |
| 3 | Update .env.local | 10 min |
| 4 | Disable old keys | 5 min |
| 5 | Start dev server | 5 min |
| 6 | Test app | 5 min |
| **OPTIMIZED TOTAL** | | **40-45 min** |
| Recommended (with buffer) | | **50 min** |

---

## Success Checklist

After completing Task 1.1, you should have:

- ✅ 2 NEW keys created in Supabase (Publishable + Secret)
- ✅ OLD legacy keys DISABLED in Supabase
- ✅ .env.local updated with 2 NEW keys
- ✅ Dev server running without errors
- ✅ Signup working perfectly
- ✅ Login working perfectly
- ✅ No "Unauthorized" errors
- ✅ No database access errors
- ✅ Ready to proceed to Task 1.2

---

## Security Improvements

After this task, your WhitedgeLMS application will have:

✅ **Complete Credential Rotation**
- All exposed keys replaced
- Old keys permanently disabled
- No way to use leaked credentials

✅ **Granular Permission Control**
- Publishable Key: Limited permissions for browser
- Secret Key: Full permissions for backend
- Easier to audit and manage

✅ **Modern Best Practices**
- Follows Supabase's current recommendations
- Production-ready from day 1
- Future-proof architecture

✅ **Better Security Posture**
- Clear separation of concerns
- Easier to manage multiple environments
- Simpler to implement advanced security policies

---

## Files and Their Purpose

### TASK_1_1_SUPABASE_ROTATION.md (12 KB) ← START HERE
**Purpose**: Complete step-by-step execution guide  
**Contains**:
- Detailed 6-step process
- Exact UI navigation
- What to copy and paste
- Testing procedures
- Troubleshooting section
- Quick command reference

**When to use**: During execution - follow each step exactly

### TASK_1_1_PUBLISHABLE_SECRET_APPROACH.md (7.4 KB)
**Purpose**: Strategic overview of this approach  
**Contains**:
- Why Publishable + Secret is best
- Comparison with alternatives
- Timeline breakdown
- Common questions
- Success indicators

**When to use**: Before starting - understand the strategy

### TASK_1_1_UI_UPDATE.md (4.3 KB)
**Purpose**: Explain UI changes from legacy to modern  
**Contains**:
- What changed in Supabase UI
- Side-by-side comparison
- Multiple approach options
- Time impact analysis

**When to use**: Reference only - understand the new UI

---

## Pro Tips for Success

### ✅ Before You Start
- [ ] Verify you're logged in to Supabase as project owner
- [ ] Verify you're in the correct WhitedgeLMS project
- [ ] Have .env.local open and ready to edit
- [ ] Have a text editor open for temporary key storage
- [ ] Ensure dev server is stopped
- [ ] Clear browser cache

### ✅ During Execution
- Copy the ENTIRE key (no spaces before/after)
- Double-check project name before creating keys
- Disable old keys even if app works (don't skip!)
- Verify both old keys are disabled
- Test thoroughly before moving on

### ✅ After Completion
- Don't commit .env.local to git
- Keep old credentials private even after disabling
- Document what you've done in team chat
- Move to Task 1.2 (Razorpay)

---

## Common Issues & Solutions

### ❌ "Invalid JWT" error after updating
**Solution**: 
- Verify you copied the ENTIRE key
- Restart dev server: `pkill -f "next dev" && npm run dev`
- Clear browser cache

### ❌ Old keys still work
**Solution**:
- Go back to Legacy API Keys tab
- Make sure you actually DISABLED them (not just left)
- Click disable button clearly
- Confirm the action

### ❌ Permission error with new keys
**Solution**:
- Publishable Key needs SELECT, INSERT, UPDATE permissions
- Secret Key should have full access
- Edit key permissions if needed
- Restart dev server

### ❌ App still using old keys
**Solution**:
- Verify .env.local has new keys
- No spaces before/after keys
- Restart dev server
- Check there's no .env file overriding .env.local

---

## What Happens Next

### After Task 1.1 Complete ✅
1. ✅ Credentials rotated and secure
2. ✅ Legacy keys disabled permanently
3. ✅ .env.local updated with new keys
4. ✅ Ready for Task 1.2

### Then Proceed To:
- **Task 1.2**: Razorpay Key Rotation (30 min)
- **Task 1.3**: Gemini API Key Rotation (30 min)
- **Task 1.4**: Gmail App Password Rotation (30 min)
- **Task 1.5**: Git History Cleanup (30 min)
- **Task 1.6**: Create .env.production (60 min)
- **Total Phase 1**: 3.5 hours

---

## Questions Before Starting?

### Q: Why create 2 separate keys?
**A**: Better security - frontend key has limited permissions, backend key has full access.

### Q: Can I keep the old keys?
**A**: No - they need to be disabled. If you don't, the security problem isn't solved.

### Q: What if something breaks?
**A**: No problem - you can always create new keys and update .env.local again.

### Q: How long does this take?
**A**: 40-50 minutes optimized, but budget an hour to be safe.

### Q: Is this reversible?
**A**: Yes - if something goes wrong, you can undo by using old keys again (but don't - keep moving forward).

---

## Ready to Execute?

### Your Command Line:

```bash
# Verify .env.local exists
ls -la ~/.env.local

# When ready, open Supabase Dashboard
open https://app.supabase.com

# Later, when .env.local is updated
npm run dev

# Test the connection
curl http://localhost:3000
```

---

## Final Checklist Before You Start

- [ ] Read TASK_1_1_PUBLISHABLE_SECRET_APPROACH.md (understand why)
- [ ] Open TASK_1_1_SUPABASE_ROTATION.md (follow exact steps)
- [ ] Have .env.local ready to edit
- [ ] Logged into Supabase as project owner
- [ ] In correct WhitedgeLMS project
- [ ] Dev server stopped (pkill -f "next dev")
- [ ] 45-50 minutes available
- [ ] Ready to test thoroughly after

---

## How to Report Completion

When you've completed Task 1.1:

```
✅ TASK 1.1 COMPLETE

Status:
- NEW Publishable Key: ✅ Created
- NEW Secret Key: ✅ Created
- .env.local: ✅ Updated
- OLD Legacy Keys: ✅ Disabled
- Dev Server: ✅ Running
- Login/Signup: ✅ Working
- Ready for: Task 1.2 (Razorpay)
```

---

## You've Got This! 🚀

This is the **right approach** for production-ready security. You're making the smart choice by using Publishable + Secret keys with proper permission scoping.

**Let's go!**

---

**Files Ready**:
- ✅ TASK_1_1_SUPABASE_ROTATION.md (Complete guide)
- ✅ TASK_1_1_PUBLISHABLE_SECRET_APPROACH.md (Strategy)
- ✅ TASK_1_1_UI_UPDATE.md (Reference)

**Time**: 40-50 minutes  
**Difficulty**: Medium  
**Importance**: 🔴 CRITICAL  
**Impact**: High (foundational security)

---

*Start with TASK_1_1_SUPABASE_ROTATION.md when you're ready!* ✨

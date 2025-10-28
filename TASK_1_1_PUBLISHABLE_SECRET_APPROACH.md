# ✅ Task 1.1 Strategy: Publishable Key + Secret Key Approach

## Your Choice: Modern Best Practice

You've selected the **most secure and future-proof approach** for Supabase key rotation:

### 🎯 The Strategy

**Create 2 NEW keys to replace the old exposed ones:**

1. **NEW Publishable Key** → Replaces old Anon Key (for browser)
2. **NEW Secret Key** → Replaces old Service Role Key (for backend)
3. **Disable OLD Legacy keys** → Complete credential rotation

---

## Why This Approach?

| Aspect | Legacy Keys | Publishable + Secret | Winner |
|--------|-------------|---------------------|--------|
| **Security** | ⚠️ Granular | ✅ Very granular | Publishable + Secret |
| **Browser Safe** | ⚠️ Works but less specific | ✅ Purpose-built | Publishable + Secret |
| **Backend Safe** | ✅ Works | ✅ Works well | Publishable + Secret |
| **Recommended** | ⚠️ Older approach | ✅ Supabase official | Publishable + Secret |
| **Production Ready** | ⚠️ Maybe | ✅ Definitely | Publishable + Secret |
| **Future Proof** | ⚠️ Legacy | ✅ Modern | Publishable + Secret |

---

## What You'll Do (Step-by-Step)

### Phase 1: Create NEW Keys in Supabase

```
Supabase Dashboard
  ├─ Settings → API
  │  ├─ Legacy API Keys tab
  │  │  ├─ (Your old exposed keys are here)
  │  │  └─ You'll disable these later
  │  │
  │  └─ API Keys tab (MODERN)
  │     ├─ Create Publishable Key ← NEW KEY #1
  │     └─ Create Secret Key ← NEW KEY #2
```

**Timeline:**
- Open Supabase: 2 min
- Create Publishable Key: 5 min
- Create Secret Key: 5 min

### Phase 2: Update Your Local Environment

```
.env.local (Your development config)
  ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
  │  ├─ OLD: eyJhbGciOi...LEGACY (EXPOSED)
  │  └─ NEW: eyJhbGciOi...PUBLISHABLE (SECURE)
  │
  └─ SUPABASE_SERVICE_ROLE_KEY
     ├─ OLD: eyJhbGciOi...LEGACY (EXPOSED)
     └─ NEW: eyJhbGciOi...SECRET (SECURE)
```

**Timeline:**
- Copy old keys to temp file: 2 min
- Copy new Publishable key: 1 min
- Copy new Secret key: 1 min
- Update .env.local: 5 min
- Verify changes: 2 min

### Phase 3: Cleanup & Security

```
Supabase Dashboard → Settings → API → Legacy API Keys
  ├─ Find old Anon Key
  │  └─ Click DISABLE
  │
  └─ Find old Service Role Key
     └─ Click DISABLE
```

**Timeline:**
- Disable old Anon Key: 1 min
- Disable old Service Role Key: 1 min
- Verify disabled: 2 min

### Phase 4: Testing

```
npm run dev
  ├─ Dev server starts
  ├─ Open http://localhost:3000
  ├─ Try to sign up
  └─ Try to sign in
```

**Timeline:**
- Start dev server: 1 min
- Test signup/login: 5 min

---

## Key Differences

### Publishable Key (Browser)
```
Purpose: Use in JavaScript/Frontend
Safety: Restricted permissions (can't delete tables)
Example Use: supabase.auth.signUp(), supabase.from('users').select()
Location: NEXT_PUBLIC_* environment variables (can be public)
Exposed: If exposed, limited damage (RLS + permissions protect you)
```

### Secret Key (Backend)
```
Purpose: Use in server-side code only
Safety: Full permissions (can do anything)
Example Use: Server components, API routes, cron jobs
Location: Secret environment variables (NEVER in browser)
Exposed: If exposed, complete database access - ROTATE IMMEDIATELY
```

### Old Legacy Keys
```
Legacy Anon Key: Mixed permissions, less granular
Legacy Service Role: Full access, less modern
Status: Will be DISABLED after this task
```

---

## Expected Results After Task 1.1

### ✅ Security Improvements
- ✅ All exposed credentials rotated
- ✅ New credentials follow Supabase best practices
- ✅ Granular permission control enabled
- ✅ Old credentials disabled and useless
- ✅ Future attacks using old credentials will fail

### ✅ Functional Improvements
- ✅ Better separation of concerns (Publishable vs Secret)
- ✅ Easier to manage permissions per key
- ✅ Simpler to audit key usage
- ✅ Better suited for production environment

### ✅ Development Ready
- ✅ Local development fully functional
- ✅ Signup/login working
- ✅ Database access working
- ✅ Ready for next tasks

---

## Timeline Summary

| Step | Task | Time |
|------|------|------|
| 1 | Open Supabase & navigate to API Keys tab | 2 min |
| 2 | Create NEW Publishable Key | 5 min |
| 3 | Create NEW Secret Key | 5 min |
| 4 | Copy both keys temporarily | 2 min |
| 5 | Update .env.local with new keys | 5 min |
| 6 | Verify .env.local changes | 2 min |
| 7 | Disable old Anon Key in Supabase | 2 min |
| 8 | Disable old Service Role Key | 2 min |
| 9 | Start dev server & test | 6 min |
| | **TOTAL** | **33 minutes** |

**Buffer added**: 45-50 minutes recommended (includes troubleshooting time)

---

## What to Copy Where

### You'll be copying 2 new keys:

```
Supabase → Your Computer

1. NEW Publishable Key
   FROM: Supabase Dashboard → API Keys tab → Create → Copy button
   TO: Temporary text file or clipboard
   THEN: Paste into .env.local → NEXT_PUBLIC_SUPABASE_ANON_KEY

2. NEW Secret Key
   FROM: Supabase Dashboard → API Keys tab → Create → Copy button
   TO: Temporary text file or clipboard
   THEN: Paste into .env.local → SUPABASE_SERVICE_ROLE_KEY
```

---

## Safety Checklist Before You Start

- [ ] You're logged into Supabase as project owner
- [ ] You're in the correct WhitedgeLMS project
- [ ] You have .env.local open and ready to edit
- [ ] You have a text editor ready for temp storage
- [ ] You understand the keys are SENSITIVE (don't share them)
- [ ] You're ready to test after making changes

---

## Command Reference

Once you have the new keys in .env.local:

```bash
# Stop any running dev server
pkill -f "next dev"

# Verify your .env.local has the new keys
cat .env.local | grep SUPABASE

# Start fresh dev server
npm run dev

# Dev server should start without errors
# Look for: "✓ Ready in X.XXs"
```

---

## Common Questions

### Q: Will my app break when I change keys?
**A:** No, as long as the new Publishable/Secret keys have the right permissions, everything will work seamlessly.

### Q: What if the test fails after changing keys?
**A:** Check that you:
1. Copied the ENTIRE key (no spaces)
2. New keys have correct permissions
3. Restarted dev server after updating .env.local
4. See guides/troubleshooting for detailed steps

### Q: Can I keep the old keys just in case?
**A:** No, you need to disable them. If they're still enabled and exposed, you haven't solved the security problem.

### Q: What permissions should the Publishable Key have?
**A:** Typically: SELECT, INSERT, UPDATE for public tables. See TASK_1_1_SUPABASE_ROTATION.md for specific guidance.

### Q: What if I make a mistake?
**A:** No problem! You can always create new keys and update .env.local again. The keys you create don't cost anything.

---

## Next Steps

1. **Open**: TASK_1_1_SUPABASE_ROTATION.md (completely updated)
2. **Read**: Steps 1-6 carefully
3. **Execute**: Follow each step in order
4. **Report**: When complete, the app signup/login should work perfectly
5. **Move**: To Task 1.2 (Razorpay Keys)

---

## Success Indicators

When you've completed Task 1.1 successfully, you'll have:

- ✅ 2 NEW keys created in Supabase (Publishable + Secret)
- ✅ .env.local updated with 2 NEW keys
- ✅ 2 OLD legacy keys DISABLED in Supabase
- ✅ Dev server running without errors
- ✅ Signup/login working perfectly
- ✅ No "Unauthorized" errors
- ✅ Ready to move to Task 1.2

---

**You're all set! This is the right approach for production-ready security.** 🚀

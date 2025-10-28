# PHASE 1, TASK 1.5 & 1.6: GIT CLEANUP & ENV PRODUCTION

**Criticality**: 🔴 CRITICAL  
**Estimated Time**: 1.5 hours total (30 min + 60 min)  
**Status**: Ready to execute after Tasks 1.1-1.4

---

## Summary

Two final tasks to complete Phase 1:

| Task | Goal | Time |
|------|------|------|
| 1.5 | Remove `.env.local` from git history | 30 min |
| 1.6 | Create `.env.production` file | 60 min |

---

## TASK 1.5: GIT HISTORY CLEANUP

**Purpose**: Remove exposed credentials from git repository history  
**Time**: 30 minutes  
**Warning**: ⚠️ This is a destructive operation - follow carefully!

---

### Why This Matters

Even though `.env.local` is now in `.gitignore`, it might already be committed to git history. Anyone who clones your repository or looks at the commit history can see the old (now-revoked) credentials.

We need to remove it from ALL past commits.

---

### STEP 1: Backup Current Work (5 minutes)

```bash
# Create a backup of your current work
cp -r /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS \
      /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS-backup-$(date +%Y%m%d)

echo "Backup created!"
```

---

### STEP 2: Check Current .gitignore (5 minutes)

1. **Open**: `.gitignore` in your editor
2. **Look for**: Lines with `.env`

**Expected to see something like:**
```
.env.local
.env.development.local
.env.production.local
```

**If you don't see `.env.local`, add it:**
```bash
cd /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS

# Add if not already there
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo ".env.staging" >> .gitignore
echo ".env.*.local" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "chore: add env files to gitignore"
```

---

### STEP 3: Remove .env.local from Git History (15 minutes)

**This removes `.env.local` from ALL previous commits:**

```bash
cd /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS

# Run the filter-branch command
# WARNING: This rewrites history for all commits that touched .env.local
git filter-branch --tree-filter 'rm -f .env.local' HEAD -- --all

# This will take 10-30 seconds depending on your commit history
# You'll see output like:
#   Rewriting commit ...
#   Rewriting commit ...
#   ...
# Once done, you'll see: "Ref 'refs/heads/main' was rewritten"
```

---

### STEP 4: Force Push to Remote (5 minutes)

⚠️ **WARNING**: This affects all developers on your team!

```bash
# This tells git to ignore all remote branches and overwrite them
# with your new clean history
git push origin --force --all

# You might also need:
git push origin --force --tags

# Verify it worked
git log --oneline | head -5
# Should show your commits
```

---

### STEP 5: Verify Removal (5 minutes)

Verify that `.env.local` is no longer in the git history:

```bash
# Try to find .env.local in any commit
git log -p -- .env.local | head -20

# Expected output should be one of:
# - "commit 0000000" with "new file mode 000000" and no content
# - Or just blank/empty results
# - Or "Path .env.local does not exist (but this path was touched by commits and so cannot be rewritten)"

# This is fine! It means the file is removed from history.
```

---

## TASK 1.6: CREATE .env.production

**Purpose**: Production environment configuration with NEW credentials  
**Time**: 60 minutes  
**Status**: Ready after Task 1.5

---

### STEP 1: Create .env.production from template (5 minutes)

```bash
cd /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS

# Copy the template
cp .env.example .env.production

echo ".env.production created from template!"
```

---

### STEP 2: Edit .env.production with NEW Credentials (40 minutes)

1. **Open** `.env.production` in your editor

2. **Replace each variable with YOUR production values:**

```bash
# ============================================================================
# SUPABASE - Database and Authentication
# ============================================================================

# Use SAME Supabase project as development (or create separate production project)
# Get these from Supabase Dashboard > Settings > API Keys
NEXT_PUBLIC_SUPABASE_URL=https://lqezaljvpiycbeakndby.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<NEW ANON KEY FROM TASK 1.1>
SUPABASE_SERVICE_ROLE_KEY=<NEW SERVICE ROLE KEY FROM TASK 1.1>

# ============================================================================
# APPLICATION URLS - PRODUCTION DOMAIN
# ============================================================================

# Replace with your actual production domain
# Example: https://whitedgelms.com or https://lms.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ============================================================================
# RAZORPAY - Payment Processing
# ============================================================================

# Use NEW keys from Task 1.2
RAZORPAY_KEY_ID=<NEW KEY ID FROM TASK 1.2>
RAZORPAY_KEY_SECRET=<NEW SECRET FROM TASK 1.2>

# ============================================================================
# EMAIL SERVICE (SMTP)
# ============================================================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@whiteboardconsultant.com
SMTP_PASSWORD=<NEW APP PASSWORD FROM TASK 1.4>
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=WhitedgeLMS

# ============================================================================
# GOOGLE GEMINI API
# ============================================================================

# Use NEW key from Task 1.3
GEMINI_API_KEY=<NEW GEMINI KEY FROM TASK 1.3>

# ============================================================================
# OPTIONAL: Analytics & Monitoring
# ============================================================================

# Get from Google Analytics
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX

# Get from Sentry.io (optional but recommended)
# SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# ============================================================================
# OPTIONAL: Feature Flags
# ============================================================================

FEATURE_ENABLE_PAYMENTS=true
FEATURE_ENABLE_AI_SUGGESTIONS=true
FEATURE_ENABLE_CERTIFICATES=true
FEATURE_ENABLE_MESSAGING=true

# ============================================================================
# NODE ENVIRONMENT
# ============================================================================

NODE_ENV=production
```

---

### STEP 3: Verify Production URLs (10 minutes)

Make sure you update these CRITICAL URLs:

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com    ← NOT localhost!
NEXT_PUBLIC_APP_URL=https://yourdomain.com     ← NOT localhost!
```

These are used for:
- Google OAuth redirects
- Certificate generation URLs
- Email verification links
- Password reset links

**If these are wrong:**
- OAuth login will fail
- Certificates will be broken
- Emails won't work
- Users will be confused

---

### STEP 4: Verify .env.production is NOT in git (5 minutes)

```bash
# Verify .gitignore has .env.production
grep ".env.production" .gitignore

# Should return: .env.production

# If not there, add it:
echo ".env.production" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env.production in gitignore"
```

---

### STEP 5: Create .env.production.notes.md (Optional, 5 minutes)

Create documentation for your team about production setup:

```bash
cat > .env.production.notes.md << 'EOF'
# Production Environment Setup Notes

## Credentials Rotation Date
- Date: October 21, 2025
- Rotated Keys:
  - Supabase: New anon + service role keys
  - Razorpay: New live credentials (rzp_live_...)
  - Gemini API: New key
  - Gmail: New app password

## Production Domain
- Primary: https://yourdomain.com
- Backup: https://www.yourdomain.com

## How to Deploy .env.production

This file should NEVER be committed to git.

Instead, on your hosting platform:

### If using Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from .env.production:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - etc.

### If using AWS:
1. Use AWS Secrets Manager
2. Or use Systems Manager Parameter Store
3. Configure in your deployment script

## Testing Production Build Locally

```bash
# Create production build locally
npm run build

# Test it
npm start

# Visit http://localhost:3000 with production config
# Test key features:
# - Login/signup
# - Course browsing
# - Payment processing (test mode)
# - Certificate generation
```

## Monitoring Production

- Error Tracking: Sentry (configured via SENTRY_DSN)
- Analytics: Google Analytics (configured via NEXT_PUBLIC_ANALYTICS_ID)
- Uptime: Set up UptimeRobot or similar

## Rollback Procedure

If something breaks in production:
1. Previous deployment can be restored via Vercel dashboard
2. Or roll back via git if simple code issue
3. Keep .env.production credentials secure in case of rollback

EOF

echo "Created .env.production.notes.md"
```

---

## Complete Checklist

### Task 1.5 - Git Cleanup

- [ ] Backed up entire WhitedgeLMS directory
- [ ] Verified .env.local is in .gitignore
- [ ] Ran `git filter-branch --tree-filter 'rm -f .env.local' HEAD -- --all`
- [ ] Ran `git push origin --force --all`
- [ ] Verified .env.local removed from history

### Task 1.6 - .env.production Setup

- [ ] Copied .env.example to .env.production
- [ ] Updated NEXT_PUBLIC_SUPABASE_URL
- [ ] Updated NEXT_PUBLIC_SUPABASE_ANON_KEY (NEW from Task 1.1)
- [ ] Updated SUPABASE_SERVICE_ROLE_KEY (NEW from Task 1.1)
- [ ] Updated NEXT_PUBLIC_SITE_URL (production domain)
- [ ] Updated NEXT_PUBLIC_APP_URL (production domain)
- [ ] Updated RAZORPAY_KEY_ID (NEW from Task 1.2)
- [ ] Updated RAZORPAY_KEY_SECRET (NEW from Task 1.2)
- [ ] Updated SMTP_PASSWORD (NEW from Task 1.4)
- [ ] Updated GEMINI_API_KEY (NEW from Task 1.3)
- [ ] Verified .env.production in .gitignore
- [ ] Created .env.production.notes.md for team

---

## Important Reminders

### DO ✅
- ✅ Keep .env.production backed up securely
- ✅ Share .env.production.notes.md with DevOps team
- ✅ Update environment variables on hosting platform
- ✅ Document your production domain

### DO NOT ❌
- ❌ Commit .env.production to git
- ❌ Share .env.production in Slack/email
- ❌ Use localhost URLs in production
- ❌ Forget to update on hosting platform

---

## Troubleshooting

### ❌ "git filter-branch" failed

**Problem**: Maybe .env.local doesn't exist in history or git error  
**Solution**:
1. Make sure you're in the right directory
2. Verify git is working: `git status`
3. Try again with: `git filter-branch --tree-filter 'rm -f .env.local' -- --all`

### ❌ "Push rejected" after filter-branch

**Problem**: Remote doesn't want to accept force push  
**Solution**:
1. Verify you have permission to force push
2. Check if branch protection is enabled
3. May need to temporarily disable branch protection

### ❌ Team members can't pull after force push

**Problem**: They need to sync with new history  
**Solution**:
1. Tell them to run: `git fetch origin && git reset --hard origin/main`
2. Or they might need to re-clone the repository

---

## What Just Happened?

✅ **`.env.local` REMOVED from git history** - old credentials can't be recovered from git  
✅ **.env.production CREATED** - ready for production deployment  
✅ **All NEW credentials in place** - old revoked credentials replaced  

**Status**: Phase 1 is now 80% complete! Just need to clean up logging.

---

## Next Phase

After Tasks 1.5 & 1.6 Complete ✅:

1. **Mark Tasks 1.5 & 1.6 Complete** in PHASE_1_EXECUTION_LOG.md
2. **Move to Phase 1 Part B**: Debug Logging Cleanup (8-12 hours)
3. **This involves**:
   - Replacing 100+ console.log statements
   - Using the new src/lib/logger.ts utility
   - Wrapping logs with development checks

---

**Status**: Ready to execute  
**Total Time**: ~1.5 hours  
**Effort**: Medium (mostly copying, pasting, and configuration)  
**Critical**: Yes - git cleanup + production setup are essential

When you've completed both tasks, reply with "Tasks 1.5 & 1.6 Complete"!

---

*Combined Time: 1.5 hours*  
*Difficulty: Medium*  
*Importance: 🔴 CRITICAL - Essential for production*

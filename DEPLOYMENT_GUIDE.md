# WhitedgeLMS - Production Deployment Guide

**Status:** Phase 1 Complete ✅  
**Date:** October 23, 2025  
**Target:** Vercel (recommended) or Alternative Platforms

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Options](#deployment-options)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Production Monitoring](#production-monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Phase 1 Verification

Before deploying, verify all Phase 1 tasks are complete:

```bash
# 1. Check git history is clean (no .env files)
git log --all --full-history --oneline -- .env | wc -l
# Expected: 0 (no .env files in history)

# 2. Verify current git status
git status
# Expected: "nothing to commit, working tree clean"

# 3. Check .env.local has production credentials
grep SMTP_HOST .env.local
grep RAZORPAY_KEY_ID .env.local
grep GEMINI_API_KEY .env.local
# Expected: All variables present with correct values

# 4. Verify build succeeds locally
npm run build
# Expected: "✓ Ready for production"
```

### 🔐 Credentials Verification

Your current production credentials:

| Service | Variable | Status | Notes |
|---------|----------|--------|-------|
| **Supabase** | NEXT_PUBLIC_SUPABASE_URL | ✅ | Configured |
| | NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | JWT-based |
| | SUPABASE_SERVICE_ROLE_KEY | ✅ | Admin operations |
| **Razorpay** | RAZORPAY_KEY_ID | ✅ | Live keys |
| | RAZORPAY_KEY_SECRET | ✅ | Live keys |
| **SMTP2GO** | SMTP_HOST | ✅ | mail.smtp2go.com:2525 |
| | SMTP_USER | ✅ | whiteboardconsultant.com |
| | SMTP_PASSWORD | ✅ | (hidden) |
| | SMTP_FROM_EMAIL | ✅ | info@whiteboardconsultant.com |
| **Gemini** | GEMINI_API_KEY | ✅ | Google AI |

### 📋 Pre-Deployment Steps

- [ ] All Phase 1 tasks completed (Tasks 1.1-1.6)
- [ ] Local build succeeds (`npm run build`)
- [ ] All credentials rotated and verified
- [ ] Git history cleaned (no .env files)
- [ ] `.env.production` template reviewed
- [ ] Domain name ready (if using custom domain)
- [ ] GitHub account ready with repository pushed
- [ ] Team access configured

---

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Pros:**
- Easiest setup (1-click integration with GitHub)
- Automatic SSL certificates
- Zero-config deployment
- Built-in environment variable management
- Automatic previews for pull requests
- Superior Next.js integration

**Cons:**
- Monthly cost ($20-50 depending on traffic)

**Time to Deploy:** 5-10 minutes

### Option 2: Railway

**Pros:**
- Simple UI
- Affordable ($5-50/month)
- GitHub integration

**Cons:**
- Requires some configuration

**Time to Deploy:** 15-20 minutes

### Option 3: Netlify

**Pros:**
- Free tier available
- Good for static sites

**Cons:**
- Requires serverless function setup for Next.js
- More complex configuration

**Time to Deploy:** 20-30 minutes

### Option 4: Self-Hosted (AWS/DigitalOcean)

**Pros:**
- Full control
- Potentially lower cost at scale

**Cons:**
- Complex setup
- Requires DevOps knowledge
- Ongoing maintenance

**Time to Deploy:** 1-2 hours

---

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# 1. Ensure you're on main branch
git checkout main

# 2. Verify git status is clean
git status
# Expected: "nothing to commit, working tree clean"

# 3. Verify remote is set (should already be done)
git remote -v
# Expected: 
# origin  git@github.com:Whiteboard-Consultants/WhitedgeLMS.git (fetch)
# origin  git@github.com:Whiteboard-Consultants/WhitedgeLMS.git (push)

# 4. Verify git history is clean (from Task 1.5)
# Should see output showing history was cleaned
git log --all --oneline -- .env | head -5
# Expected: (no results - .env not in history)
```

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account
5. Create a team or use personal account

### Step 3: Import Project to Vercel

**Via Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Search for "WhitedgeLMS"
5. Click "Import"

**Configuration Screen:**

- **Project Name:** `whitedgelms` (or your choice)
- **Framework Preset:** "Next.js"
- **Root Directory:** `./` (default)
- **Build and Output Settings:** (should auto-detect)

### Step 4: Set Environment Variables in Vercel

This is the critical step. Do NOT commit credentials to GitHub.

**In Vercel Dashboard:**

1. Click on your project → Settings
2. Go to "Environment Variables"
3. For each variable below, add it with scope = "Production"

**Required Environment Variables:**

```
# Supabase (Public - can see in browser)
NEXT_PUBLIC_SUPABASE_URL=https://lqezaljvpiycbeakndby.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase (Secret - NOT in browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URLs
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Razorpay (Keys - LIVE)
RAZORPAY_KEY_ID=rzp_live_RWVMrjSAANx4Lp
RAZORPAY_KEY_SECRET=BpMFLsVFQfQ6NpC4gKdHaF6H

# SMTP2GO (Email)
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=whiteboardconsultant.com
SMTP_PASSWORD=FtMk3K8ZMbbkJonF
SMTP_FROM_EMAIL=info@whiteboardconsultant.com
ADMIN_EMAIL=info@whiteboardconsultant.com
SMTP_SECURE=false

# Gemini API
GEMINI_API_KEY=AIzaSyDYYhgXfA786bcghVon1UPpXikNcskB6SU

# Next.js
NODE_ENV=production
```

**Important Notes:**
- Mark `SUPABASE_SERVICE_ROLE_KEY` as secret (don't expose in logs)
- Mark `RAZORPAY_KEY_SECRET` as secret
- Mark `SMTP_PASSWORD` as secret
- Mark `GEMINI_API_KEY` as secret
- Public variables can be marked as such

### Step 5: Add Domain (Optional)

If you have a custom domain:

1. Go to Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `whitedgelms.com`)
4. Follow DNS configuration instructions
5. Add CNAME record pointing to Vercel

For now, you'll get a default Vercel domain like: `whitedgelms.vercel.app`

### Step 6: Deploy

**Method A: Automatic (Recommended)**

1. Click "Deploy" button in Vercel
2. Vercel automatically builds and deploys
3. Watch deployment progress in real-time
4. Deployment typically takes 2-5 minutes

**Method B: Push to GitHub**

```bash
git push origin main
```

Vercel automatically detects push and redeploys.

### Step 7: Monitor Deployment

In Vercel Dashboard:

1. Watch the "Deployments" tab
2. Status progression:
   - 🟡 Queued
   - 🟡 Building
   - 🟡 Analyzing
   - 🟢 Ready (when complete)

3. Click on deployment to see:
   - Build logs
   - Output details
   - Performance metrics

---

## Post-Deployment Verification

### ✅ Immediate Checks (First 5 Minutes)

**Accessibility:**
```bash
# Test deployment is accessible
curl -I https://whitedgelms.vercel.app
# Expected: "HTTP/2 200" or "HTTP/1.1 200"
```

**In Browser:**
- [ ] Website loads on Vercel domain
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] Page renders properly
- [ ] CSS/images load (no styling issues)

**Console Check:**
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] Should see no errors
- [ ] Check Network tab for failed requests

### ✅ Functional Tests (First 30 Minutes)

**User Registration:**
```
1. Go to /auth/register
2. Enter test credentials
3. Click "Register"
4. Check email for verification link
5. Verify email in inbox
6. Complete registration
```

**User Login:**
```
1. Go to /auth/login
2. Enter test credentials
3. Click "Login"
4. Verify redirect to dashboard
5. Check user profile loads
```

**Dashboard:**
```
1. Verify dashboard loads
2. Check all navigation links work
3. Verify data displays (if applicable)
```

**Email Verification:**
```
1. Test registration email received
2. Verify email format looks correct
3. Check email header sender is correct
4. Verify links in email work
```

**Database Connection:**
```
1. Perform any data read operation
2. Verify data loads from Supabase
3. Perform any data write operation (if applicable)
4. Verify data is saved correctly
```

### ✅ Security Checks

**HTTPS/SSL:**
```bash
curl -v https://whitedgelms.vercel.app 2>&1 | grep "SSL"
# Expected: SSL connection with valid certificate
```

**Security Headers:**
```bash
curl -I https://whitedgelms.vercel.app | grep -i "security\|strict"
# Should see security headers
```

**Environment Variables:**
```
1. Open browser DevTools
2. Go to Console
3. Type: window.__ENV__
4. Should NOT see secret keys exposed
```

### ✅ Performance Checks

**Page Load Time:**
- [ ] Homepage loads in < 3 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] Navigation feels responsive

**Core Web Vitals (in Vercel Analytics):**
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

---

## Production Monitoring

### 1. Set Up Error Tracking (Optional)

Consider adding Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

Configuration (add to next.config.ts):
```typescript
import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  org: "your-sentry-org",
  project: "whitedgelms",
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

### 2. Vercel Analytics

Already included by default:

1. Go to Vercel Dashboard → your project
2. Click "Analytics" tab
3. View:
   - Page views
   - Response times
   - Error rates
   - Core Web Vitals

### 3. Uptime Monitoring

Use UptimeRobot (free tier available):

1. Go to https://uptimerobot.com
2. Create new monitor
3. Set URL: `https://whitedgelms.vercel.app`
4. Set interval: 5 minutes
5. Get alerts if site goes down

### 4. Daily Health Checks

Set a daily reminder to:

- [ ] Check Vercel dashboard for errors
- [ ] Check email delivery (if applicable)
- [ ] Check Razorpay payment notifications
- [ ] Monitor Supabase dashboard
- [ ] Review error logs

### 5. Weekly Tasks

- [ ] Review analytics in Vercel
- [ ] Check Core Web Vitals
- [ ] Review any error spikes
- [ ] Verify all external services responding
- [ ] Test critical user flows

---

## Troubleshooting

### Problem: Build Fails with "Cannot find module"

**Solution:**
1. Check all dependencies in package.json are correct
2. In Vercel, go to Settings → Build & Development Settings
3. Click "Override" for Build Command
4. Ensure it's: `npm ci && npm run build`

**Verify locally:**
```bash
rm -rf node_modules package-lock.json
npm ci
npm run build
```

### Problem: Environment Variables Not Working

**Solution:**
1. Verify all variables are set in Vercel → Settings → Environment Variables
2. Re-deploy after adding/changing variables
3. Check variable names exactly (case-sensitive)
4. For public variables, must start with `NEXT_PUBLIC_`

**Verify:**
```bash
# Redeploy to apply new variables
git commit --allow-empty -m "Redeploy to apply env vars"
git push origin main
```

### Problem: Email Not Sending

**Common Causes:**
1. SMTP credentials incorrect
2. SMTP_HOST not set
3. Email domain not verified in SMTP2GO

**Debug:**
1. Check SMTP credentials in Vercel env vars
2. Verify SMTP2GO account is active
3. Test locally with same credentials:
   ```bash
   npm run dev
   curl http://localhost:3000/api/test-email
   ```

### Problem: Database Connection Failed

**Causes:**
1. SUPABASE_SERVICE_ROLE_KEY incorrect
2. Supabase project URL wrong
3. IP not whitelisted

**Fix:**
1. Double-check credentials in Vercel
2. Verify Supabase URL: https://lqezaljvpiycbeakndby.supabase.co
3. In Supabase, check IP allowlist in Settings

### Problem: Payment Gateway Not Working

**Causes:**
1. RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET incorrect
2. Using test keys instead of live keys
3. Key format wrong

**Verify:**
1. Keys in Vercel must have `rzp_live_` prefix for live mode
2. Keys must match exactly from Razorpay dashboard
3. Razorpay account must be verified

### Problem: 500 Errors in Production

**Debug Steps:**
1. Check Vercel logs: Dashboard → Deployments → Build/Function logs
2. Check browser console for any client-side errors
3. Check Network tab to see error responses
4. Check Supabase logs for database errors
5. Review recent code changes

---

## Rollback Plan

If critical issues occur after deployment:

### Quick Rollback (< 5 minutes)

**Method 1: Vercel Rollback**
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." menu → Promote to Production
4. Confirm

**Method 2: Git Revert**
```bash
# Get last commit hash
git log --oneline | head -5

# Revert the problematic commit
git revert HEAD

# Push to trigger redeploy
git push origin main
```

---

## Next Steps After Successful Deployment

### Immediate (Hour 1)
- [ ] Verify all functionality working
- [ ] Check email delivery
- [ ] Process test payment (if applicable)
- [ ] Monitor error logs

### Short Term (Day 1)
- [ ] Set up monitoring (Sentry, UptimeRobot)
- [ ] Configure domain (if not done)
- [ ] Brief team on production process
- [ ] Document any deployment issues

### Medium Term (Week 1)
- [ ] Run security audit
- [ ] Performance optimization
- [ ] Set up automated backups
- [ ] Document runbook for team

### Long Term (Ongoing)
- [ ] Monitor metrics weekly
- [ ] Update dependencies monthly
- [ ] Rotate credentials quarterly
- [ ] Review access logs regularly
- [ ] Plan capacity for growth

---

## Support & Resources

**Vercel Documentation:**
- https://vercel.com/docs
- https://vercel.com/docs/concepts/deployments/overview
- https://vercel.com/docs/concepts/deployments/environments

**Next.js Production Checklist:**
- https://nextjs.org/learn/foundations/how-nextjs-works/rendering

**Supabase Deployment:**
- https://supabase.com/docs/guides/platform/going-to-production

**Troubleshooting:**
- Vercel Status: https://www.vercel-status.com
- Check GitHub status: https://www.githubstatus.com

---

## Deployment Checklist (Ready to Use)

Print this checklist and complete each item:

```
PRE-DEPLOYMENT
[ ] npm run build succeeds locally
[ ] git status clean
[ ] All credentials rotated (Phase 1)
[ ] Git history cleaned (Phase 1)
[ ] Vercel account created
[ ] GitHub repository ready

VERCEL SETUP
[ ] Project imported to Vercel
[ ] All environment variables set
[ ] Production scope configured
[ ] Deploy triggered

POST-DEPLOYMENT
[ ] Website accessible
[ ] No 500 errors
[ ] No console errors
[ ] Registration flow works
[ ] Login flow works
[ ] Email sending works
[ ] Database queries working
[ ] Security headers present

MONITORING
[ ] Vercel analytics configured
[ ] UptimeRobot monitoring active
[ ] Error notifications enabled
[ ] Team alerted to production URL

DOCUMENTATION
[ ] Team trained on production process
[ ] Runbook documented
[ ] Emergency contacts updated
[ ] Rollback procedure understood
```

---

## Emergency Contacts

When things go wrong:

| Service | Contact | Status |
|---------|---------|--------|
| Vercel Support | https://vercel.com/support | Always available |
| Supabase Support | https://supabase.com/support | See status page |
| SMTP2GO Support | https://www.smtp2go.com/contact | See status page |
| Razorpay Support | https://razorpay.com/contact | See status page |

---

**You're ready to deploy! 🚀**

*Last Updated: October 23, 2025*  
*Document Version: 1.0*

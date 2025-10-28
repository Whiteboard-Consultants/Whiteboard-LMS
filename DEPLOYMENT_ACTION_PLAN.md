# Production Deployment Action Plan

## Phase 1: Security Hardening (Priority 1 - Must Complete)

### Task 1.1: Credential Rotation [CRITICAL - Day 1]

**Steps:**
1. Go to Supabase Dashboard → Settings → API
   - [ ] Create new `anon` key
   - [ ] Create new `service_role` key
   - [ ] Update values in `.env.production`
   - [ ] Keep `.env.local` for development only

2. Razorpay → Settings → API Keys
   - [ ] Generate new API Key
   - [ ] Regenerate API Secret
   - [ ] Update both values in `.env.production`

3. Google Cloud Console → APIs & Services → Credentials
   - [ ] Regenerate Gemini API key
   - [ ] Restrict to specific URLs only
   - [ ] Set usage quotas (e.g., 1000 requests/day)

4. Gmail → Security → App Passwords
   - [ ] Revoke old app password
   - [ ] Generate new app password
   - [ ] Update in `.env.production`

**Verification:**
```bash
# After updating, test each service:
# - Supabase auth
# - Payments (Razorpay test mode)
# - Email sending
# - Gemini API calls
```

### Task 1.2: Git History Cleanup [CRITICAL - Day 1]

```bash
# 1. Stop anyone from accessing old keys (revoke them)
# 2. Remove from git history
git filter-branch --tree-filter 'rm -f .env.local' HEAD -- --all

# 3. Force push (warning: destructive)
git push origin --force --all

# 4. Verify .env.local is in .gitignore
grep ".env.local" .gitignore

# 5. Add production env files to gitignore
echo ".env.production" >> .gitignore
echo ".env.staging" >> .gitignore
git add .gitignore && git commit -m "chore: add env files to gitignore"
```

### Task 1.3: Remove Debug Logging [HIGH - Days 2-3]

**Step 1: Create logging utility**
```bash
# Create: src/lib/logger.ts
```
See file below for contents.

**Step 2: Find all console.logs**
```bash
grep -r "console\." src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l
# Expected: ~100+ matches
```

**Step 3: Replace systematically**
- Replace in `src/lib/supabase-auth.ts` (50+ instances)
- Replace in `src/lib/supabase-storage.ts` (15+ instances)  
- Replace in `src/hooks/use-auth.tsx` (20+ instances)
- Replace in API routes (various locations)

**Step 4: Create verification script**
```bash
# Verify all console.logs are wrapped
grep -r "console\." src/ --include="*.ts" --include="*.tsx" | \
  grep -v "if (isDev)" | \
  grep -v "node_modules"
# Result should be empty or minimal (only for critical errors)
```

---

## Phase 2: Environment Configuration (Days 3-4)

### Task 2.1: Create Environment File Template

**Create: `.env.production.template`**

```bash
# Supabase (replace with production project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URLs
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Google OAuth (create OAuth app in Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# Note: Secrets not needed for client, configured on Google Cloud Console

# Razorpay (LIVE keys for production)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-secret-key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@whiteboardconsultant.com
SMTP_PASSWORD=your-app-password

# AI/Content Generation
GEMINI_API_KEY=your-gemini-api-key

# Analytics (optional but recommended)
NEXT_PUBLIC_ANALYTICS_ID=GA-XXXXXXXXX-X
SENTRY_DSN=https://your-sentry-url

# Feature Flags (optional)
FEATURE_ENABLE_PAYMENTS=true
FEATURE_ENABLE_AI_SUGGESTIONS=true
```

### Task 2.2: Update next.config.ts

**Remove development-specific configurations:**

```typescript
// Remove Firebase references
// Ensure security headers are production-ready
// Test image optimization with production domain
```

### Task 2.3: Create Environment Documentation

**Create: `DEPLOYMENT_ENV_VARIABLES.md`**

Document each variable:
- What it is
- Where to get it
- If it's sensitive
- Rotation schedule

---

## Phase 3: Testing (Days 4-5)

### Task 3.1: Build Verification

```bash
# Clean build
rm -rf .next
npm run build

# Check for errors
# If you see "Build failed", fix errors (don't just ignore them)

# Test production build locally
npm run start
# Visit http://localhost:3000 and test:
# - User login
# - Course view
# - Enrollment
# - Payment flow
```

### Task 3.2: Security Audit

```bash
# Check for hardcoded secrets
grep -r "sk_live" src/
grep -r "AIzaSy" src/
grep -r "rzp_live" src/
# Should all be empty (use env vars only)

# Check for error message leaks
grep -r "error.message" src/app/api/
# Review each instance to ensure user-safe messaging
```

### Task 3.3: End-to-End Tests

- [ ] User registration and email verification
- [ ] Google OAuth login
- [ ] Password change
- [ ] Instructor course creation
- [ ] Student enrollment
- [ ] Payment processing (test mode first)
- [ ] Certificate generation and download
- [ ] Admin dashboard access
- [ ] Logout and session management

---

## Phase 4: Database Preparation (Days 5-6)

### Task 4.1: Execute Outstanding Migrations

In Supabase Dashboard → SQL Editor, execute:

```sql
-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  recipient_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  created_at timestamp DEFAULT now(),
  read_at timestamp
);

-- Verify other tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Task 4.2: Verify RLS Policies

In Supabase Dashboard → Security → Policies

- [ ] Users table: Proper read/write rules
- [ ] Courses table: Instructor write, student read
- [ ] Enrollments table: User can read own enrollments
- [ ] Notifications table: User can read own notifications

### Task 4.3: Set Up Database Backups

In Supabase Dashboard → Settings → Backups

- [ ] Enable daily automated backups
- [ ] Test restore procedure
- [ ] Document recovery steps

---

## Phase 5: Deployment Setup (Days 6-7)

### Task 5.1: Choose Hosting Platform

**Recommended: Vercel** (Optimal for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Will prompt for:
# - GitHub/GitLab/Bitbucket repository
# - Project name
# - Framework (select Next.js)
# - Root directory (.)
# - Build command (npm run build)
# - Output directory (.next)
```

**Alternative: AWS Amplify, DigitalOcean App Platform, Railway**

### Task 5.2: Configure Environment Variables on Platform

For **Vercel**:
```bash
vercel env pull .env.production
# Edit .env.production with actual values
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Repeat for each variable
```

### Task 5.3: Configure Custom Domain

- [ ] Register domain (GoDaddy, Namecheap, etc.)
- [ ] Point DNS to hosting platform
- [ ] Enable SSL/HTTPS
- [ ] Set up auto-renewal for certificates

### Task 5.4: Set Up Monitoring

1. **Error Tracking - Sentry**
   ```bash
   npm install @sentry/nextjs
   # Configure in next.config.ts and lib/sentry.ts
   ```

2. **Analytics - Google Analytics**
   ```bash
   # Add Google Analytics tag to _document
   # Configure NEXT_PUBLIC_ANALYTICS_ID
   ```

3. **Uptime Monitoring**
   - Use UptimeRobot (free tier available)
   - Monitor `/api/health` endpoint

---

## Phase 6: Final Pre-Launch (Day 7)

### Task 6.1: Load Testing

```bash
# Use artillery or similar
# Test expected concurrent users:
# - 50 concurrent users during peak hours
# - Test payment processing under load
# - Test email sending at scale
```

### Task 6.2: Security Headers Verification

Using https://securityheaders.com/:
```
1. Go to https://yourdomain.com
2. Scan with tool
3. Should see A or A+ rating
4. Fix any missing headers
```

### Task 6.3: Performance Optimization

- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Verify database query optimization
- [ ] Test payment flow performance

### Task 6.4: Final Checklist

- [ ] All environment variables set on hosting platform
- [ ] SSL certificate active and valid
- [ ] Custom domain configured and working
- [ ] Email service functional
- [ ] Razorpay test payments working
- [ ] Supabase backups enabled
- [ ] Monitoring and error tracking active
- [ ] All team members have access to production environment

---

## Phase 7: Launch (Day 8)

### Pre-Launch (1 hour before)

- [ ] Final smoke tests on production
- [ ] Verify all services responding
- [ ] Check error tracking is working
- [ ] Brief support team on critical issues

### Launch

- [ ] Announce service availability
- [ ] Monitor error tracking in real-time
- [ ] Have rollback plan ready
- [ ] Team on standby for 2 hours post-launch

### Post-Launch (First Week)

- [ ] Daily monitoring of error rates
- [ ] Performance metrics review
- [ ] User feedback collection
- [ ] Bug fixes as needed
- [ ] Weekly sync with team on issues

---

## Critical Files to Review Before Launch

1. ✅ `next.config.ts` - Security headers ✅
2. ⚠️ `.env.local` - Replace with `.env.production` 
3. ⚠️ `src/lib/supabase-auth.ts` - Remove debug logging
4. ⚠️ `src/lib/supabase-storage.ts` - Remove debug logging
5. ✅ `src/app/api/**/*.ts` - Verify error handling
6. ✅ `SUPABASE_MIGRATION_COMPLETE.md` - Review migration status

---

## Emergency Rollback Procedure

If critical issues arise:

```bash
# Option 1: Redeploy previous version
git revert HEAD~1
npm run build
# Redeploy to hosting platform

# Option 2: Disable problematic features
# Set feature flags to false in environment variables
# Redeploy

# Option 3: Database rollback
# Use Supabase automated backup to restore previous state
# Document exact steps beforehand
```

---

## Post-Launch Operations

### Daily
- [ ] Monitor error tracking (Sentry)
- [ ] Check performance metrics
- [ ] Review user reports

### Weekly
- [ ] Review analytics
- [ ] Performance optimization opportunities
- [ ] Database maintenance
- [ ] Security patches

### Monthly
- [ ] Full backup test
- [ ] Dependency updates
- [ ] Performance analysis
- [ ] Feature prioritization for next release

---

## Questions to Answer Before Launch

1. **Disaster Recovery**: If Supabase goes down, what's our RTO/RPO?
   - Answer: _______________________

2. **Scaling**: What happens if we get 10x the users?
   - Answer: _______________________

3. **Data Privacy**: Where is user data stored geographically?
   - Answer: _______________________

4. **Compliance**: What regulations apply (GDPR, FERPA, COPPA)?
   - Answer: _______________________

5. **Support**: Who's available for production issues 24/7?
   - Answer: _______________________

---

**Last Updated**: October 21, 2025  
**Status**: Ready for implementation

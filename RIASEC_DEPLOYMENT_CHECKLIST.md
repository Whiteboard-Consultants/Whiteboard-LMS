# RIASEC Assessment Tool - Deployment Checklist

Use this checklist to deploy the RIASEC assessment to production.

---

## 📋 Pre-Deployment (Development Environment)

### Database Setup
- [ ] Run migration: `/migrations/create_riasec_assessments_table.sql`
  ```bash
  # Via Supabase dashboard SQL editor or CLI
  ```
- [ ] Verify table created: `SELECT COUNT(*) FROM riasec_assessments;`
- [ ] Check RLS policies are enabled
- [ ] Test by inserting a test record

### Environment Configuration
- [ ] Copy `.env.riasec.example` to `.env.local`
- [ ] Configure email service (SMTP2GO recommended)
- [ ] Set `ADMIN_EMAIL` to your email
- [ ] Test email sending with test script

### Frontend Testing
- [ ] [ ] Run dev server: `npm run dev`
- [ ] [ ] Navigate to career solutions page  
- [ ] [ ] Click "Discover Your Career Path" button
- [ ] [ ] Submit registration form
  - [ ] Test with valid email
  - [ ] Test with invalid email (should error)
  - [ ] Test with password < 6 chars (should error)
  - [ ] Test with mismatched passwords (should error)
- [ ] [ ] Complete 10 quiz questions
  - [ ] Verify can't submit without all answered
  - [ ] Test back/forward navigation
  - [ ] Verify progress bar updates
- [ ] [ ] View results page
  - [ ] Check all 3 profiles display
  - [ ] Verify colors are correct
  - [ ] Check score bars render
  - [ ] Test copy button
  - [ ] Test share/email buttons

### Email Testing
- [ ] [ ] Student email received with:
  - [ ] Student name correct
  - [ ] All 3 profiles shown with descriptions
  - [ ] Job examples listed
  - [ ] Scores displayed
  - [ ] Next steps shown
  - [ ] Links work (not broken)
- [ ] [ ] Admin email received with:
  - [ ] Student name and email
  - [ ] All 6 scores
  - [ ] Top 3 profiles listed
  - [ ] Assessment date/time

### Error Handling
- [ ] [ ] Network error (unplug internet during submit) - should retry gracefully
- [ ] [ ] Invalid assessment ID - should show error
- [ ] [ ] Missing email config - should log error (not crash)
- [ ] [ ] Duplicate email registration - should show error

---

## 🚀 Deployment Steps (Production)

### Step 1: Database Migration (Production)

```bash
# Using Supabase dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of /migrations/create_riasec_assessments_table.sql
# 3. Paste into SQL editor
# 4. Click "Run"
# 5. Verify success message

# OR using Supabase CLI:
supabase db push
```

**Verify:**
```sql
SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'riasec_assessments');
```

### Step 2: Environment Variables (Production)

**Vercel/Netlify/your hosting:**

1. Go to environment variables settings
2. Add these variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Email Service (choose one: SMTP2GO shown)
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=[your-api-key]@smtp2go.com
SMTP_PASSWORD=[your-api-key]
SMTP_FROM_EMAIL=noreply@whiteboardconsultant.com
SMTP_SECURE=false

# Admin
ADMIN_EMAIL=admin@whiteboardconsultant.com
```

### Step 3: Update Career Solutions Page

Find your career solutions page template and update:

**Before:**
```tsx
// /src/app/(main)/career-solutions/page.tsx
<button>Explore All Programs →</button>
```

**After:**
```tsx
'use client';

import { RIASECButton } from '@/components/riasec';

export function CareerHeroBanner() {
  return (
    <section className="...">
      <div className="...">
        <h1>Ready to Build Your Portfolio?</h1>
        <p>Join our next internship cohort...</p>
        <RIASECButton />
      </div>
    </section>
  );
}
```

### Step 4: Deploy Code

```bash
# Standard Next.js deployment
git add .
git commit -m "feat: Add RIASEC career assessment"
git push origin main

# On Vercel/your hosting: auto-deploys from git push
# Wait for build to complete and deployment confirmation
```

### Step 5: Post-Deployment Testing (Production)

On live site:
- [ ] Click assessment button
- [ ] Complete registration with valid email
- [ ] Complete all 10 quiz questions  
- [ ] View results page
- [ ] Verify email received at inbox
- [ ] Test share/copy buttons work
- [ ] Check admin email for summary

---

## 📊 Post-Launch Monitoring

### Daily (First Week)
- [ ] Check email delivery status
- [ ] Monitor for errors in logs
- [ ] Verify assessments are being saved
- [ ] Check email bounce rates

### Weekly  
- [ ] Review admin analytics dashboard
- [ ] Monitor profile distributions
- [ ] Check for any error patterns
- [ ] Verify email formatting on various clients

### Monthly
- [ ] Generate reports on student interests
- [ ] Calculate conversion (assessment → enrollment)
- [ ] Gather user feedback
- [ ] Optimize based on data

---

## 🔍 Verification Scripts

### Verify Database
```sql
-- Check table exists
SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'riasec_assessments') as table_exists;

-- Check RLS enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'riasec_assessments';

-- Count assessments
SELECT COUNT(*) FROM riasec_assessments WHERE created_at > NOW() - INTERVAL '24 hours';

-- Check email delivery
SELECT COUNT(*) as "sent_to_student", COUNT(*) as "sent_to_admin"
FROM riasec_assessments
WHERE email_sent_to_student = true AND email_sent_to_admin = true;
```

### Verify APIs
```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/riasec/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User"}'

# Test submit endpoint (requires valid assessmentId)
curl -X POST http://localhost:3000/api/riasec/submit \
  -H "Content-Type: application/json" \
  -d '{"assessmentId":"uuid-here","responses":{"q1":"option1",...}}'
```

---

## 🆘 Rollback Plan

If something goes wrong:

### Option A: Hide Feature (5 minutes)
```tsx
// /src/components/riasec/RIASECButton.tsx
export function RIASECButton() {
  if (process.env.NEXT_PUBLIC_DISABLE_RIASEC === 'true') {
    return null; // Hide button
  }
  // ... rest of component
}
```

Then set `NEXT_PUBLIC_DISABLE_RIASEC=true` in production env vars.

### Option B: Remove Button (10 minutes)
```tsx
// Replace RIASECButton with original button in career solutions page
<button>Explore All Programs →</button>
```

### Option C: Full Rollback (20 minutes)
```bash
# If using git:
git revert [commit-hash]
git push origin main
# Wait for auto-deploy
```

---

## 📞 Support & Troubleshooting

### No emails being sent
1. Check `ADMIN_EMAIL` is set in production env vars
2. Verify SMTP2GO credentials: `SMTP_USER` and `SMTP_PASSWORD`
3. Check logs for error messages
4. Test SMTP2GO credentials in isolation

### Assessment not saving
1. Verify database migration ran successfully
2. Check Supabase service role key is valid
3. Look for "riasec_assessments" table in Supabase dashboard
4. Check browser console for API error messages

### Button not appearing on page
1. Check `RIASECButton` is imported correctly (client component)
2. Verify 'use client' directive at top of component file
3. Check for TypeScript errors: `npm run typecheck`
4. Clear `.next` build cache: `rm -rf .next && npm run build`

### Users can't register
1. Verify Supabase Auth is enabled
2. Check `SUPABASE_SERVICE_ROLE_KEY` is valid
3. Verify email isn't already registered in auth
4. Check browser console for error details

---

## 📈 Success Metrics to Track

After launch, monitor these KPIs:

```
1. Assessment Completion Rate
   = (completed) / (started) × 100%
   Target: > 80%

2. Profile Distribution
   = Students by primary profile type
   Use for: Program development decisions

3. Conversion to Enrollment
   = (enrolled after assessment) / (completed assessment) × 100%
   Target: > 15-25%

4. Email Delivery
   = (delivered) / (sent) × 100%
   Target: > 98%

5. Time to Complete
   = Average minutes to complete assessment
   Baseline: 5-8 minutes
```

---

## 🎯 Launch Announcement

Once live, you might want to announce in:
- [ ] Email to student list
- [ ] Social media posts
- [ ] Homepage banner
- [ ] Newsletter
- [ ] Advisor/staff training

**Sample announcement:**
> "Tired of endless career exploration? Try our new RIASEC Career Assessment! In just 10 minutes, discover your ideal career path. All it takes is a quick registration - results delivered to your inbox instantly!"

---

## ✅ Launch Checklist (Final)

Before flipping the switch to live:

- [ ] Database migration verified ✓
- [ ] Environment variables configured ✓
- [ ] Code deployed to production ✓
- [ ] Email service tested ✓
- [ ] Button appears on career solutions page ✓
- [ ] Complete flow tested end-to-end ✓
- [ ] Admin dashboard accessible ✓
- [ ] Error handling verified ✓
- [ ] Mobile responsive tested ✓
- [ ] Analytics queries working ✓
- [ ] Support team trained on system ✓
- [ ] Rollback plan documented ✓

**Once all checked:** Ready for production launch! 🚀

---

**Deployment Timeline:**
- Pre-deployment testing: 2-4 hours
- Actual deployment: 30 minutes
- Post-launch monitoring: Ongoing

**Success = Students taking assessments → Getting personalized results → Converting to enrollment**

---

For detailed information, see:
- `RIASEC_IMPLEMENTATION_SUMMARY.md` - Overview
- `RIASEC_ASSESSMENT_GUIDE.md` - Complete guide
- `.env.riasec.example` - Environment variable template

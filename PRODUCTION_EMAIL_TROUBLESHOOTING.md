# Production Email Not Sending - Troubleshooting Guide

## Status: Contact form submissions saved but emails not sent

### Root Cause
Your Vercel **production environment is missing the Gmail OAuth2 configuration**.

### Evidence

**Local Development (.env.local):** ✅ Has Gmail OAuth2 credentials
```
EMAIL_SERVICE=gmail-oauth2
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
GMAIL_USER=navnit.alley@whiteboardconsultant.com
```

**Production (Vercel):** ❌ Missing these variables
- Contact form submissions ARE being saved to database
- But NO emails are being sent because:
  1. EMAIL_SERVICE not set in Vercel
  2. Gmail OAuth2 variables not in Vercel
  3. SMTP2GO also not configured in Vercel

---

## How to Fix (Step by Step)

### Step 1: Verify Current Vercel Configuration

Go to: **https://vercel.com/dashboard**
1. Select **whiteboard-lms** project
2. Click **Settings** → **Environment Variables**
3. Check what variables are actually set:
   - Is `EMAIL_SERVICE` there?
   - Is `GMAIL_CLIENT_ID` there?
   - Is `GMAIL_REFRESH_TOKEN` there?

### Step 2: Add Missing Variables to Vercel

You need to add these 6 variables for **Production** environment:

| Variable | Value | Type |
|---|---|---|
| `EMAIL_SERVICE` | `gmail-oauth2` | Public |
| `GMAIL_CLIENT_ID` | `270610995591-44ljhomjib3d8j3qm0ccmatkc92obgq0.apps.googleusercontent.com` | Public |
| `GMAIL_CLIENT_SECRET` | `[Use the new secret from Google Cloud]` | Sensitive |
| `GMAIL_REFRESH_TOKEN` | `[Use the new token from OAuth flow]` | Sensitive |
| `GMAIL_USER` | `navnit.alley@whiteboardconsultant.com` | Public |
| `ADMIN_EMAIL` | `info@whiteboardconsultant.com` | Public |

**IMPORTANT:** Use the NEW credentials you just generated, not the old exposed ones.

### Step 3: Redeploy

1. Go to **Deployments**
2. Click latest deployment
3. Click **⋮** menu → **Redeploy**
4. Wait for it to complete (green checkmark)

### Step 4: Test Again

1. Go to https://whiteboard-lms.vercel.app/contact
2. Submit a test form
3. Check your email for:
   - Auto-reply from `info@whiteboardconsultant.com`
   - Check spam folder too

### Step 5: Check Vercel Logs If Still Not Working

1. Deployments → Latest → **Function Logs**
2. Submit test form
3. Look for error messages like:
   - "No email service configured" → Missing variables
   - "Invalid refresh token" → Token needs refresh
   - "SMTP auth failed" → Check credentials

---

## Quick Diagnostic

### What Should Happen (Flow)

```
User submits contact form
    ↓
Form saved to Supabase ✅
    ↓
sendAdminNotification() called
    ↓
createTransporter() checks for:
    1. SMTP2GO credentials (optional)
    2. Gmail OAuth2 credentials ← THIS ONE
    ↓
If Gmail OAuth2 found:
    - Get refresh token from env
    - Call Google API to get access token
    - Send email via Gmail SMTP
    ↓
Email delivered ✅
```

### What's Happening Now (Broken)

```
User submits contact form
    ↓
Form saved to Supabase ✅
    ↓
sendAdminNotification() called
    ↓
createTransporter() checks:
    1. SMTP2GO not configured ❌
    2. Gmail OAuth2 not found (missing env vars) ❌
    ↓
Throws error: "No email service configured"
    ↓
Email NOT sent ❌
```

---

## Email Service Priority (In Code)

The email service tries in this order:

```
1. SMTP2GO (if SMTP_USER & SMTP_PASSWORD exist)
2. Gmail OAuth2 (if GMAIL_CLIENT_ID & GMAIL_REFRESH_TOKEN exist)
3. Error: "No email service configured"
```

Currently in production: None of these are configured, so it fails at step 3.

---

## What You've Done Right

✅ Code is correctly set up to use Gmail OAuth2
✅ Local development works perfectly
✅ Contact form saves submissions to database
✅ Email templates are correct
✅ OAuth2 tokens are generated and valid

## What's Missing

❌ Vercel production environment variables not set
❌ Need to configure 6 variables in Vercel Settings
❌ Need to redeploy after adding variables

---

## Files Involved

- **Email sending logic:** `/src/lib/email-service.ts`
- **Contact form action:** `/src/app/contact/actions.ts`
- **Configuration (local):** `.env.local` ← Works locally
- **Configuration (production):** Vercel Settings ← Missing setup

---

## Checklist

- [ ] Verify Vercel has 6 email variables set
- [ ] Confirm EMAIL_SERVICE=gmail-oauth2 in Vercel
- [ ] Confirm GMAIL_CLIENT_ID in Vercel
- [ ] Confirm GMAIL_CLIENT_SECRET in Vercel
- [ ] Confirm GMAIL_REFRESH_TOKEN in Vercel
- [ ] Confirm GMAIL_USER=navnit.alley@whiteboardconsultant.com
- [ ] Confirm ADMIN_EMAIL=info@whiteboardconsultant.com
- [ ] Redeploy after adding variables
- [ ] Test with new contact form submission
- [ ] Check Vercel logs for errors

---

## Next Action

Take a screenshot of your Vercel Environment Variables page (Settings → Environment Variables) and show me:
1. What variables are currently set?
2. Are any email-related variables there?

This will help me see exactly what's missing.

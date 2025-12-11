# Contact Form Email Flow - Visual Guide

## Current Architecture (After Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│                  User Submits Contact Form                      │
│            https://whiteboard-lms.vercel.app/contact            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│      src/app/contact/actions.ts::saveContactSubmission()        │
│                                                                  │
│  1. Validate form data (firstName, lastName, email, phone, etc) │
│  2. Save to Supabase: contact_submissions table                 │
│  3. Return success to user immediately ✅                       │
│  4. Send emails asynchronously (non-blocking)                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
        ▼                        ▼
   ┌─────────┐           ┌──────────────┐
   │ Auto-   │           │ Admin        │
   │ Reply   │           │ Notification │
   │ Email   │           │ Email        │
   └────┬────┘           └──────┬───────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│         src/lib/email-service.ts::createTransporter()           │
│                                                                  │
│  Priority:                                                       │
│  1. Check for SMTP2GO credentials (optional fallback)           │
│  2. Check for Gmail OAuth2 (PRIMARY in production) ✅           │
│  3. Throw error if neither configured                           │
└────┬───────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Gmail OAuth2 Authentication                    │
│                                                                  │
│  Refresh Token (from env) ──▶ Google API ──▶ Access Token      │
│                                                                  │
│  Token cached for 55 minutes to avoid repeated API calls        │
│  Automatic refresh on token expiry                              │
└────┬───────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nodemailer + SMTP                            │
│                                                                  │
│  Server: smtp.gmail.com:587 (TLS)                               │
│  Auth: OAuth2 with access token                                 │
│  From: info@whiteboardconsultant.com                            │
│  Send email via Gmail SMTP servers                              │
└────┬───────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│         Emails Delivered via Gmail SMTP Network                 │
│                                                                  │
│  Email 1: User auto-reply (from info@whiteboardconsultant.com) │
│  Email 2: Admin notification (to info@whiteboardconsultant.com) │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Variables Required (Vercel Production)

```
GMAIL_CLIENT_ID ────────────────────────────────────▶ Public ID for OAuth2
GMAIL_CLIENT_SECRET ────────────────────────────────▶ Secret (kept secure in env)
GMAIL_REFRESH_TOKEN ────────────────────────────────▶ Refresh token (kept secure in env)
GMAIL_USER ─────────────────────────────────────────▶ Sender email address
EMAIL_SERVICE ──────────────────────────────────────▶ "gmail-oauth2" (must be this value)
ADMIN_EMAIL ─────────────────────────────────────────▶ Admin notification recipient
```

## Data Flow: Contact Submission

```
User Form Input
├─ firstName: "John"
├─ lastName: "Doe"
├─ email: "john@example.com"
├─ phone: "+1234567890"
├─ inquiryType: "Course Inquiry"
└─ message: "I'm interested in IELTS prep"
        │
        ▼
Supabase Database (contact_submissions table)
├─ first_name: "John"
├─ last_name: "Doe"
├─ email: "john@example.com"
├─ phone: "+1234567890"
├─ inquiry_type: "Course Inquiry"
├─ message: "I'm interested in IELTS prep"
├─ submitted_at: "2025-01-30T10:30:00.000Z"
└─ id: "uuid"
        │
        ▼
Send Email #1: Auto-Reply to User
┌─────────────────────────────────┐
│ From: info@whiteboardconsultant │
│ To: john@example.com            │
│ Subject: Thank you for reaching │
│          out - Course Inquiry    │
│                                 │
│ Body: Welcome template with     │
│       next steps and contact    │
│       information               │
└─────────────────────────────────┘
        │
        ▼
Send Email #2: Admin Notification
┌──────────────────────────────────┐
│ From: info@whiteboardconsultant  │
│ To: info@whiteboardconsultant    │
│ Subject: New Contact Form        │
│          Submission - Course     │
│          Inquiry                 │
│                                  │
│ Body: Admin template with all    │
│       contact details and        │
│       message content            │
└──────────────────────────────────┘
```

## Configuration Locations

```
LOCAL DEVELOPMENT
├─ File: .env.local
├─ Gmail Credentials: ✅ Present (saved during OAuth2 setup)
├─ Email Service: ✅ Working (uses Gmail OAuth2)
└─ Status: All emails sent successfully

PRODUCTION (Vercel)
├─ Location: Vercel Dashboard → Settings → Environment Variables
├─ Gmail Credentials: ⚠️ MUST BE ADDED MANUALLY
├─ Email Service: ❌ Currently not configured
└─ Action Required: Add all 6 Gmail OAuth2 variables

GIT REPOSITORY
├─ File: .env.production
├─ Contains: Template with instructions
├─ Secrets: NOT stored in git (security best practice)
├─ Status: ✅ Committed and pushed
└─ Note: Actual values only in Vercel, not in git
```

## Troubleshooting Decision Tree

```
User submits contact form
         │
         ▼
Is submission saved to database?
    NO ──────────────────────────▶ Check form validation
    YES
         │
         ▼
Received auto-reply email?
    NO ──┐
    YES │
         ▼
Received admin notification email?
    NO ──┐
    YES │
         ▼
    ✅ Everything working!

If emails not received:
         │
         ▼
Check Vercel Function Logs:
    Deployments → Click latest → Function logs
         │
         ▼
    Error message?
    │
    ├─ "No email service configured" ──▶ Missing env variables in Vercel
    ├─ "Invalid refresh token" ────────▶ Need to regenerate token
    ├─ "SMTP auth failed" ─────────────▶ Check env variable values
    └─ "Connection timeout" ──────────▶ May be firewall issue
```

## Security Checks ✅

```
✅ Client ID publicly visible
   └─ OK - it's the public OAuth2 client ID

⚠️ Client Secret must be secret
   └─ Protected - only in Vercel environment variables

⚠️ Refresh Token must be secret
   └─ Protected - only in Vercel environment variables

✅ .env.local in .gitignore
   └─ Local secrets not committed to Git

✅ .env.production in .gitignore
   └─ Production secrets not committed to Git

✅ GitHub Push Protection
   └─ Will block if actual tokens detected
```

## Files Involved

```
User Interface
└─ src/components/contact-page-client.tsx
   └─ Renders form, calls saveContactSubmission()

Contact Action Handler
└─ src/app/contact/actions.ts (UPDATED)
   ├─ Validates form data
   ├─ Saves to Supabase
   ├─ Calls sendAdminNotification()
   ├─ Calls sendAutoReply()
   └─ Enhanced error logging

Email Service (Core)
└─ src/lib/email-service.ts
   ├─ getGmailAccessToken() ─────▶ Refreshes OAuth2 token
   ├─ createTransporter() ───────▶ Creates Nodemailer instance
   ├─ sendAdminNotification() ───▶ Admin email template
   ├─ sendAutoReply() ───────────▶ User email template
   └─ TokenCache class ─────────▶ Caches tokens (5 min refresh buffer)

OAuth2 Setup
└─ get-oauth2-auth-url.js
   └─ Used to generate refresh token (run locally if token expires)

Configuration Files
├─ .env.local ────────────────────────▶ Development (git ignored)
├─ .env.production ───────────────────▶ Production template (git tracked)
└─ Vercel Dashboard environment vars ──▶ Production secrets (Vercel managed)
```

## Success Indicators

```
✅ Contact form submission saved to database
✅ Auto-reply email received by user
✅ Admin notification email received
✅ Vercel function logs show "Using Gmail OAuth2"
✅ No email service errors in logs
✅ Submission visible in admin dashboard
✅ All emails contain correct content and logo image
```

## Failure Indicators

```
❌ "No email service configured" ─────▶ Missing Vercel env variables
❌ "Invalid refresh token" ───────────▶ Token needs refresh
❌ "SMTP auth failed" ────────────────▶ Wrong credentials
❌ Emails sent but not received ──────▶ Check spam folder
❌ Vercel redeploy hangs ─────────────▶ Wait for deployment to finish
```

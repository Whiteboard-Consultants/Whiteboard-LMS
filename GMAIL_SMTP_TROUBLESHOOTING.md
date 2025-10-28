# 🔧 Gmail SMTP Authentication Troubleshooting

## Current Status

✅ **Password format is correct:** `jdughexmxmtciaal` (spaces removed)
✅ **.env.local is updated**
❌ **SMTP Error 535:** Username and Password not accepted

---

## Root Cause Analysis

SMTP Error 535-5.7.8 means Google rejected the credentials. Common reasons:

1. **2-Step Verification NOT enabled** (most common)
2. **App password created without 2-Step** (won't work)
3. **"Less Secure Apps" not enabled** (alternative method)
4. **Wrong email/password combination**
5. **Network/firewall blocking SMTP**

---

## Fix #1: Verify 2-Step Verification is Enabled

This is the MOST LIKELY issue.

**Step 1:** Go to https://myaccount.google.com/security

**Step 2:** Look for "2-Step Verification"
- If it says "Not set up" → YOU NEED TO ENABLE IT
- If it says "On" → It's enabled (good)

**Step 3:** If NOT enabled:
- Click "2-Step Verification"
- Follow Google's prompts
- Verify with your phone
- Once enabled, then create app password

**Step 4:** If already enabled:
- Go to "App passwords"
- Make sure you created a password for "Mail" on "Windows Computer" (or your device)
- Delete the old one if it exists
- Create a new one
- Copy it: should be 16 chars like `xxxx xxxx xxxx xxxx`
- **REMOVE SPACES** when adding to .env.local
- Test SMTP again

---

## Fix #2: Try "Less Secure App Access" (Alternative)

If app passwords still don't work, try this:

**Step 1:** Go to https://www.google.com/settings/security/lesssecureapps

**Step 2:** Toggle "Allow less secure apps" to ON

**Step 3:** In .env.local, use your MAIN Gmail password (not app password):
```
SMTP_PASSWORD=YourActualGmailPassword
```

**Step 4:** Restart dev server and test

**Note:** This is less secure but can work if app passwords fail.

---

## Fix #3: Verify Email/Password Match

Check that your .env.local has:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@whiteboardconsultant.com
SMTP_PASSWORD=jdughexmxmtciaal
SMTP_FROM_EMAIL=info@whiteboardconsultant.com
```

**Critical:** 
- ✅ SMTP_USER must match the Google account
- ✅ SMTP_PASSWORD must be the app password (without spaces)
- ✅ No extra quotes or characters

---

## Verification Checklist

- [ ] 2-Step Verification is ENABLED on Google account
- [ ] App password is created for Mail
- [ ] App password is 16 characters (4 groups of 4)
- [ ] Spaces are REMOVED in .env.local
- [ ] SMTP_USER matches Gmail account
- [ ] No extra quotes around password
- [ ] Dev server restarted after .env.local update
- [ ] Email test is retried

---

## How to Test SMTP

Once fixed, test with:

```bash
# In your app's email sending function
# Or use a simple mail test

curl -X POST http://localhost:3000/api/send-test-email
```

If you have a test endpoint, it should now send without 535 error.

---

## Still Not Working?

If you've tried both fixes and still getting 535 error:

1. **Screenshot the 2-Step Verification page** (show it's On)
2. **Screenshot the app passwords section** (show your Mail password)
3. **Confirm the password in .env.local** (no spaces, exact match)
4. **Share the email sending code** (if custom)

Then we can debug further!

---

## Next Steps

1. ✅ Go to https://myaccount.google.com/security
2. ✅ Check if 2-Step Verification is "On"
3. If NOT on: Enable it and create app password
4. If ON: Regenerate app password (delete old, create new)
5. ✅ Remove spaces from password in .env.local
6. ✅ Restart dev server
7. ✅ Test email again
8. Report back!

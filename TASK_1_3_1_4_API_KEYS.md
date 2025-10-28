# 🚨 PHASE 1, TASK 1.3 & 1.4: API KEY ROTATIONS - COMBINED GUIDE

**Criticality**: 🔴 CRITICAL  
**Estimated Time**: 1 hour total (30 min each)  
**Status**: Ready to execute after Task 1.2

---

## Summary

You have TWO more credential rotations:

| Task | Service | Current Status | Fix Time |
|------|---------|-----------------|----------|
| 1.3 | Gemini API | Key exposed | 30 min |
| 1.4 | Gmail App Password | Password exposed | 30 min |

Both are critical and relatively quick to fix.

---

## TASK 1.3: GEMINI API KEY ROTATION

**Purpose**: AI content suggestion feature  
**Current Exposed Key**: `AIzaSyCVTl7RSaWuygOiOcyeGGyL6Ek1-RgEMow`  
**Time**: 30 minutes

---

### STEP 1: Open Google AI Studio (5 minutes)

1. **Open**: https://aistudio.google.com/app/apikey
2. **Log in** with your Google account (that created the API key)
3. **You should see**: A list of your API keys

---

### STEP 2: Create New Gemini API Key (10 minutes)

1. **Look for**: "Create new API key" button (often at the top or in a menu)
2. **Click**: Create new API key
3. **Choose**: "Create API key in new project" OR "Create API key in existing project" (choose your WhitedgeLMS project)
4. **Wait**: 5-10 seconds for key generation
5. **Copy**: The NEW API key that appears

**Important**: The key should look like:
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

### STEP 3: Restrict the New Key (Optional but Recommended) (5 minutes)

1. **Go back** to API Keys page
2. **Find** your NEW key in the list
3. **Click** on it (or the settings icon)
4. **Configure**:
   - **API restrictions**: Allow only "Generative Language API"
   - **Application restrictions**: Restrict to website only
   - **Website restrictions**: Add your domain (e.g., yourdomain.com)
5. **Save** changes

---

### STEP 4: Delete or Disable Old Key (5 minutes)

1. **Find** your OLD key in the list: `AIzaSyCVTl7RSaWuygOiOcyeGGyL6Ek1-RgEMow`
2. **Click** on it
3. **Delete**: Look for delete button (🗑️ or "Delete")
4. **Confirm**: Accept the deletion warning
5. **Verify**: Old key no longer appears in list

---

### STEP 5: Update .env.local (5 minutes)

1. **Open**: `.env.local`
2. **Find**: `GEMINI_API_KEY=AIzaSyCVTl7RSaWuygOiOcyeGGyL6Ek1-RgEMow`
3. **Replace** with: Your NEW key
4. **Save** the file

---

### STEP 6: Test (Optional)

1. **Start dev server** (if not running): `npm run dev`
2. **Go to**: Any course page with AI suggestions feature
3. **Look for**: AI suggestion button
4. **Click**: Request AI suggestion
5. **Expected**: Should work without errors

---

## TASK 1.4: GMAIL APP PASSWORD ROTATION

**Purpose**: SMTP email sending  
**Current Exposed**: `cykmrsgnxeygbeak`  
**Time**: 30 minutes

---

### STEP 1: Enable 2FA on Gmail (if not already enabled) (5 minutes)

1. **Open**: https://myaccount.google.com/security
2. **Look for**: "Two-Step Verification"
3. **If enabled** ✅: Skip to STEP 2
4. **If disabled**: 
   - Click "Enable 2-Step Verification"
   - Follow prompts to set up (takes 5-10 min)
   - Return to these steps once enabled

---

### STEP 2: Navigate to App Passwords (5 minutes)

1. **Open**: https://myaccount.google.com/apppasswords
2. **You should see** a page like:
   ```
   Select the app and device you want to generate 
   the password for:
   
   [Select app ▼]
   [Select device ▼]
   ```
3. **If you see "Page not found"**: 2FA probably not enabled, go back to STEP 1

---

### STEP 3: Generate New App Password (10 minutes)

1. **Select app**: Choose "Mail" from the dropdown
2. **Select device**: Choose "Custom (Windows PC)" or similar (doesn't matter, just pick one)
3. **Or type**: "WhitedgeLMS" as custom name
4. **Click**: "Generate"
5. **Result**: A 16-character password appears
   ```
   Your app password for Mail on Windows PC:
   
   xxxx xxxx xxxx xxxx
   ```

---

### STEP 4: Copy the New Password (5 minutes)

1. **Highlight**: The 16-character password (without spaces)
2. **Copy**: To clipboard
3. **Save**: Into temporary file:
   ```bash
   cat > /tmp/gmail_new_password.txt << 'EOF'
   NEW_GMAIL_APP_PASSWORD=<paste your password here without spaces>
   EOF
   ```

---

### STEP 5: Delete Old App Password (5 minutes)

1. **Go back** to https://myaccount.google.com/apppasswords
2. **Look for**: Your OLD password entry labeled "Mail Windows PC" or similar
3. **Click**: The remove/delete button (🗑️) next to it
4. **Confirm**: Yes, delete it
5. **Verify**: Old password no longer in the list

---

### STEP 6: Update .env.local (5 minutes)

1. **Open**: `.env.local`
2. **Find**: `SMTP_PASSWORD=cykmrsgnxeygbeak`
3. **Replace** with: Your NEW 16-character app password (without spaces)
4. **Save** the file

**Important**: The password should NOT have spaces. Gmail shows it as:
```
xxxx xxxx xxxx xxxx
```
But enter it as:
```
xxxxxxxxxxxxxxxx
```

---

### STEP 7: Test Email Sending (Optional)

1. **Start dev server**: `npm run dev`
2. **Go to**: User registration page
3. **Sign up** with a test email
4. **Check**: The email for verification link
5. **Expected**: Email should arrive in inbox
6. **If email arrives** ✅: SMTP working with new password!

---

## Complete Checklist (Tasks 1.3 & 1.4)

### Task 1.3 - Gemini API

- [ ] Accessed https://aistudio.google.com/app/apikey
- [ ] Created new API key
- [ ] Copied new key
- [ ] Configured key restrictions (optional)
- [ ] Deleted old key
- [ ] Updated GEMINI_API_KEY in .env.local
- [ ] Verified AI features work (optional test)

### Task 1.4 - Gmail App Password

- [ ] Verified 2FA enabled on Google Account
- [ ] Accessed https://myaccount.google.com/apppasswords
- [ ] Generated new app password for Mail
- [ ] Copied new 16-character password
- [ ] Deleted old app password
- [ ] Updated SMTP_PASSWORD in .env.local
- [ ] Verified email sending works (optional test)

---

## Important Notes

### Gemini API

- Multiple projects might have different API keys
- Make sure you're in the right Google Cloud project
- Check "Quotas & Analytics" to see API usage
- Set daily quotas to prevent runaway charges

### Gmail App Password

- **Not your Gmail password** - this is a special app-specific password
- Each app can have its own password
- Can be revoked independently without affecting Gmail login
- Required because Gmail has 2FA enabled

---

## Troubleshooting

### Gemini API

**❌ "Invalid API key" error**
- Solution: Copy key again, no extra spaces
- Stop/restart dev server

**❌ "API not enabled" error**
- Solution: Go to Google Cloud Console, enable "Generative Language API"

### Gmail App Password

**❌ "Invalid credentials" when sending email**
- Solution: Verify you used app password, not Gmail password
- Verify no leading/trailing spaces
- Verify 2FA is enabled

**❌ "Cannot access app passwords page"**
- Solution: Enable 2-Step Verification first
- Try in incognito window
- Check your Google Account has proper permissions

---

## What Just Happened?

✅ **Old Gemini API key DELETED** - no longer functional  
✅ **New Gemini API key ACTIVE** - AI features work with new key  
✅ **Old Gmail app password DELETED** - can't receive emails with it  
✅ **New Gmail app password ACTIVE** - SMTP will send with new password  

---

## Next Steps

After Tasks 1.3 & 1.4 Complete ✅:

1. **Mark Tasks 1.3 & 1.4 Complete** in PHASE_1_EXECUTION_LOG.md
2. **Proceed to Task 1.5**: Git History Cleanup (15-30 min)
3. **Then Task 1.6**: Create .env.production (60 min)

---

**Status**: Ready to execute  
**Total Time**: ~1 hour  
**Effort**: Medium (mostly dashboard clicks)  
**Critical**: Yes - these are your only active API keys

When you've completed both tasks, reply with "Tasks 1.3 & 1.4 Complete"!

---

*Combined Time: 1 hour*  
*Difficulty: Medium (dashboard navigation + copy-paste)*  
*Importance: 🔴 CRITICAL - Exposed API credentials*

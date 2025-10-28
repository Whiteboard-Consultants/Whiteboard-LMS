# SMTP2GO Authentication Issue - Troubleshooting Guide

## Current Status
- ✅ SMTP2GO Account Created
- ✅ Sender Email Verified: `info@whiteboardconsultant.com`
- ✅ API Key Generated: `api-3357F090449F44FEA4F52836661E500D`
- ❌ SMTP Authentication Failing: Error 535 "Incorrect authentication data"

## Problem Analysis

The authentication is failing even though the sender is verified. This suggests one of the following:

### 1. **API Key Format Issue**
SMTP2GO API keys might need to be used differently. The typical format is:
- **Username:** `api`
- **Password:** The full API key

However, some SMTP providers require:
- **Username:** The full API key
- **Password:** Empty or "x"

### 2. **Account Permissions**
The API key might not have SMTP sending permissions enabled. This is typically configured in:
- SMTP2GO Dashboard → API Settings → Permissions

### 3. **IP Whitelisting**
SMTP2GO might have IP whitelist restrictions. Check:
- Settings → IP Whitelist/Firewall rules

## Next Steps to Verify

### Option A: Check SMTP2GO Dashboard Settings
1. Go to https://www.smtp2go.com/dashboard
2. Navigate to **Settings** → **API Keys**
3. Click on your API key to view details
4. Verify:
   - ✅ Status: **Active**
   - ✅ Permissions: Include **SMTP Sending**
   - ✅ IP Whitelist: **Disabled** or your IP is whitelisted
5. Check **Settings** → **SMTP Credentials** for exact format needed

### Option B: Try Alternative SMTP Credentials
SMTP2GO sometimes provides SMTP-specific credentials that differ from API keys:
1. Go to Dashboard → **Settings** → **SMTP Credentials**
2. Check if there are dedicated SMTP username/password
3. Try those instead of the API key

### Option C: Test with SendGrid Instead
If SMTP2GO continues to fail, SendGrid is an excellent alternative:
1. Create SendGrid account: https://sendgrid.com
2. Generate SMTP API key
3. Update .env.local:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.xxx...
   SMTP_SECURE=false
   ```

## Current Configuration

**File:** `.env.local`
```bash
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=api
SMTP_PASSWORD=api-3357F090449F44FEA4F52836661E500D
SMTP_FROM_EMAIL=info@whiteboardconsultant.com
SMTP_SECURE=false
```

**Test Endpoint:** `GET /api/test-email`

## Error Details

```
Error: Invalid login: 535 Incorrect authentication data
Response Code: 535
Command: AUTH PLAIN
```

This indicates:
- ✅ Server connection successful
- ❌ Authentication credentials rejected

## Action Items

**User Must Do (Next 5 minutes):**
1. [ ] Log into SMTP2GO dashboard
2. [ ] Verify API key settings and permissions
3. [ ] Check IP whitelist status
4. [ ] Report findings back

**Based on Findings:**
- If API key is wrong format → Update credentials
- If permissions missing → Enable SMTP sending
- If still failing → Switch to SendGrid or Gmail App Password

---

## Alternative: Gmail App Password

Since you have the Gmail account with 2-Step Verification already set up, you can use an **App Password**:

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (custom name)"
3. Enter "WhitedgeLMS"
4. Google generates a 16-character password
5. Update .env.local:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx (16-char password with spaces)
   SMTP_SECURE=false
   ```

This is actually simpler than OAuth2 and works reliably with Gmail's 2-Step Verification.

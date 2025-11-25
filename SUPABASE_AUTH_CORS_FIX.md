# Authentication CORS Issues - Root Cause & Solutions

## Problem Summary
Your application is experiencing CORS authentication failures both on:
- **Production** (`https://whiteboard-lms.vercel.app`)
- **Local development** (`http://localhost:3000`)

### Error Symptoms
```
CORS policy: No 'Access-Control-Allow-Origin' header
POST https://lqezaljvpiycbeakndby.supabase.co/auth/v1/token - Failed to fetch
Supabase returning 556 Internal Server Error
```

---

## Root Causes

### 1. **Supabase Project Issues** ⚠️ PRIMARY CAUSE
- Supabase returns 556 "Internal Server Error" 
- This suggests your project may be experiencing service issues
- Could indicate quota limits, rate limiting, or configuration problems

### 2. **CORS Configuration Missing**
- Your Vercel domain not whitelisted in Supabase
- localhost not added to CORS whitelist
- Browser making preflight requests that get blocked

### 3. **Environment Variables Not Set**
- Production deployment missing env variables
- This causes fallback to defaults, which may be invalid

---

## Solution Strategy

### Step 1: Verify Supabase Project Health

1. **Check Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select project: **whiteboard-lms** (ref: `lqezaljvpiycbeakndby`)
   - Check:
     - Project status (should be "Active")
     - Database status
     - Auth configuration
     - Any error notifications

2. **Check Your Quotas**
   - Dashboard → Settings → Usage
   - Verify you haven't exceeded:
     - Auth user limits
     - API rate limits
     - Database connections

3. **Verify API Keys**
   - Settings → API
   - Confirm keys are:
     - Not revoked
     - Not expired
     - Correct format (should start with specific prefixes)

### Step 2: Configure CORS in Supabase

1. **Add Your Domains to CORS Whitelist**
   - Supabase Dashboard → Settings → API
   - Under "CORS allow list", add:
     ```
     http://localhost:3000
     http://localhost:3001
     https://whiteboard-lms.vercel.app
     https://*.vercel.app
     ```

2. **Save Changes**
   - Click Save/Update
   - Changes take effect immediately

### Step 3: Set Production Environment Variables

**For Vercel Deployment:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **WhitedgeLMS** project
3. Go to **Settings → Environment Variables**
4. Add/Update ALL these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://lqezaljvpiycbeakndby.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZXphbGp2cGl5Y2JlYWtuZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzI0OTYsImV4cCI6MjA3NDA0ODQ5Nn0.FehxMVZlGq1w7NtuXlBlmCraa1mQJ5JpT6oML9PA_I8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZXphbGp2cGl5Y2JlYWtuZGJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ3MjQ5NiwiZXhwIjoyMDc0MDQ4NDk2fQ.4fzjOpiTl6cbLjI6_ClAp7I6r1ckgFNkrsE7mnAKMOw
NEXT_PUBLIC_SITE_URL=https://whiteboard-lms.vercel.app
NEXT_PUBLIC_APP_URL=https://whiteboard-lms.vercel.app
```

5. **Redeploy**: Click "Redeploy" on your latest deployment

### Step 4: Test Locally

After making changes:

1. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Restart dev server**: `npm run dev`
3. **Try to log in** with a test account

### Step 5: Verify SSL/TLS

Ensure Supabase domain has valid SSL:
```bash
curl -I https://lqezaljvpiycbeakndby.supabase.co
```

Should show `HTTP/1.1 200` with SSL certificate info.

---

## Implementation: Server-Side Auth Proxy

I've created a server-side authentication proxy (`/api/auth/signin`) that:
- Avoids direct CORS issues by calling Supabase server-to-server
- Returns secure cookies with tokens
- Handles JSON parsing errors gracefully

**How it works:**
1. Client calls `/api/auth/signin` with email/password
2. Server makes direct call to Supabase auth endpoint
3. Server receives tokens and sets secure cookies
4. Client receives session data

This approach bypasses browser CORS restrictions entirely.

---

## Testing Checklist

- [ ] Verify Supabase project status (Dashboard → Home)
- [ ] Check CORS whitelist includes localhost and your domains
- [ ] Verify environment variables are set correctly
- [ ] Clear browser cache
- [ ] Restart dev server
- [ ] Test login locally with valid credentials
- [ ] Test signup if needed
- [ ] Test production deployment after Vercel redeploy

---

## If Issues Persist

### Troubleshooting Steps

1. **Check Supabase Service Status**
   - Visit [https://status.supabase.com](https://status.supabase.com)
   - Check for ongoing incidents

2. **Verify Your Credentials Work**
   ```bash
   # Test directly with curl
   curl -X POST https://lqezaljvpiycbeakndby.supabase.co/auth/v1/token?grant_type=password \
     -H "Content-Type: application/json" \
     -H "apikey: YOUR_ANON_KEY" \
     -d '{"email":"test@example.com","password":"testpass"}'
   ```

3. **Contact Supabase Support**
   - If 556 errors persist, contact [Supabase Support](https://supabase.com/support)
   - Include:
     - Project reference: `lqezaljvpiycbeakndby`
     - Error code: 556
     - When it started happening

4. **As Last Resort: Recreate Supabase Project**
   - Export database schema
   - Create new Supabase project
   - Import schema
   - Update configuration

---

## Files Modified

1. `/src/lib/supabase.ts`
   - Added CORS configuration with credentials: 'include'
   - Added custom fetch handler

2. `/src/lib/supabase-auth.ts`
   - Updated `signInWithEmail()` to use `/api/auth/signin` proxy
   - Maintains session handling and user status checks

3. `/src/app/api/auth/signin/route.ts` (NEW)
   - Server-side auth endpoint
   - Calls Supabase REST API directly
   - Returns secure cookies
   - Handles errors gracefully

---

## Prevention: Best Practices

1. **Always use environment variables** - Never hardcode API keys
2. **Configure CORS early** - Do this in initial setup
3. **Monitor Supabase status** - Subscribe to status page
4. **Use server-side auth** for sensitive operations
5. **Implement retry logic** for network calls
6. **Test across environments** - Local, staging, production


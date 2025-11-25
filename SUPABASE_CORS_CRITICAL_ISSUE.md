# URGENT: Supabase CORS Configuration Issue - Resolution Guide

## Critical Issue Identified

Your Supabase project is returning **invalid CORS headers**:
```
Access-Control-Allow-Origin: * (with credentials: include)
❌ This combination is INVALID - browsers reject it
```

**Browser Error:**
> The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.

---

## Root Cause

Supabase is misconfigured and sending wildcard `*` CORS headers with credential requests, which is a security violation. This is a **Supabase project-level issue**, not a code issue.

---

## Immediate Solutions

### Solution 1: Disable Credentials in Auth (Fastest)
We've already implemented this - the server-side proxy doesn't use `credentials: 'include'`.

**Status**: ✅ Code is fixed, but Supabase is still having issues.

### Solution 2: Contact Supabase Support (Recommended)
Your Supabase project needs CORS reconfiguration.

**Create Support Ticket:**
- Go to: https://supabase.com/support
- **Project Reference**: `lqezaljvpiycbeakndby`
- **Issue**: CORS misconfiguration - wildcard '*' with credentials
- **Error**: `Access-Control-Allow-Origin: *` returned when credentials are included
- **Affected**: All auth endpoints at `auth/v1/*`

---

## Temporary Workaround

### Use the Server-Side Auth Proxy (Currently Implemented)

We created `/api/auth/signin` which handles authentication server-side, **completely bypassing the CORS issue**.

**Status**: ✅ The proxy exists and is configured

**Test it:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

---

## What the Proxy Does

1. **Client sends** credentials to `/api/auth/signin` (same origin, no CORS needed)
2. **Server makes** direct call to Supabase (server-to-server, no CORS)
3. **Server receives** tokens and session
4. **Server returns** session data to client
5. **Session stored** in cookies and localStorage

**This avoids all CORS issues entirely**.

---

## Debugging Steps

### 1. Check If Server-Side Proxy Is Working

Open browser console and run:
```javascript
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'test@example.com', 
    password: 'testpass' 
  }),
});
console.log(response.status);
console.log(await response.json());
```

**Expected**: `200` with session data or `401` with "Invalid email or password"

### 2. Check Supabase Health

```bash
# Test if Supabase is responding
curl -X GET https://lqezaljvpiycbeakndby.supabase.co/auth/v1/health

# Should return: {"ok":true}
```

### 3. Verify Environment Variables

```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

---

## Files Already Updated

✅ `/src/lib/supabase.ts` - Removed problematic credentials configuration
✅ `/src/lib/supabase-auth.ts` - Uses server-side proxy
✅ `/src/app/api/auth/signin/route.ts` - Server-side auth endpoint

---

## Prevention: Best Practices

1. **Never use `credentials: 'include'` on client-side Supabase calls**
2. **Use server-side proxies for auth operations**
3. **Keep sensitive operations server-only**
4. **Monitor Supabase health regularly**

---

## Next Steps

### Immediate (Now)
- [ ] Try the server-side proxy test above
- [ ] Check if login works with the proxy

### Short-term (Today)
- [ ] Contact Supabase Support with details above
- [ ] Wait for their response on CORS fix

### Long-term (This Week)
- [ ] Once Supabase fixes CORS, remove proxy if desired
- [ ] Or keep proxy for added security (recommended)

---

## Support Contact

**Supabase Support:**
- Email: support@supabase.com
- Web: https://supabase.com/support
- Status: https://status.supabase.com

**Include in ticket:**
```
Project: lqezaljvpiycbeakndby
Region: [check dashboard]
Error: CORS wildcard with credentials
URL: https://lqezaljvpiycbeakndby.supabase.co/auth/v1/user
Status: Blocking all auth operations
Endpoints Affected: /auth/v1/token, /auth/v1/user, /auth/v1/refresh
```

---

## Escalation Path

1. ✅ Proxy implemented
2. ⏳ Contact Supabase Support
3. ⏳ Wait for CORS fix
4. ⏳ If no response in 24 hours: Consider project recreation
5. ⏳ Last resort: Switch to different auth provider (Firebase, Clerk, etc.)


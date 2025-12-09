# Password Reset Configuration Guide

## Issue: "Invalid or Expired Reset Link"

If users are getting the error "Invalid or expired reset link", it's likely due to Supabase auth settings.

## Solution: Configure Redirect URLs in Supabase Dashboard

**Your domains:**
- Local: `http://localhost:3000`
- Production: `https://whiteboard-lms.vercel.app`

1. **Go to Supabase Dashboard** → Your Project → Authentication → URL Configuration

2. **Add these URLs to "Redirect URLs":**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000
   https://whiteboard-lms.vercel.app/auth/callback
   https://whiteboard-lms.vercel.app
   ```

3. **Also set "Site URL"** to:
   - For local development: `http://localhost:3000`
   - For production (Vercel): `https://whiteboard-lms.vercel.app`

⚠️ **Important:** Supabase validates the redirect URL. If it's not in this list, you'll get "invalid_link" error.

## How Password Reset Works

### Flow 1: Email Link (Recommended)
```
User clicks "Forgot Password"
    ↓
Sends email to Supabase
    ↓
Supabase sends recovery email with link
    ↓
User clicks link → `/auth/callback?code=XXX&type=recovery`
    ↓
Callback route validates and redirects to `/reset-password?code=XXX`
    ↓
Form exchanges code for session and updates password
    ↓
Redirects to login
```

### Flow 2: Temporary Password (Admin Only)
```
Admin clicks "Set Temporary Password" on user
    ↓
System sets password to "password123"
    ↓
Admin shares password with user
    ↓
User logs in with temporary password
    ↓
User changes password in settings
```

## Testing

Run these commands to test:

```bash
# Check if Supabase admin client is working
curl http://localhost:3000/api/test-password-reset

# Request password reset
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Environment Variables

Make sure `.env.local` has:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Key Files

- `src/app/auth/callback/route.ts` - Handles recovery code from email
- `src/components/reset-password-form.tsx` - Password reset UI
- `src/app/(auth)/reset-password/actions.ts` - Server-side password update logic
- `src/app/(main)/admin/users/actions.ts` - Admin password reset functions

## Troubleshooting

### "Invalid or expired reset link"
- Check Supabase URL Configuration
- Verify redirect URLs are whitelisted
- Check that `NEXT_PUBLIC_SITE_URL` is correct
- Links expire after 24 hours

### "Code exchange failed"
- Check browser console (F12)
- Look for specific error message
- Verify recovery code format is correct
- Check that Supabase admin client has permissions

### Email not received
- Check Supabase email configuration
- Verify email provider is set up
- Check spam/junk folder
- Verify email address is correct in system

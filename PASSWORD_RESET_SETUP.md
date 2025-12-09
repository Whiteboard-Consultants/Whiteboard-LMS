# Password Reset Configuration Guide

## ✅ Issue Resolved: Improved Password Reset Flow

The password reset system has been **completely rebuilt** for a better user experience:

### What's New
- **Server-side code exchange**: Recovery codes are now exchanged for sessions on the server (more secure, more reliable)
- **Simplified client flow**: The reset form no longer handles code exchange complexity
- **Better error handling**: Clear error messages when links are invalid or expired
- **No admin workaround needed**: The email link flow should work reliably now

## How the New Password Reset Works

### Email Link Flow (Recommended)
```
1. User clicks "Forgot Password"
   ↓
2. User enters email, system sends recovery email via Supabase
   ↓
3. User clicks link in email: https://whiteboard-lms.vercel.app/auth/callback?code=XXX
   ↓
4. Callback Route (Server-side):
   - Exchanges code for session (server-side - more reliable)
   - Sets authentication cookies
   - Redirects to /reset-password
   ↓
5. Reset Password Form:
   - Detects valid session
   - Displays password reset form
   - User enters new password
   ↓
6. Form submits:
   - Updates password using authenticated session
   - Signs user out
   - Redirects to login
```

### Admin Temporary Password (Backup Option)
```
1. Admin clicks "Set Temporary Password" in user management
   ↓
2. System sets password to "password123" (instant, no email needed)
   ↓
3. Admin shares password with user
   ↓
4. User logs in and changes password in settings
```

## Configuration Requirements

### 1. Supabase Redirect URLs
Make sure these are configured in Supabase Dashboard → Authentication → URL Configuration:

```
http://localhost:3000/auth/callback
http://localhost:3000
https://whiteboard-lms.vercel.app/auth/callback
https://whiteboard-lms.vercel.app
```

### 2. Site URL
Set in Supabase → Authentication → URL Configuration → Site URL:
- Local: `http://localhost:3000`
- Production: `https://whiteboard-lms.vercel.app`

### 3. Environment Variables
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (or production domain)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Key Files

- **`src/app/auth/callback/route.ts`** - Handles recovery code exchange (server-side)
  - Exchanges `code` parameter for session
  - Sets authentication cookies
  - Redirects to reset password form
  
- **`src/components/reset-password-form.tsx`** - Password reset UI
  - Verifies session is valid
  - Shows simple password form
  - Updates password once submitted
  
- **`src/app/(auth)/reset-password/actions.ts`** - Server action for password update
  - Uses authenticated session to update password
  
- **`src/app/(main)/admin/users/actions.ts`** - Admin password functions
  - `sendPasswordResetEmail()` - Sends recovery email
  - `setTemporaryPassword()` - Sets temporary password

## Testing

### Test Email Reset Flow (Local)
```bash
# 1. Start dev server
npm run dev

# 2. Go to login page, click "Forgot Password"
# 3. Enter email address
# 4. Check terminal logs for recovery link (in dev mode)
# 5. Copy the /auth/callback URL
# 6. Open it in browser
# 7. Should see password reset form
# 8. Enter new password and submit
```

### Test Admin Method
```bash
# 1. Go to admin → Users
# 2. Find a test user
# 3. Click dropdown menu
# 4. Click "Set Temporary Password" (purple button)
# 5. Password is now "password123"
# 6. User can login with that password
```

## Troubleshooting

### "Your password reset link is invalid or has expired"
- Check Supabase redirect URLs are configured (see Configuration section)
- Verify Site URL matches your domain
- Try sending a new reset email
- Check email actually arrived (not in spam)

### "Code exchange failed" (in server logs)
- This shouldn't happen with new flow, but if it does:
  - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
  - Check Supabase project is accessible
  - Try requesting a new password reset email

### Password update fails after reset link
- User might not have a valid session
- Try requesting new reset email
- Check browser cookies are enabled
- Check for Supabase connection errors in browser console

### Email not received
- Verify Supabase email configuration is enabled
- Check email provider (Resend/SendGrid) is set up
- Verify email address is correct in system
- Check spam/junk folder
- Links expire after 24 hours

## Why This Approach Is Better

✅ **Server-side code exchange** - More secure, reduces client-side complexity  
✅ **Cleaner UI** - Simple password form without code handling logic  
✅ **Better error handling** - Clear messages for invalid/expired links  
✅ **Works with Supabase config** - No workarounds needed  
✅ **Same experience as password reset flow** - Users are familiar with this pattern  

## Alternative: Admin Temporary Password

If email delivery is slow or unreliable in your region:

1. Admin can set temporary password instantly (no email needed)
2. User logs in with temporary password
3. User changes password in their settings
4. More control for admins, but less self-service for users

Both methods are now available and working!

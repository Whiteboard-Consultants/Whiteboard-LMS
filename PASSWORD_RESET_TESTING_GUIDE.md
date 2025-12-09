# Password Reset - Testing Guide

## 🧪 How to Test Locally

### Prerequisites
- Project running: `npm run dev`
- Terminal visible for logs
- User account in system

---

## Test 1: Email Reset Link Flow (Development)

### Step 1: Request Password Reset
```
1. Open http://localhost:3000/forgot-password
2. You should see:
   ┌─────────────────────────────────┐
   │ Reset Your Password             │
   │ Enter your email to receive...  │
   │                                 │
   │ [Email input field]             │
   │ [Send Reset Email button]       │
   └─────────────────────────────────┘

3. Enter email: test@example.com
   (Use an email that exists in your database)

4. Click "Send Reset Email"
   
5. Look at terminal output:
   You should see something like:
   ┌─────────────────────────────────────────┐
   │ 🔐 Recovery link generated for:         │
   │ test@example.com                        │
   │                                         │
   │ http://localhost:3000/auth/callback?    │
   │ code=eyJhbGciOiJIUzI1NiIsInR5cCI...   │
   └─────────────────────────────────────────┘

✅ Expected: Email form closes, message appears
❌ If fails: Check browser console for errors
```

### Step 2: Use Recovery Link
```
1. Copy the full callback URL from terminal
   
2. Open it in browser
   └─ Full URL: http://localhost:3000/auth/callback?code=...
   
3. You should see:
   ┌─────────────────────────────────┐
   │ Verifying your reset link...    │
   │                                 │
   │ [Loading spinner]               │
   └─────────────────────────────────┘

4. Wait 1-2 seconds
   
5. Form should appear:
   ┌──────────────────────────────────┐
   │ Reset Your Password              │
   │                                  │
   │ New Password                     │
   │ [Password input field]      [👁]│
   │                                  │
   │ Confirm Password                 │
   │ [Password input field]           │
   │                                  │
   │ [Reset Password button]          │
   └──────────────────────────────────┘

✅ Expected: Password form appears
❌ If verifying doesn't end: Check network tab (F12)
❌ If error message: URL might be expired or invalid
```

### Step 3: Reset Password
```
1. In the password form:
   ├─ New Password: "NewPassword123"
   └─ Confirm Password: "NewPassword123"

2. Click "Reset Password"
   
3. You should see:
   ├─ Form button shows "Resetting..."
   ├─ Success toast: "Password reset successfully!"
   └─ Page redirects to /login

4. Login page appears:
   ┌────────────────────────────────┐
   │ Sign In                        │
   │ [Email input]                  │
   │ [Password input]               │
   │ [Sign In button]               │
   └────────────────────────────────┘

✅ Expected: Redirected to login
❌ If password update fails: Check errors in console
```

### Step 4: Login with New Password
```
1. On login page:
   ├─ Email: test@example.com
   └─ Password: NewPassword123

2. Click "Sign In"
   
3. If successful:
   └─ Redirected to /student/dashboard
   
4. Confirm you're logged in:
   ├─ Avatar shows in top right
   ├─ Can see student courses
   └─ Navigation shows logged-in state

✅ Expected: Login successful with new password
❌ If login fails: New password wasn't saved properly
```

---

## Test 2: Admin Temporary Password

### Step 1: Go to Admin Users
```
1. Login as admin user
   ├─ Email: admin@whiteboard.com
   └─ Password: [admin password]

2. Navigate to: http://localhost:3000/admin/users
   
3. You should see user list:
   ┌──────────────────────────────────────────┐
   │ Users Management                         │
   │                                          │
   │ [Search box]                             │
   │                                          │
   │ Name        Email           Actions      │
   │ ─────────────────────────────────────    │
   │ John Doe    john@test.com    [⋯]       │
   │ Jane Smith  jane@test.com    [⋯]       │
   │ Test User   test@test.com    [⋯]       │
   └──────────────────────────────────────────┘

✅ Expected: User list loads
❌ If 403 error: Not authenticated as admin
```

### Step 2: Click Dropdown Menu
```
1. Find the test user
   └─ Click the [⋯] menu button on their row

2. Dropdown menu appears:
   ┌──────────────────────────────────┐
   │ 🔑 Send Password Reset Email     │
   │ 🛡️ Set Temporary Password        │
   │ ✏️  Edit User                    │
   │ 🗑️  Delete User                  │
   └──────────────────────────────────┘

✅ Expected: Menu options visible
❌ If menu doesn't open: Check browser console
```

### Step 3: Set Temporary Password
```
1. Click "🛡️ Set Temporary Password"
   
2. Success message appears:
   "Temporary password set to: password123"
   
3. Confirm in admin toast:
   └─ Green notification at top
   
4. Tell the user:
   "Your temporary password is: password123"

✅ Expected: Instant confirmation message
❌ If fails: Check admin permissions
```

### Step 4: User Logs In with Temp Password
```
1. User goes to /login
   
2. Enters:
   ├─ Email: test@example.com
   └─ Password: password123
   
3. Clicks "Sign In"
   
4. Logs in successfully
   └─ Can see dashboard

✅ Expected: Login works with temp password
❌ If fails: Password wasn't set properly
```

### Step 5: User Changes Password in Settings
```
1. User logged in, goes to Settings

2. Finds "Change Password" section

3. Enters:
   ├─ Current Password: password123
   └─ New Password: TheirOwnPassword456
   
4. Clicks "Save"

5. Success message

✅ Expected: Password changed
❌ If fails: Check password validation
```

---

## Test 3: Error Cases

### Invalid/Expired Link
```
1. Manually construct invalid URL:
   └─ http://localhost:3000/auth/callback?code=invalid123
   
2. Open in browser
   
3. Form shows error:
   "Your password reset link is invalid or expired"
   
4. Button says "Request New Reset Link"

✅ Expected: Clear error message
❌ If crashes: Error handling needs fix
```

### Missing Code Parameter
```
1. Visit callback without code:
   └─ http://localhost:3000/auth/callback
   
2. Redirects to reset page with error
   
3. Shows message with "Request New Reset Link"

✅ Expected: Graceful error
```

### Form Validation
```
Test: Password too short
├─ Password: "short"
└─ Error: "Password must be at least 8 characters"

Test: Passwords don't match
├─ Password: "ValidPassword123"
├─ Confirm: "DifferentPassword"
└─ Error: "Passwords do not match"

Test: Empty fields
├─ Password: [blank]
└─ Error: "Please enter your password"

✅ Expected: All validation errors show
```

---

## Test 4: Browser Console Logging

### What to Look For

When testing, open Developer Tools (F12) and check Console tab:

#### Successful Flow Logs
```
🔍 Verifying recovery session...
✅ Valid recovery session found for: test@example.com
🔐 Updating password with recovery session...
✅ Password reset successfully
```

#### Callback Route Logs (In Terminal)
```
🔐 Auth callback received: { 
  code: 'eyJhbGciOiJIUzI1...',
  origin: 'http://localhost:3000'
}
🔄 Exchanging recovery code for session...
✅ Session created for user: test@example.com
```

#### Error Logs
```
❌ Verification error: Auth error: invalid_link
❌ Reset error: Failed to update password
```

---

## Test 5: Mobile Testing

### Using Mobile Browser (or Emulation)

```
1. Open DevTools (F12)
   └─ Press Ctrl+Shift+M (or Cmd+Shift+M on Mac)
   
2. Select device (iPhone, Android, etc.)
   
3. Test forgot password flow:
   ├─ Go to /forgot-password
   ├─ Enter email
   ├─ Copy recovery link
   ├─ Open in browser
   └─ Complete reset
   
4. Verify:
   ├─ Form is responsive
   ├─ Buttons work
   ├─ Keyboard appears correctly
   ├─ No layout issues

✅ Expected: Works same as desktop
```

---

## Test 6: Stress Test

### Multiple Resets
```
1. Request password reset 3 times
   └─ All should work
   
2. Use only the latest link
   └─ Latest link should work
   └─ Old links should fail with "invalid"
   
3. Very quick succession:
   ├─ Request reset
   ├─ Immediately request again
   ├─ Use newest link
   └─ Should work fine

✅ Expected: No issues with multiple requests
```

### Concurrent Tests
```
1. Open 2 browser windows
   ├─ Window 1: request reset as user A
   ├─ Window 2: request reset as user B
   
2. In each window:
   ├─ Use their respective recovery link
   ├─ Set their own new password
   ├─ Login
   
3. Both should work independently

✅ Expected: No cross-contamination
```

---

## Test Checklist

### Functionality
- [ ] Forgot password form appears
- [ ] Email validation works
- [ ] Recovery link generated (in terminal)
- [ ] Recovery link opens callback route
- [ ] Callback exchanges code successfully
- [ ] Reset form appears after verification
- [ ] Password validation works
- [ ] Passwords match check works
- [ ] Reset button submits form
- [ ] Success message appears
- [ ] Redirect to login works
- [ ] New password works for login

### Admin Method
- [ ] Admin can access users page
- [ ] Dropdown menu appears
- [ ] "Set Temporary Password" works
- [ ] Success message shows
- [ ] User can login with temp password
- [ ] User can change password in settings

### Error Handling
- [ ] Invalid link shows error
- [ ] Expired link shows error
- [ ] Missing code shows error
- [ ] Too-short password rejected
- [ ] Mismatched passwords rejected
- [ ] Empty fields rejected

### UI/UX
- [ ] Loading state shows while verifying
- [ ] Form is responsive
- [ ] Password visibility toggle works
- [ ] Error messages are clear
- [ ] Success messages are clear
- [ ] No console errors
- [ ] No TypeScript errors

### Mobile
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Keyboard handling correct
- [ ] Form layout responsive
- [ ] Buttons clickable

---

## Troubleshooting Test Failures

### "Verifying..." Doesn't Complete
```
Check:
1. Browser console (F12) for errors
2. Network tab (F12) for API calls
3. Terminal logs for callback errors
4. Verify code is complete in URL
5. Check Supabase connection

If still stuck:
└─ Try requesting new reset email
```

### "Invalid Link" Appears Immediately
```
Check:
1. Is URL valid and complete?
2. Has more than 24 hours passed?
3. Is Supabase configured correctly?
4. Check browser cookies (F12 > Storage)
5. Check if user still exists in DB

If still stuck:
└─ Request new reset email
```

### Password Update Fails
```
Check:
1. Is password 8+ characters?
2. Are passwords identical?
3. Check browser console for errors
4. Check form didn't show validation error
5. Check admin permissions

If still stuck:
└─ Use admin temporary password instead
```

### Email Link Not Received
```
Check:
1. Wait a few minutes (emails can be slow)
2. Check spam/junk folder
3. Check terminal logs (dev mode)
4. Verify email address exists in system
5. Check Supabase email settings

If still stuck:
└─ Use admin temporary password method
```

---

## Performance Testing

### Load Time
```
From clicking "Send Reset Email" to form appearing:
Expected: < 2 seconds
Acceptable: < 5 seconds
```

### Database
```
Check Supabase logs:
1. Dashboard → Logs
2. Should see user_recovery_codes table updates
3. Should see auth.users updates
4. No errors in logs
```

### Network
```
In DevTools Network tab:
1. /auth/callback → 300 redirect (fast)
2. /reset-password → 200 OK (fast)
3. Password update API → 200 OK
4. No failed requests
5. No large payloads
```

---

## Success Indicators

All tests pass when you see:

✅ Forgot password form works  
✅ Email/recovery link generated  
✅ Reset form appears after verification  
✅ Password resets successfully  
✅ New password works for login  
✅ Admin temp password works  
✅ All error cases handled  
✅ Mobile friendly  
✅ No console errors  
✅ No TypeScript errors  

---

## Deployment Testing

### Before Deploying to Production

1. Run full test suite above locally
2. Verify build succeeds: `npm run build`
3. Deploy to Vercel
4. Test one user flow on production
5. Monitor Vercel & Supabase logs
6. If issues, revert: `git revert [commit]`

---

**All tests should pass before declaring the feature complete.**

Last updated: December 9, 2025

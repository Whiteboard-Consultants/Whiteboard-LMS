# Google OAuth Integration for RIASEC Assessment

## Overview

Google OAuth has been successfully integrated into the RIASEC Assessment flow, allowing users to sign up and sign in using their Google accounts instead of email/password.

## Implementation Details

### Components Modified/Created

1. **RIASECRegistration Component** (`/src/components/riasec/RIASECRegistration.tsx`)
   - Added Google OAuth button with official Google logo
   - Visual divider ("Or continue with") between email form and OAuth option
   - `handleGoogleSignIn()` function that calls the Google auth endpoint
   - Works for both signup and signin modes

2. **Google Auth Endpoint** (`/src/app/api/riasec/google-auth/route.ts`)
   - POST endpoint that generates Supabase Google OAuth URL
   - Receives: `redirectUrl` in request body
   - Returns: `{ success: true, url: <oauth_url> }`
   - Redirects to: `/auth/callback`

3. **OAuth Callback Handler** (`/src/app/auth/callback/route.ts`)
   - GET route that handles redirect from Google OAuth provider
   - Detects OAuth callbacks by checking for `access_token` in URL hash with `token_type=bearer`
   - Creates assessment record for new Google users
   - Checks existing assessment and reuses it if found
   - Redirects back to home page with `?oauth=true&from=riasec`
   - Also handles password reset callbacks for backward compatibility

## Flow Diagram

```
1. User clicks "Continue with Google" button
   ↓
2. Browser calls /api/riasec/google-auth (POST)
   ↓
3. Endpoint returns Supabase OAuth URL
   ↓
4. Browser redirects to: https://[supabase-url]/auth/v1/oauth2/authorize?provider=google&redirect_to=[callback-url]
   ↓
5. User logs in with their Google account
   ↓
6. Google redirects back to /auth/callback with tokens in URL hash
   ↓
7. Callback route handler:
   - Detects OAuth tokens (access_token + token_type=bearer)
   - Gets Supabase session automatically
   - Checks if user has existing assessment record
   - Creates new assessment if missing
   - Redirects to home with ?oauth=true&from=riasec
   ↓
8. Home page detects oauth flag and opens RIASEC modal
   ↓
9. User can now take the RIASEC quiz
```

## Environment Configuration

The following must be configured in Supabase dashboard:

1. **Google OAuth Provider**
   - Navigate to: Authentication > Providers > Google
   - Enable the provider
   - Add Google OAuth credentials (from Google Cloud Console)
   - Authorized redirect URI: `https://[your-domain]/auth/v1/callback`

2. **Environment Variables** (already in .env.local)
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for backend only)

## Database Changes

No schema changes required. Uses existing `riasec_assessments` table:
- `user_id` - From Supabase auth
- `email` - From Google account email
- `full_name` - From Google account profile (or email prefix fallback)
- `created_at` - Auto-timestamp
- `is_completed` - Tracks assessment status

## Testing Checklist

- [ ] Click RIASEC button on home page
- [ ] See registration form with both email and Google options
- [ ] Click "Continue with Google" button
- [ ] Redirected to Google login page
- [ ] Complete Google authentication
- [ ] Redirected back to `/auth/callback` (see loading spinner)
- [ ] After ~1 second, redirected to home page
- [ ] Assessment record created in database
- [ ] Can proceed directly to quiz
- [ ] Complete quiz and verify scoring works
- [ ] Verify email sent successfully
- [ ] Test signin path with existing Google user
- [ ] Verify email/password auth still works (regression test)

## User Experience

### New User (Google Sign-up)
1. Click RIASEC button → See registration form
2. Click "Continue with Google"
3. Authenticate with Google
4. Automatically redirected to quiz
5. Takes assessment normally

### Existing User (Google Sign-in)
1. Click RIASEC button → See registration form
2. Switch to "Sign In" tab
3. Click "Continue with Google"
4. Authenticate with Google
5. If assessment exists: Load quiz from where they left off (if not completed)
6. If assessment doesn't exist: Create new assessment and start fresh quiz

## Error Handling

- **Failed OAuth initiation**: Shows error message in form
- **Failed assessment creation**: Falls back to home page
- **Session issues**: Falls back to home page with timeout
- **Network errors**: Displays error message

## Security Considerations

1. **Callback validation**: The callback page validates the session before creating any database records
2. **Row-Level Security**: All database writes use RLS policies scoped to the authenticated user
3. **Service role key**: Only used on backend for creating assessment records (not exposed to client)
4. **Supabase session**: Google OAuth session is managed entirely by Supabase

## API References

### Google Auth Endpoint
```
POST /api/riasec/google-auth

Request:
{
  "redirectUrl": "https://domain.com/auth/callback"
}

Response (Success):
{
  "success": true,
  "url": "https://[supabase-url]/auth/v1/oauth2/authorize?provider=google&redirect_to=..."
}

Response (Error):
{
  "error": "Failed to initiate Google authentication"
}
```

### Callback Page
```
GET /auth/callback?access_token=...&refresh_token=...&expires_in=...

Process:
1. Retrieves Supabase session from URL
2. Fetches existing assessment for user
3. Creates assessment if missing
4. Redirects to: /?oauth=true&from=riasec
```

## Troubleshooting

### "Callback page is blank/loading forever"
- Check browser console for errors
- Verify Supabase credentials are correct
- Check that redirect URL matches in Supabase OAuth settings

### "Assessment not created"
- Check that `riasec_assessments` table exists
- Verify RLS policies allow inserts
- Check server logs for database errors

### "Keep redirecting to Google login"
- Ensure browser allows cookies/session storage
- Clear browser cache and try again
- Check that OAuth provider is enabled in Supabase

### "Google button doesn't work"
- Verify `/api/riasec/google-auth` endpoint returns valid URL
- Check `NEXT_PUBLIC_SUPABASE_URL` environment variable
- Clear build cache: `rm -rf .next && npm run build`

## Future Enhancements

1. **Remember device**: Add "Remember this device" checkbox to skip OAuth on future visits
2. **Link accounts**: Allow users to link email/password account with Google OAuth
3. **Social sharing**: Post assessment results directly to social media
4. **Multi-provider**: Add GitHub, Microsoft, GitHub OAuth providers
5. **Magic links**: Add passwordless email authentication

## Related Files

- Component: `/src/components/riasec/RIASECRegistration.tsx`
- Endpoint: `/src/app/api/riasec/google-auth/route.ts`
- Callback: `/src/app/auth/callback/route.ts`
- Main orchestrator: `/src/components/riasec/RIASECAssessment.tsx`
- Home integration: `/src/components/home-page-client.tsx`

## Questions?

For issues or questions about the Google OAuth integration, refer to:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Previous session notes in this repository

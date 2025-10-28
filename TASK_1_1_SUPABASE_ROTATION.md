# 🚨 PHASE 1, TASK 1.1: SUPABASE KEY ROTATION - MODERN APPROACH

**Criticality**: 🔴 CRITICAL  
**Estimated Time**: 45-50 minutes  
**Approach**: Publishable Key + New Secret Key (Modern Best Practice)  
**Status**: Ready to execute

---

## Current Exposed Credentials

Your `.env.local` currently has these Supabase credentials visible in the repository:

```
NEXT_PUBLIC_SUPABASE_URL=https://lqezaljvpiycbeakndby.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**Risks**:
- ⚠️ Service role key is especially dangerous (full database access)
- ⚠️ Anyone with these keys can impersonate your application
- ⚠️ Database can be read, modified, or deleted

---

## Execution Strategy: Modern Best Practice

This task uses **Supabase's current best practice approach**:

✅ **Create NEW Publishable Key** (replaces Legacy Anon Key)
✅ **Create NEW Secret Key** (replaces Legacy Service Role Key)
✅ **Revoke OLD keys** (complete credential rotation)

**Why this approach?**
- ✅ Supabase officially recommends Publishable keys over Legacy Anon keys
- ✅ More granular control and security
- ✅ Future-proof for production
- ✅ Complete credential rotation (defense in depth)
- ✅ Modern security best practice

**Timeline:**
- API Key Setup: 5 min
- Create Publishable Key: 10 min
- Create New Secret Key: 10 min
- Update .env.local: 10 min
- Test & Verify: 5 min
- **Total: 40-50 minutes**

---

## What You'll Be Doing

```
CURRENT STATE (Exposed)
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOi...EXPOSED...
└─ SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOi...EXPOSED...

↓ AFTER TASK 1.1

SECURE STATE (Rotated)
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY: <NEW Publishable Key>
└─ SUPABASE_SERVICE_ROLE_KEY: <NEW Secret Key>

✅ Old credentials: Revoked & invalid
✅ New credentials: Active & secure
```

---

---

## Step-by-Step: Create New Publishable Key

## Step-by-Step: Create New Publishable Key

### STEP 1: Open Supabase Dashboard (5 minutes)

1. **Open**: https://app.supabase.com
2. **Log in** with your Supabase account
3. **Select project**: Click on your WhitedgeLMS project
4. **Go to**: Left sidebar → **Settings** → **API**

You'll see two tabs at the top:
- **Legacy API Keys** ← Your old exposed keys are here
- **API Keys** ← Where you create new Publishable/Secret keys

5. **Click**: On the **"API Keys"** tab (the modern one)

---

### STEP 2: Create New Publishable Key (10 minutes)

**In the API Keys tab:**

1. **Look for**: A button labeled "Create API Key" or "New API Key"
2. **Click** it
3. **Fill in the form:**
   ```
   Name: WhitedgeLMS_Publishable_Key
   Type: Publishable (for browser/public use)
   Permissions: [Select appropriate permissions for client-side]
   ```
4. **Select Permissions**: For a Publishable key, you typically want:
   - ✅ Read access to necessary tables
   - ✅ Write access (if users can modify their data)
   - ✅ Authentication access
5. **Click**: "Create API Key"
6. **Copy**: The new Publishable Key (it will show in the UI)
7. **Save** temporarily:
   ```bash
   cat > /tmp/new_supabase_keys.txt << 'EOF'
   NEW_PUBLISHABLE_KEY=<paste here>
   NEW_SECRET_KEY=<you'll get this next>
   EOF
   ```

**What it looks like:**
```
✅ Created: WhitedgeLMS_Publishable_Key
   Type: Publishable
   Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...NEW...
```

---

### STEP 3: Create New Secret Key (10 minutes)

**Still in the API Keys tab:**

1. **Look for**: "Create API Key" button again
2. **Click** it
3. **Fill in the form:**
   ```
   Name: WhitedgeLMS_Secret_Key
   Type: Secret (for server-side only - .env.local / backend)
   Permissions: [Full database access]
   ```
4. **Select Permissions**: For a Secret key, you typically want:
   - ✅ Full read/write access (bypasses RLS)
   - ✅ All tables
   - ✅ This is your backend/server key
5. **Click**: "Create API Key"
6. **Copy**: The new Secret Key
7. **Save** to your temporary file:
   ```bash
   # Update the temp file
   cat > /tmp/new_supabase_keys.txt << 'EOF'
   NEW_PUBLISHABLE_KEY=<your publishable key>
   NEW_SECRET_KEY=<paste secret key here>
   EOF
   ```

**What it looks like:**
```
✅ Created: WhitedgeLMS_Secret_Key
   Type: Secret
   Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...SECRET...
```

---

### STEP 4: Update .env.local (10 minutes)

### STEP 4: Update .env.local (10 minutes)

Now update your local environment file with the NEW keys:

1. **Open**: `.env.local` in your editor
2. **Find**: `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
3. **Replace** with: Your NEW Publishable Key
4. **Find**: `SUPABASE_SERVICE_ROLE_KEY=...`
5. **Replace** with: Your NEW Secret Key
6. **Save** the file

**Example (don't copy these, use your actual new keys):**

```bash
# NEXT_PUBLIC_SUPABASE_URL - keep the same
NEXT_PUBLIC_SUPABASE_URL=https://lqezaljvpiycbeakndby.supabase.co

# OLD ANON KEY (LEGACY - TO BE REVOKED)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...LEGACY...

# NEW PUBLISHABLE KEY (SECURE - CREATED TODAY)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Y...PUBLISHABLE...

# OLD SERVICE ROLE KEY (LEGACY - TO BE REVOKED)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...LEGACY...

# NEW SECRET KEY (SECURE - CREATED TODAY)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Y...SECRET...
```

**After saving:**
```bash
# Verify your changes
grep "SUPABASE" ~/.env.local | head -2
# Should show 2 lines with your new keys
```

---

### STEP 5: Revoke Old Legacy Keys (5 minutes)

Now go back to Supabase and remove the old exposed credentials:

1. **In Supabase Dashboard**: Settings → API → **Legacy API Keys** tab
2. **Find**: Your old Anon Key and Service Role Key
3. **For each key**:
   - **Click**: The disable/delete button (usually ❌ or trash icon)
   - **Confirm**: "Yes, I want to disable this key"
   - **Verify**: Key is marked as disabled/revoked

**Result:**
```
✅ Legacy Anon Key: DISABLED
✅ Legacy Service Role Key: DISABLED
```

**⚠️ Important**: If you have multiple projects or API keys, make SURE you're disabling the RIGHT ones for WhitedgeLMS.

---

### STEP 6: Test Connection (5 minutes)

Now verify the new keys work:

```bash
# Stop any running dev server first
pkill -f "next dev"

# Start fresh
cd /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS
npm run dev
```

Then:
1. **Visit**: http://localhost:3000 in your browser
2. **Test**: Try to sign up or sign in
3. **Expected**: Login/signup should work normally
4. **If error**: You may have pasted keys wrong, try again

**If it works**: ✅ Supabase keys rotated successfully!

---

---

## Verification Checklist

✅ **Complete when all are checked:**

- [ ] Accessed Supabase dashboard
- [ ] Navigated to Settings → API → "API Keys" tab
- [ ] Created NEW Publishable Key (WhitedgeLMS_Publishable_Key)
- [ ] Copied NEW Publishable Key to temp file
- [ ] Created NEW Secret Key (WhitedgeLMS_Secret_Key)
- [ ] Copied NEW Secret Key to temp file
- [ ] Updated `.env.local` with NEW Publishable Key
- [ ] Updated `.env.local` with NEW Secret Key
- [ ] Verified .env.local has the new keys
- [ ] Disabled OLD Legacy Anon Key in Supabase
- [ ] Disabled OLD Legacy Service Role Key in Supabase
- [ ] Dev server starts without errors
- [ ] Can sign up/login on the app
- [ ] No "Unauthorized" errors
- [ ] No database access errors

---

## Troubleshooting

### ❌ "Invalid JWT" or "Unauthorized" error

**Problem**: Old keys are still in use somehow  
**Solution**:
1. Stop dev server: `pkill -f "next dev"`
2. Verify `.env.local` has NEW keys (not old ones)
3. Clear any browser cache: Open DevTools → Application → Clear cache
4. Restart: `npm run dev`

### ❌ "Cannot connect to Supabase" error

**Problem**: Wrong URL or API keys  
**Solution**:
1. Double-check `NEXT_PUBLIC_SUPABASE_URL` matches dashboard
2. Verify anon key starts with "eyJhbGciOi..."
3. Verify service role key also starts with "eyJhbGciOi..."

### ❌ "Key mismatch" on Supabase dashboard

**Problem**: You might be looking at the wrong project  
**Solution**:
1. Go to: https://app.supabase.com
2. Look for your project name at the top
3. Make sure you're in the right one

---

---

## What Just Happened?

✅ **Old keys are now DISABLED** - anyone with the legacy credentials can no longer access your database
✅ **New keys are now ACTIVE** - your app uses Publishable and Secret keys (modern approach)
✅ **`.env.local` is updated** - development environment ready with secure credentials
✅ **Complete rotation** - Both browser and backend credentials replaced

**Security improvements:**
- ✅ Publishable Key: Purpose-built for browser use with granular permissions
- ✅ Secret Key: Purpose-built for backend/server use with full database access
- ✅ Granular Control: Each key has specific permissions (not "all or nothing")
- ✅ Modern Standard: Follows Supabase's current best practices

**Important**: 
- Don't commit `.env.local` to git (it's in `.gitignore`)
- These development keys are different from production keys (which we'll set up later in Task 1.6)
- The old Legacy keys are now useless even if someone finds them

---

## Troubleshooting

### ❌ "Invalid JWT" or "Unauthorized" error

**Problem**: App is still trying to use old keys  
**Solution**:
1. Stop dev server: `pkill -f "next dev"`
2. Verify `.env.local` has NEW keys (not old ones)
3. Double-check you copied the full key (no spaces before/after)
4. Clear browser cache: Open DevTools → Application → Clear cache
5. Restart: `npm run dev`

### ❌ "Cannot create API key" error

**Problem**: Permission issue creating new keys  
**Solution**:
1. Verify you're logged in as project owner
2. Check you're in the right project
3. Try refreshing the page
4. Contact Supabase support if error persists

### ❌ "Key permissions error" when testing

**Problem**: New Publishable Key doesn't have right permissions  
**Solution**:
1. Go back to Supabase: Settings → API → API Keys
2. Find your Publishable Key
3. Click to edit permissions
4. Ensure you have read/write for tables you need
5. Update permissions
6. Test again

### ❌ Old keys still work

**Problem**: Old keys haven't been revoked yet  
**Solution**:
1. Go to Supabase: Settings → API → Legacy API Keys
2. Make sure you actually DISABLED them (not just left them)
3. Click the disable button clearly
4. Confirm the action
5. Verify they show as "Disabled"

---

## Advanced: Troubleshooting Key Permissions

If you get permission errors, you may need to adjust Publishable Key permissions:

```bash
# In Supabase Dashboard, for your Publishable Key:
✅ Permissions needed (typical):
   - users table: SELECT, INSERT, UPDATE
   - profiles table: SELECT, INSERT, UPDATE
   - enrollments table: SELECT, INSERT, UPDATE
   - Any public tables: SELECT, INSERT, UPDATE
   - Authentication: ✅ Enabled

# Your Secret Key permissions (should already be set):
✅ Full access to all tables
✅ All operations (SELECT, INSERT, UPDATE, DELETE)
✅ Backend operations enabled
```

If unsure, start with "Read + Write" for all tables, then restrict after testing.

---

## Next Steps

1. **Mark Task 1.1 Complete** in PHASE_1_EXECUTION_LOG.md
2. **Proceed to Task 1.2**: Razorpay Keys Rotation
3. **Continue through**: Tasks 1.3-1.6
4. **Move to**: Phase 1 Part B - Debug Logging Cleanup

---

## Quick Command Reference

```bash
# Stop dev server
pkill -f "next dev"

# Start dev server
npm run dev

# Verify you can access Supabase
curl https://lqezaljvpiycbeakndby.supabase.co/rest/v1/tables \
  -H "Authorization: Bearer $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)"

# Check .env.local has new keys
grep "SUPABASE" .env.local
```

---

**Ready?** When you've completed these steps, reply with "Task 1.1 Complete" and we'll move to Task 1.2: Razorpay Keys!

---

*Estimated Time: 45 minutes*  
*Difficulty: Medium (mostly copy-paste, but important)*  
*Importance: 🔴 CRITICAL - Security of entire system depends on this*

# Implementation Checklist - Google Maps Address Autocomplete

## Pre-Implementation ✓

- [ ] **Review Documentation**
  - [ ] Read [GOOGLE_MAPS_IMPLEMENTATION_SUMMARY.md](GOOGLE_MAPS_IMPLEMENTATION_SUMMARY.md)
  - [ ] Review [GOOGLE_MAPS_QUICK_START.md](GOOGLE_MAPS_QUICK_START.md)
  - [ ] Check [PROFILE_FORM_INTEGRATION_EXAMPLE.md](PROFILE_FORM_INTEGRATION_EXAMPLE.md)

- [ ] **Verify Project Setup**
  - [ ] Node.js 16+ installed
  - [ ] npm/yarn working
  - [ ] Git repository ready
  - [ ] `.env.local` exists

---

## Phase 1: Google Cloud Setup (⏱ ~15 minutes)

- [ ] **Create/Access Google Cloud Project**
  - [ ] Go to https://console.cloud.google.com/
  - [ ] Create new project or use existing
  - [ ] Project name visible in console
  - [ ] Billing enabled

- [ ] **Enable Required APIs**
  - [ ] Enable "Places API"
    - [ ] Search for "Places API" in marketplace
    - [ ] Click "Enable"
    - [ ] Wait for activation (can take 5-10 mins)
  - [ ] Enable "Maps JavaScript API"
  - [ ] Verify both show "✓ Enabled" in your project

- [ ] **Create API Key**
  - [ ] Navigate to Credentials
  - [ ] Click "Create Credentials" → "API Key"
  - [ ] Copy the API Key
  - [ ] Store securely (you'll need it in next phase)

- [ ] **Secure Your API Key**
  - [ ] In Credentials, select your API Key
  - [ ] Under "Application restrictions", select "HTTP referrers"
  - [ ] Add your domain (e.g., `.yourapp.com`, `localhost:3000` for dev)
  - [ ] Under "API restrictions", select "Places API" and "Maps JavaScript API"
  - [ ] Click "Save"

---

## Phase 2: Local Environment Setup (⏱ ~10 minutes)

- [ ] **Install Dependencies**
  ```bash
  npm install @googlemaps/js-api-loader
  ```
  - [ ] No errors during installation
  - [ ] Package added to `package.json`

- [ ] **Configure Environment Variable**
  - [ ] Open `.env.local`
  - [ ] Add: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE`
  - [ ] Replace `YOUR_API_KEY_HERE` with your actual key
  - [ ] Don't commit this file to git
  - [ ] Verify `.gitignore` includes `.env.local`

- [ ] **Verify Setup**
  ```bash
  npm run build
  ```
  - [ ] No build errors
  - [ ] Warnings are acceptable

---

## Phase 3: Code Integration (⏱ ~20 minutes)

- [ ] **Copy Component Files**
  - [ ] ✅ `src/components/form-fields/address-autocomplete-field.tsx` (already created)
  - [ ] ✅ `src/components/form-fields/address-group-field.tsx` (already created)
  - [ ] ✅ `src/hooks/use-address-validation.ts` (already created)
  - [ ] ✅ `src/types/address.ts` (already created)
  - [ ] ✅ `src/app/api/addresses/validate/route.ts` (already created)

- [ ] **Verify All Files Exist**
  ```bash
  ls -la src/components/form-fields/
  ls -la src/hooks/use-address-validation.ts
  ls -la src/types/address.ts
  ls -la src/app/api/addresses/validate/
  ```

- [ ] **No TypeScript Errors**
  ```bash
  npm run typecheck
  ```
  - [ ] No type errors

---

## Phase 4: Database Migration (⏱ ~10 minutes)

- [ ] **Prepare Migration**
  - [ ] ✅ Migration file created: `supabase/migrations/add_address_fields.sql`
  - [ ] Review the SQL file contents
  - [ ] Verify it includes:
    - [ ] ALTER TABLE with new columns
    - [ ] CREATE INDEX statements  
    - [ ] COMMENT statements for documentation

- [ ] **Apply Migration**
  
  **Option A: Using Supabase Dashboard**
  - [ ] Go to your Supabase project
  - [ ] Navigate to SQL Editor
  - [ ] Create new query
  - [ ] Copy contents of `add_address_fields.sql`
  - [ ] Execute query
  - [ ] Verify all tables exist in data browser

  **Option B: Using Supabase CLI**
  ```bash
  supabase migration new add_address_fields_to_profiles
  supabase migration push
  ```
  - [ ] Check that migration ran successfully

- [ ] **Verify Database Changes**
  ```sql
  -- Run in Supabase SQL Editor
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'student_profiles' 
  ORDER BY column_name;
  ```
  - [ ] See new columns: `address`, `apartment`, `city`, `state`, `postal_code`, `country`

---

## Phase 5: Form Integration (⏱ ~30 minutes)

- [ ] **Update Profile Form Schema**
  - [ ] Open `src/components/profile-form.tsx`
  - [ ] Add to Zod schema:
    ```typescript
    address: z.string().optional().or(z.literal('')),
    apartment: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    ```
  - [ ] Both imports use corrected field names
  - [ ] No TypeScript errors

- [ ] **Update Form UI**
  - [ ] Import `AddressGroupField` component
  - [ ] Add address form section to JSX
  - [ ] Place between existing form fields
  - [ ] Verify component renders without errors

- [ ] **Update useEffect Hook**
  - [ ] Add address fields to form reset
  - [ ] Load from `userData` object

- [ ] **Update onSubmit Handler**
  - [ ] Add address fields to Supabase update
  - [ ] Handle null values properly
  - [ ] Test submission

- [ ] **Add Types**
  - [ ] Import address types in form if needed
  - [ ] Update StudentProfile interface

---

## Phase 6: Testing (⏱ ~30 minutes)

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```
  - [ ] Server running on http://localhost:3000
  - [ ] No console errors

- [ ] **Manual Testing**
  - [ ] Navigate to profile form
  - [ ] Click address field
  - [ ] Type partial address (e.g., "123 main")
  - [ ] See autocomplete suggestions
  - [ ] Select one suggestion
  - [ ] Verify other fields auto-fill
  - [ ] Edit optional apartment field
  - [ ] Submit form
  - [ ] Check Supabase for saved data

- [ ] **Edge Cases**
  - [ ] Leave address empty and submit
  - [ ] Try address from different country
  - [ ] Select address, click browser back, click forward
  - [ ] Test on mobile device

- [ ] **Database Verification**
  ```sql
  SELECT user_id, address, city, state, postal_code, country 
  FROM student_profiles 
  WHERE address IS NOT NULL 
  LIMIT 5;
  ```
  - [ ] See saved address data

- [ ] **API Tests** (if using server validation)
  ```bash
  curl -X POST http://localhost:3000/api/addresses/validate \
    -H "Content-Type: application/json" \
    -d '{"address":"123 Main St, San Francisco, CA 94102"}'
  ```
  - [ ] Returns valid JSON response
  - [ ] Contains `isValid` field

---

## Phase 7: Security Review (⏱ ~15 minutes)

- [ ] **Environment Variables**
  - [ ] ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` set
  - [ ] ✅ `.env.local` in `.gitignore`
  - [ ] ✅ Check git didn't track it: `git ls-files | grep env`
  - [ ] No raw keys in comments or code

- [ ] **API Key Restrictions**
  - [ ] ✅ Domain restrictions applied
  - [ ] ✅ Only needed APIs enabled
  - [ ] ✅ HTTP referrer restrictions set

- [ ] **Rate Limiting** (if using validation API)
  - [ ] [ ] Consider adding rate limiting to `/api/addresses/validate`
  - [ ] Install: `npm install rate-limiter-flexible`
  - [ ] Or use middleware like `@vercel/edge-request-context`

- [ ] **Data Protection**
  - [ ] Address data encrypted in transit (HTTPS)
  - [ ] Supabase RLS policies in place
  - [ ] User can only see/update own address (verify RLS policies)

---

## Phase 8: Code Review (⏱ ~10 minutes)

- [ ] **Check TypeScript**
  ```bash
  npm run typecheck
  ```
  - [ ] 0 errors

- [ ] **Run Linter**
  ```bash
  npm run lint
  ```
  - [ ] No critical issues

- [ ] **Build Production**
  ```bash
  npm run build
  ```
  - [ ] Builds successfully
  - [ ] No errors in output

---

## Phase 9: Documentation (⏱ ~5 minutes)

- [ ] **Update Project README**
  - [ ] Add note about address autocomplete feature
  - [ ] Link to [GOOGLE_MAPS_QUICK_START.md](GOOGLE_MAPS_QUICK_START.md)

- [ ] **Team Communication**
  - [ ] Share implementation with team
  - [ ] Provide API key setup instructions
  - [ ] Link to troubleshooting guide

---

## Phase 10: Deployment (⏱ ~10 minutes)

- [ ] **Staging Environment**
  - [ ] Set API key in staging `.env`
  - [ ] Deploy to staging
  - [ ] Test end-to-end on staging
  - [ ] Verify data persists

- [ ] **Production Environment**
  - [ ] Set API key in production `.env`
  - [ ] Verify domain restrictions include production domain
  - [ ] Deploy to production
  - [ ] Monitor first 24 hours for errors
  - [ ] Check Google Cloud Console for API usage

- [ ] **Monitoring**
  - [ ] Set up Google Cloud billing alerts
  - [ ] Monitor error logs
  - [ ] Check failed API requests

---

## Post-Implementation ✅

- [ ] **Maintenance Plan**
  - [ ] [ ] Weekly: Check API usage in Google Cloud Console
  - [ ] [ ] Monthly: Review costs and optimize if needed
  - [ ] [ ] Quarterly: Update dependencies

- [ ] **Future Enhancements**
  - [ ] [ ] Add saved addresses feature
  - [ ] [ ] Implement address verification
  - [ ] [ ] Add geographic filtering for courses
  - [ ] [ ] Create location-based analytics

---

## Rollback Plan (If Issues)

If you encounter critical issues:

1. **Stop using component**
   ```tsx
   // Comment out AddressGroupField
   // Use simple text input instead
   <Input placeholder="Address" />
   ```

2. **Remove API calls**
   - Stop validation requests to `/api/addresses/validate`

3. **Rollback database**
   ```sql
   ALTER TABLE student_profiles
   DROP COLUMN IF EXISTS address,
   DROP COLUMN IF EXISTS apartment,
   DROP COLUMN IF EXISTS city,
   DROP COLUMN IF EXISTS state,
   DROP COLUMN IF EXISTS postal_code,
   DROP COLUMN IF EXISTS country;
   ```

4. **Disable API key**
   - Restrict API key to deny all origins temporarily

---

## Getting Help

- [ ] Check [GOOGLE_MAPS_QUICK_START.md](GOOGLE_MAPS_QUICK_START.md) troubleshooting section
- [ ] Review Google Cloud Console logs
- [ ] Check browser console for errors
- [ ] Test with sample addresses from troubleshooting guide

---

**Status:** Ready to start? Begin with Phase 1! ✅

**Estimated Total Time:** ~2-3 hours

# Test Certification Feature - Implementation Guide

## Overview
Added certification support to tests, allowing instructors to enable certificates for specific tests with configurable minimum score requirements.

## Changes Made

### 1. Database Schema (Migration)
**File:** `migrations/add_certification_to_tests.sql`

Added two new columns to the `tests` table:
- `has_certification` (BOOLEAN, DEFAULT: false) - Enables/disables certification for the test
- `certificate_minimum_score` (INTEGER, DEFAULT: 80) - Minimum score required for certificate eligibility (0-100%)

Includes indexes for performance optimization and column comments for documentation.

### 2. Form Schema Update
**File:** `src/components/test-form.tsx`

Updated Zod schema with:
```typescript
hasCertification: z.boolean().default(false),
certificateMinimumScore: z.coerce.number().int().min(0).max(100).default(80),
```

### 3. UI Implementation
**File:** `src/components/test-form.tsx`

Added new "Certification Settings" section with:
- **Toggle Switch**: Enables/disables certification for the test
  - Visual indicator: "Yes" (green) / "No" (gray)
  - Custom toggle button with smooth transitions
- **Conditional Minimum Score Field**: Only appears when certification is enabled
  - Input range: 0-100%
  - Default: 80%
  - Form description explains the purpose

### 4. Backend Integration
**File:** `src/app/instructor/tests/actions.ts`

Updated both `createTest` and `updateTest` functions:
- `createTest()`: Inserts `has_certification` and `certificate_minimum_score` during test creation
- `updateTest()`: Handles updates to certification settings

### 5. Type Definitions
**File:** `src/types/index.ts`

Updated `Test` interface with:
```typescript
hasCertification?: boolean; // whether this test provides a certificate
certificateMinimumScore?: number; // minimum score required for certificate (0-100)
```

## How It Works

### For Instructors:
1. When creating or editing a test
2. Navigate to "Certification Settings" section
3. Toggle "Enable Certification" to Yes
4. Set minimum score (0-100%) required for certificate eligibility
5. Save test

### For Students:
1. Student takes test and passes with score >= minimum required
2. System automatically marks them eligible for certificate
3. Student can request certificate from their dashboard
4. Certificate is approved/issued based on enrollment settings

## Database Query Examples

### Find all tests with certification:
```sql
SELECT * FROM tests WHERE has_certification = true;
```

### Check if student is eligible for certificate:
```sql
SELECT t.has_certification, t.certificate_minimum_score 
FROM tests t 
WHERE t.id = $1 AND t.has_certification = true;
```

### Get certification requirements for a test:
```sql
SELECT title, has_certification, certificate_minimum_score 
FROM tests 
WHERE id = $1;
```

## Future Enhancements

These can be added in subsequent iterations:
1. **Certificate Templates**: Custom certificate designs per test
2. **Expiry Dates**: Certificates that expire after X months
3. **Automatic Issuing**: Auto-issue certificates without manual approval
4. **Certificate Analytics**: Track issued certificates, renewal rates
5. **Badge System**: Digital badges instead of/in addition to certificates
6. **Verification Link**: Allow certificate verification by third parties
7. **Certificate Revocation**: Admin ability to revoke certificates

## Files Modified

1. `migrations/add_certification_to_tests.sql` - NEW
2. `src/components/test-form.tsx` - UPDATED
3. `src/app/instructor/tests/actions.ts` - UPDATED
4. `src/types/index.ts` - UPDATED

## Testing Checklist

- [ ] Create test with certification enabled
  - [ ] Verify `has_certification` is true in database
  - [ ] Verify `certificate_minimum_score` is saved correctly
- [ ] Create test with certification disabled
  - [ ] Verify `has_certification` is false in database
- [ ] Edit test to toggle certification on/off
  - [ ] Verify changes persist in database
- [ ] Change minimum score
  - [ ] Verify score validation (0-100)
  - [ ] Verify updates persist
- [ ] Verify conditional rendering
  - [ ] Minimum score field only shows when certification enabled
- [ ] Check database migration
  - [ ] New columns exist
  - [ ] Constraints are applied
  - [ ] Indexes are created

## Migration Instructions

To apply the migration:

```bash
# Option 1: Using Supabase SQL Editor
1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy content from migrations/add_certification_to_tests.sql
4. Execute

# Option 2: Using Supabase CLI
supabase migration new add_certification_to_tests
# Then copy migration content into the generated file
supabase db push
```

## API Integration (Future)

When building the certificate request/approval flow:

```typescript
// Check if student is eligible
const isEligible = test.hasCertification && studentScore >= test.certificateMinimumScore;

// Update enrollment certificate status
UPDATE enrollments 
SET certificate_status = 'eligible' 
WHERE user_id = $1 AND test_id = $2 AND $3 >= $4
(WHERE studentScore >= certificateMinimumScore)
```

---

**Implementation Date:** November 25, 2025  
**Status:** ✅ Complete - Ready for Testing

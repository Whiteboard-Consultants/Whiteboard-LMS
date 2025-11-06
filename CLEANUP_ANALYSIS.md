# 🧹 Code Cleanup & Redundancy Analysis Report
**Generated:** November 6, 2025

## 📋 Executive Summary
This report identifies **37 redundant/unused files** that should be removed before pushing to GitHub. Organized by category with cleanup priority.

---

## 🔴 HIGH PRIORITY - REMOVE IMMEDIATELY

### Root-Level Gmail/Test Scripts (11 files)
These are development/test files that are NOT part of the production codebase:

```
❌ get-gmail-token.js (5.4K) - Old Gmail OAuth flow
❌ get-gmail-refresh-token.js (4.1K) - Redundant refresh token getter
❌ get-gmail-refresh-token-3001.js (4.0K) - Port 3001 variant
❌ get-gmail-refresh-token-direct.js (4.5K) - Direct variant
❌ get-gmail-token-simple.js (6.3K) - Simplified version
❌ get-gmail-token-port3000.js (6.0K) - Port 3000 variant
❌ get-gmail-token-final.js (4.2K) - "Final" version
❌ test-smtp2go-direct.js (1.3K) - SMTP test
❌ test-production-email.js (7.2K) - Email test
❌ test-gmail-oauth2.js (6.1K) - OAuth test
❌ test-auth-flow.ts (3.4K) - Auth test flow
```

**Reason:** Multiple variations of the same functionality. Keep only production-ready code.

---

### Root-Level Setup/Check Scripts (6 files)
Development utility scripts:

```
❌ create-admin-console.js (2.9K) - Admin setup utility
❌ create-admin-simple.js (4.6K) - Simplified admin setup
❌ check-blog-featured-image.js (1.4K) - Blog image checker
❌ check-blog-images.js (2.0K) - Blog image checker variant
❌ test-blog-creation.js (980B) - Blog test
❌ test-course-mapping.ts (1.8K) - Course mapping test
```

**Reason:** Utility/test scripts. Not needed in production.

---

### Root-Level Miscellaneous (4 files)
```
❌ test-featured-upload.js (2.3K) - Upload test
❌ test-supabase-key.js (833B) - DB key test
❌ test-upload-debug.js (1.2K) - Upload debug
❌ next.config.seo.ts (2.3K) - Duplicate config (next.config.ts exists)
```

**Reason:** Either tests or duplicates. `next.config.ts` is the active config.

---

## 🟡 MEDIUM PRIORITY - CLEAN UP

### Backup & Broken Files (8 files)
```
❌ src/app/student/assessment-actions-backup.ts - Backup file
❌ src/app/(main)/admin/certificates/page-broken.tsx - Broken page
❌ src/app/(main)/admin/certificates/page-broken.tsx.disabled - Disabled variant
❌ src/app/(main)/admin/coupons/page-broken.tsx - Broken page
❌ src/app/(main)/admin/coupons/page-broken.tsx.disabled - Disabled variant
❌ src/app/(main)/admin/users/page-broken.tsx - Broken page
❌ src/app/(main)/admin/users/page-broken.tsx.disabled - Disabled variant
❌ src/app/instructor/tests/actions-firebase-backup.ts - Firebase backup
```

**Reason:** Old files with -broken, -backup, -disabled suffixes. If still needed, migrate to working versions.

---

### Deprecated Hook (1 file)
```
❌ src/hooks/use-cart-old.tsx
```

**Reason:** Old version. `use-cart.tsx` is the active version.

---

### Old Blog Update Scripts (2 files)
```
⚠️  scripts/update-all-blog-authors.ts - Had execution issues
⚠️  scripts/update-blog-authors.ts - Had execution issues
```

**Reason:** These scripts had issues and were replaced. Keep `update-toefl-blog.ts` and `update-ielts-post.ts` which work correctly.

---

## 🟢 LOW PRIORITY - REVIEW & CONSOLIDATE

### Potential Consolidation Candidates

#### Gmail Scripts (if still needed)
- **Keep:** One working version in `scripts/` directory (production-ready)
- **Remove:** All root-level duplicates
- **Note:** Consider moving to a proper backend service

#### Blog Scripts
- **Keep:** `add-blog-posts.ts`, `add-toefl-blog.ts`, `add-dubai-masters-blog.ts`
- **Keep:** `update-toefl-blog.ts`, `update-ielts-post.ts`
- **Remove:** `update-blog-authors.ts`, `update-all-blog-authors.ts`

#### Config Files
- **Review:** Multiple Next.js config files
  - Keep: `next.config.ts` (active)
  - Remove: `next.config.seo.ts` (merge if needed)

---

## 📊 Cleanup Summary

| Category | Count | Action |
|----------|-------|--------|
| Root Gmail/Test Scripts | 11 | DELETE |
| Root Setup Scripts | 6 | DELETE |
| Root Misc Files | 4 | DELETE |
| Backup/Broken Files | 8 | DELETE |
| Old Hooks | 1 | DELETE |
| Old Blog Scripts | 2 | REVIEW |
| **Total to Remove** | **32** | - |

---

## 🛠️ Cleanup Commands

```bash
# Remove high-priority root-level files
rm -f get-gmail-*.js
rm -f get-gmail-*.ts
rm -f test-*.js
rm -f test-*.ts
rm -f create-admin-*.js
rm -f check-blog-*.js
rm -f next.config.seo.ts

# Remove backup/broken files
rm -f src/app/student/assessment-actions-backup.ts
rm -f src/app/instructor/tests/actions-firebase-backup.ts
rm -f src/app/**/admin/**/page-broken.tsx*
rm -f src/hooks/use-cart-old.tsx

# Archive old scripts (optional - move to archive folder first)
rm -f scripts/update-all-blog-authors.ts
rm -f scripts/update-blog-authors.ts
```

---

## ✅ Files to KEEP

### Production Scripts (scripts/)
- ✅ `add-blog-posts.ts`
- ✅ `add-toefl-blog.ts`
- ✅ `add-dubai-masters-blog.ts`
- ✅ `update-toefl-blog.ts`
- ✅ `update-ielts-post.ts`
- ✅ `create-course-assets-bucket.ts`
- ✅ `create-storage-bucket.ts`
- ✅ `diagnose-gmail.ts`
- ✅ `regenerate-missing-certificates.ts`
- ✅ `test-email.ts`

### Config Files (root)
- ✅ `next.config.ts`
- ✅ `tailwind.config.ts`
- ✅ `tsconfig.json` (project root and scripts/)

### Type Definitions
- ✅ `next-env.d.ts`

---

## 📝 Post-Cleanup Actions

1. **Before Deletion:**
   - Archive files to a `_archived` folder (if needed for reference)
   - Verify no imports reference these files
   - Test the application after removal

2. **Git Operations:**
   ```bash
   git add -A
   git commit -m "chore: remove unused/redundant files before release"
   git push origin main
   ```

3. **Documentation:**
   - Update README.md with only relevant development scripts
   - Remove outdated troubleshooting docs

---

## 🔍 Files Requiring Further Review

1. **SQL Files** - Some migration files may be redundant
2. **Debug Directory** - `scripts/debug/` folder contents
3. **Action Files** - Multiple action files across admin/instructor/student

---

## 📌 Recommendations

1. ✅ **Remove all 32 files listed in HIGH/MEDIUM priority**
2. ✅ **Keep only one working version of duplicated scripts**
3. ✅ **Create .gitignore entries for development utilities** (not needed after cleanup)
4. ✅ **Archive original files locally before deletion** (for safety)
5. ✅ **Test application thoroughly** after cleanup

---

**Total Lines of Code Reduction:** ~150KB of unused code
**Expected Project Size Reduction:** ~8-10% smaller GitHub repository

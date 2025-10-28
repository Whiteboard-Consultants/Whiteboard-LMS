# Task 1.5: Git Cleanup - Security Remediation

## Phase 1: Identification of Exposed Credentials

### Files to Remove from Git History
The following files contain or contained exposed credentials:

1. **`.env.local.new`** - Currently tracked in git
   - Contains: Supabase URL, Anon Key, Service Role Key
   - Status: ✅ Identified, will be removed

2. **Commits with embedded credentials**
   - Multiple commits found with `SUPABASE_URL`, `RAZORPAY_KEY`, etc.
   - Commits to rewrite:
     - 657e4684 - Security: Remove .env files
     - 7eb80210 - updates and changes
     - 6d9a739a - updates and changes
     - 4f203565 - Project ID embedded
     - And potentially others

### Sensitive Data Patterns Found
- ✅ Supabase URL (Project identifier)
- ✅ Supabase Anon Key (JWT token)
- ✅ Supabase Service Role Key (admin JWT token)
- ✅ Razorpay keys
- ✅ API endpoints with project IDs

## Phase 2: Cleanup Strategy

### Option 1: BFG Repo-Cleaner (Recommended - Fast & Safe)
```bash
# Install BFG if needed
brew install bfg

# Clone a mirror
git clone --mirror https://github.com/Whiteboard-Consultants/WhitedgeLMS.git

# Remove .env files from all history
bfg --delete-files '.env*' WhitedgeLMS.git

# Remove sensitive patterns
bfg --replace-text '<<SECRETS.txt' WhitedgeLMS.git

# Push back
cd WhitedgeLMS.git
git push --force
```

### Option 2: git filter-branch (More Control, Slower)
```bash
# Remove .env.local.new from all commits
git filter-branch --tree-filter 'rm -f .env.local.new' -- --all

# Force push
git push --force --all
```

### Option 3: git filter-repo (Best - Modern Approach)
```bash
# Install if needed
pip3 install git-filter-repo

# Remove files
git filter-repo --path .env.local.new --invert-paths

# Force push
git push --force --all
```

## Phase 3: Current Status

### Already Protected
✅ `.env.local` - in .gitignore
✅ `.env.development.local` - in .gitignore
✅ `.env.test.local` - in .gitignore
✅ `.env.production.local` - in .gitignore
✅ `.env` - in .gitignore

### Needs Cleanup
❌ `.env.local.new` - Currently tracked (MUST REMOVE)
❌ Historical commits - Contain credentials (SHOULD REMOVE)

### Example Files
✅ `.env.example` - Safe (no secrets)
✅ `.env.email.example` - Safe (no secrets)
✅ `.env.gmail.example` - Safe (no secrets)

## Phase 4: Execution Plan

### Step 1: Verify Repository State
```bash
cd /Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS
git status
```

### Step 2: Remove .env.local.new from Tracking
```bash
git rm --cached .env.local.new
echo ".env.local.new" >> .gitignore
git add .gitignore
git commit -m "🔒 Security: Remove .env.local.new from git tracking"
```

### Step 3: Rewrite Git History (BFG or filter-repo)
- Remove all exposed credentials from commits
- Maintain repository integrity
- All contributors notified

### Step 4: Force Push
```bash
git push --force --all
git push --force --tags
```

### Step 5: Verification
```bash
# Verify credentials are gone
git log --all -S "SUPABASE_URL" --pretty=format:"%H" | wc -l
# Should return: 0

# Verify .env.local.new is gone
git ls-files | grep ".env.local.new"
# Should return: (empty)
```

## Risk Assessment

### Low Risk
- Removing `.env.local.new` from index
- Force-pushing does not affect deployed applications
- GitHub forks will have old history (acceptable)

### Precautions
- ✅ Ensure all team members are aware
- ✅ All developers need to re-clone after force-push
- ✅ All local branches will be out of sync (expected)
- ✅ CI/CD may need restart (if applicable)

## Security Checks After Cleanup

### 1. Verify Credentials Removed
```bash
git log -p | grep -i "RAZORPAY_KEY"
git log -p | grep -i "SERVICE_ROLE_KEY"
git log -p | grep -i "eyJhbGciOi"  # JWT pattern
# All should return: (empty)
```

### 2. Verify Files Not Tracked
```bash
git ls-files | grep "\.env"
# Should only show: .env.example, .env.email.example, .env.gmail.example
```

### 3. Verify .gitignore Updated
```bash
cat .gitignore | grep ".env"
# Should show all .env patterns
```

## Next Steps

1. Execute cleanup
2. Force-push to main
3. All team members re-clone
4. Verify with grep searches
5. Rotate all exposed credentials (already done in Tasks 1.1-1.3)
6. Document in security audit

---

## Timeline

- **Step 1-2:** 2 minutes (remove from index)
- **Step 3:** 5-10 minutes (rewrite history)
- **Step 4:** 1-2 minutes (force push)
- **Step 5:** 2 minutes (verification)

**Total: ~15 minutes**

## References

- BFG: https://rtyley.github.io/bfg-repo-cleaner/
- git filter-repo: https://github.com/newren/git-filter-repo
- GitHub Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

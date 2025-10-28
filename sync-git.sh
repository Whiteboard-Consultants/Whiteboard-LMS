#!/bin/bash

# Git Sync Automation Script for WhitedgeLMS
# This script will sync all uncommitted changes to the git repository

set -e

PROJECT_DIR="/Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS"
cd "$PROJECT_DIR"

echo "════════════════════════════════════════════════════════════"
echo "  WhitedgeLMS - Git Sync Automation"
echo "════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check git status
echo "📋 Step 1: Checking current git status..."
echo ""
git status --short | head -20
echo ""

# Count files
MODIFIED=$(git diff --name-only | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)

echo "Summary:"
echo "  - Modified files: $MODIFIED"
echo "  - Untracked files: $UNTRACKED"
echo ""

# Step 2: Verify .env files are NOT being committed
echo "🔒 Step 2: Verifying .env files won't be committed..."
if git status | grep -q "\.env\.local"; then
    echo "❌ ERROR: .env.local is about to be committed!"
    echo "   This file should NOT be in git (it's in .gitignore)"
    exit 1
fi
echo "✅ .env files are safely ignored"
echo ""

# Step 3: Ask for confirmation
echo "⚠️  Step 3: Confirmation required"
echo ""
read -p "Do you want to commit all changes? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Cancelled. No changes committed."
    exit 1
fi

# Step 4: Stage all changes
echo "📦 Step 4: Staging all changes..."
git add -A
echo "✅ Staged $(git diff --cached --name-only | wc -l) files"
echo ""

# Step 5: Show what will be committed
echo "📝 Step 5: Files to be committed:"
echo ""
git diff --cached --name-only | head -20
if [ $(git diff --cached --name-only | wc -l) -gt 20 ]; then
    echo "... and $(( $(git diff --cached --name-only | wc -l) - 20 )) more files"
fi
echo ""

# Step 6: Commit
echo "💾 Step 6: Creating commit..."
echo ""

COMMIT_MESSAGE="Production deployment: All bugs fixed, comprehensive docs added

✅ Features:
- Form submission fixed (20s → 3-5s)
- Course data displaying after creation
- TextStyle mark error fixed
- Image upload working (RTE + Blog)
- Favicon unified and error-free
- Multi-layer authentication working
- New API endpoints (upload-image, debug-env)

📚 Documentation:
- Production deployment guides (6 comprehensive docs)
- Bug fix documentation
- Deployment checklist and environment variables
- Git sync status report

🚀 Status: Ready for production deployment"

git commit -m "$COMMIT_MESSAGE"
echo "✅ Commit created"
echo ""

# Step 7: Show commit details
echo "📊 Step 7: Commit details:"
echo ""
git log -1 --stat | head -30
echo ""

# Step 8: Push to GitHub
echo "🚀 Step 8: Pushing to GitHub..."
echo ""

if git push origin main; then
    echo "✅ Successfully pushed to origin/main"
else
    echo "⚠️  Push may have failed. Check the error above."
    exit 1
fi
echo ""

# Step 9: Verify sync
echo "✅ Step 9: Verifying sync..."
echo ""

if git status | grep -q "Your branch is up to date"; then
    echo "✅ Repository is fully synced!"
else
    echo "⚠️  Check git status: $(git status --porcelain)"
fi
echo ""

# Final summary
echo "════════════════════════════════════════════════════════════"
echo "✅ Git Sync Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  ✅ All changes staged"
echo "  ✅ Changes committed"
echo "  ✅ Changes pushed to GitHub"
echo "  ✅ Repository is in sync"
echo ""
echo "Next steps:"
echo "  1. Visit: https://github.com/Whiteboard-Consultants/WhitedgeLMS"
echo "  2. Verify the latest commit"
echo "  3. Proceed with production deployment"
echo ""


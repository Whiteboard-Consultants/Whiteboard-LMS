#!/bin/bash

# Option C: Migrate to New Remote GitHub Repository
# This script migrates repository to a new GitHub URL
# Usage: bash migrate-to-new-remote.sh

set -e

PROJECT_DIR="/Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Migrate to New Remote Repository (Option C)          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify directory
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "❌ Error: Not a git repository: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
echo "📁 Working directory: $(pwd)"
echo ""

# Step 2: Display current remote
echo "🔄 Step 1: Checking current remote..."
CURRENT_REMOTE=$(git remote get-url origin)
echo "Current remote: $CURRENT_REMOTE"
echo ""

# Step 3: Prompt for new remote
echo "🔄 Step 2: Enter new GitHub repository URL..."
echo "Format: https://github.com/USERNAME/REPO-NAME.git"
echo "Or: git@github.com:USERNAME/REPO-NAME.git"
echo ""
read -p "Enter new repository URL: " NEW_REMOTE_URL
echo ""

if [ -z "$NEW_REMOTE_URL" ]; then
    echo "❌ Error: No repository URL provided"
    exit 1
fi

# Step 4: Backup current remote
echo "🔄 Step 3: Backing up current configuration..."
echo "Current remote URL: $CURRENT_REMOTE" > .git-remote-backup.txt
echo "New remote URL: $NEW_REMOTE_URL" >> .git-remote-backup.txt
echo "Backup created: .git-remote-backup.txt"
echo ""

# Step 5: Stage any uncommitted changes
echo "🔄 Step 4: Checking for uncommitted changes..."
UNSTAGED=$(git diff --name-only | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)

if [ $((UNSTAGED + UNTRACKED)) -gt 0 ]; then
    echo "   Uncommitted changes found: $UNSTAGED unstaged, $UNTRACKED untracked"
    echo ""
    read -p "Commit changes before migrating? (yes/no): " -r
    echo ""
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        git add -A
        git commit -m "Production deployment: All features ready"
        echo "✅ Changes committed"
        echo ""
    else
        echo "⚠️  Proceeding without committing changes"
        echo ""
    fi
fi

# Step 6: Verify new remote connectivity (optional)
echo "🔄 Step 5: Verifying remote URL format..."
if [[ "$NEW_REMOTE_URL" =~ ^https:// ]] || [[ "$NEW_REMOTE_URL" =~ ^git@ ]]; then
    echo "✅ URL format looks valid"
else
    echo "⚠️  URL format may be incorrect"
    echo "   Valid formats:"
    echo "   - https://github.com/USERNAME/REPO.git"
    echo "   - git@github.com:USERNAME/REPO.git"
fi
echo ""

# Step 7: Display migration summary
echo "📋 Migration Summary:"
echo "   Current remote: $CURRENT_REMOTE"
echo "   New remote: $NEW_REMOTE_URL"
echo "   Branch to push: $(git rev-parse --abbrev-ref HEAD)"
echo "   Commits to migrate: $(git rev-list --count HEAD)"
echo ""

# Step 8: Confirm migration
read -p "Proceed with migration? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Migration cancelled"
    echo "To proceed later, run: git remote set-url origin $NEW_REMOTE_URL"
    exit 1
fi

# Step 9: Change remote URL
echo "🔄 Step 6: Updating remote URL..."
git remote set-url origin "$NEW_REMOTE_URL"
echo "✅ Remote URL updated"
echo ""

# Step 10: Verify change
echo "🔄 Step 7: Verifying remote URL..."
VERIFIED_URL=$(git remote get-url origin)
if [ "$VERIFIED_URL" = "$NEW_REMOTE_URL" ]; then
    echo "✅ Remote URL verified: $VERIFIED_URL"
else
    echo "❌ Error: Remote URL not updated correctly"
    echo "   Expected: $NEW_REMOTE_URL"
    echo "   Got: $VERIFIED_URL"
    exit 1
fi
echo ""

# Step 11: Push to new remote
echo "🔄 Step 8: Pushing to new remote..."
echo "This may take a moment..."
echo ""

git push -u origin main
PUSH_EXIT=$?

if [ $PUSH_EXIT -eq 0 ]; then
    echo "✅ Main branch pushed successfully"
else
    echo "⚠️  Push may have encountered an issue (exit code: $PUSH_EXIT)"
fi
echo ""

# Step 12: Push tags
echo "🔄 Step 9: Pushing tags..."
git push --tags
TAGS_EXIT=$?

if [ $TAGS_EXIT -eq 0 ]; then
    echo "✅ Tags pushed successfully"
else
    echo "⚠️  Tags push may have encountered an issue (exit code: $TAGS_EXIT)"
fi
echo ""

# Step 13: Display final status
echo "📊 Final Status:"
echo ""
echo "Remote configuration:"
git remote -v
echo ""
echo "Recent commits:"
git log --oneline -3
echo ""
echo "Tags:"
git tag -l | tail -5
echo ""

# Step 14: Success message
echo "✅ Repository migration completed!"
echo ""
echo "📋 Summary:"
echo "   Old remote: $CURRENT_REMOTE"
echo "   New remote: $NEW_REMOTE_URL"
echo "   Branch pushed: main"
echo "   Tags pushed: Yes"
echo ""
echo "🎯 Next Steps:"
echo "   1. Verify on GitHub: $NEW_REMOTE_URL"
echo "   2. Check commits appear on remote"
echo "   3. Update any CI/CD configurations"
echo "   4. Delete old repository if desired"
echo ""
echo "💾 Backup location: .git-remote-backup.txt"
echo "   (To restore old remote, edit and run: git remote set-url origin <url>)"
echo ""


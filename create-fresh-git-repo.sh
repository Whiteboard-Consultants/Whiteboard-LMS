#!/bin/bash

# Option A: Create Fresh Git Repository
# This script creates a completely fresh git repository
# Usage: bash create-fresh-git-repo.sh

set -e

PROJECT_DIR="/Users/navnitda/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS"
BACKUP_DIR="$PROJECT_DIR/.git.backup.$(date +%Y%m%d_%H%M%S)"

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Creating Fresh Git Repository (Option A)             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
echo "📁 Working directory: $(pwd)"
echo ""

# Step 2: Backup current .git
if [ -d ".git" ]; then
    echo "🔄 Step 1: Backing up current .git directory..."
    mkdir -p "$(dirname "$BACKUP_DIR")"
    cp -r .git "$BACKUP_DIR"
    echo "✅ Backup created at: $BACKUP_DIR"
else
    echo "ℹ️  No existing .git directory found"
fi
echo ""

# Step 3: Remove old git
echo "🔄 Step 2: Removing old git repository..."
rm -rf .git
echo "✅ Old git repository removed"
echo ""

# Step 4: Initialize new git
echo "🔄 Step 3: Initializing new git repository..."
git init
echo "✅ New git repository initialized"
echo ""

# Step 5: Configure git user
echo "🔄 Step 4: Configuring git user..."
git config user.name "WhitedgeLMS Developer"
git config user.email "developer@whitedgelms.local"
echo "✅ Git configured"
echo "   Name: $(git config user.name)"
echo "   Email: $(git config user.email)"
echo ""

# Step 6: Stage all files
echo "🔄 Step 5: Staging all files..."
STAGED=$(git add -A && git diff --cached --name-only | wc -l)
echo "✅ Staged $STAGED files"
echo ""

# Step 7: Create initial commit
echo "🔄 Step 6: Creating initial commit..."
git commit -m "Initial commit: WhitedgeLMS production-ready application

✅ Features:
- All critical bugs fixed (8 major fixes)
- Form submission optimized (20s → 3-5s)
- Course data displaying after creation
- TextStyle mark error fixed
- Image upload working (RTE + Blog)
- Favicon unified and error-free
- Multi-layer authentication implemented
- New API endpoints (upload-image, debug-env)

📚 Documentation:
- 6 comprehensive production deployment guides
- Complete bug fix documentation
- API endpoint documentation
- Deployment checklist and environment variables
- Git sync status report

🚀 Status: Ready for production deployment"
echo "✅ Initial commit created"
echo ""

# Step 8: Verify repository
echo "🔄 Step 7: Verifying repository..."
echo ""
echo "📊 Repository Status:"
git log -1 --stat | head -20
echo ""
echo "Git configuration:"
git config --local --list | grep -E "user\.|core\."
echo ""

# Step 9: Final status
echo "✅ Fresh git repository created successfully!"
echo ""
echo "📋 Summary:"
echo "   Repository: $(pwd)"
echo "   Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "   Initial commit: $(git rev-parse --short HEAD)"
echo "   Backup location: $BACKUP_DIR"
echo ""
echo "🎯 Next Steps:"
echo "   1. Verify status: git status"
echo "   2. Check commits: git log --oneline"
echo "   3. Add remote: git remote add origin <url>"
echo "   4. Push: git push -u origin main"
echo ""


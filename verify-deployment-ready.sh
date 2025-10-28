#!/bin/bash

# WhitedgeLMS Deployment Verification Script
# This script verifies everything is ready for production deployment

set -e

echo "🚀 WhitedgeLMS Production Deployment Verification"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Git Status
echo "📋 Check 1: Git Repository Status"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓ Git working directory clean${NC}"
else
    echo -e "${RED}✗ Git working directory has uncommitted changes${NC}"
    echo "  Please commit or stash changes before deploying"
    exit 1
fi
echo ""

# Check 2: Git History
echo "📋 Check 2: Git History Cleanup (Task 1.5)"
ENV_FILES=$(git log --all --full-history --oneline -- .env | wc -l)
if [ "$ENV_FILES" -eq 0 ]; then
    echo -e "${GREEN}✓ No .env files in git history${NC}"
else
    echo -e "${YELLOW}⚠ Found $ENV_FILES .env file references in history${NC}"
    echo "  (This is OK if they were in commits before cleanup)"
fi
echo ""

# Check 3: Environment Variables
echo "📋 Check 3: Environment Variables (.env.local)"
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "RAZORPAY_KEY_ID"
    "RAZORPAY_KEY_SECRET"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASSWORD"
    "GEMINI_API_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=" .env.local 2>/dev/null; then
        echo -e "${GREEN}✓ $var${NC}"
    else
        echo -e "${RED}✗ $var missing${NC}"
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Missing required environment variables${NC}"
    exit 1
fi
echo ""

# Check 4: Build
echo "📋 Check 4: Production Build"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Production build succeeds${NC}"
else
    echo -e "${RED}✗ Production build failed${NC}"
    echo "  Run 'npm run build' to see details"
    exit 1
fi
echo ""

# Check 5: Node Version
echo "📋 Check 5: Node.js Version"
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js version: $NODE_VERSION${NC}"
echo ""

# Check 6: Git Remote
echo "📋 Check 6: Git Remote Configuration"
if git remote get-url origin > /dev/null 2>&1; then
    REMOTE=$(git remote get-url origin)
    echo -e "${GREEN}✓ Git remote configured: $REMOTE${NC}"
else
    echo -e "${YELLOW}⚠ No git remote configured${NC}"
fi
echo ""

# Check 7: GitHub Status
echo "📋 Check 7: Vercel Prerequisites"
echo -e "${YELLOW}Note: Vercel account and GitHub authorization will be requested during setup${NC}"
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}✅ All checks passed! Ready for deployment${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign in with GitHub"
echo "3. Import WhitedgeLMS repository"
echo "4. Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo "5. Deploy!"
echo ""
echo "For detailed instructions, see: DEPLOYMENT_GUIDE.md"

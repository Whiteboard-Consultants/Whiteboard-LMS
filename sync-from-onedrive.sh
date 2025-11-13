#!/bin/bash

# Sync script to pull changes from OneDrive to local project
# Usage: ./sync-from-onedrive.sh

LOCAL_PROJECT="$HOME/Projects/WhitedgeLMS"
ONEDRIVE_PROJECT="$HOME/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS"

echo "🔄 Syncing changes from OneDrive to local project..."

# Check if both directories exist
if [ ! -d "$LOCAL_PROJECT" ]; then
    echo "❌ Local project directory not found: $LOCAL_PROJECT"
    exit 1
fi

if [ ! -d "$ONEDRIVE_PROJECT" ]; then
    echo "❌ OneDrive project directory not found: $ONEDRIVE_PROJECT"
    exit 1
fi

# Sync using rsync, excluding node_modules, .next, and .git
rsync -av \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.DS_Store' \
    "$ONEDRIVE_PROJECT/" \
    "$LOCAL_PROJECT/"

echo "✅ Sync complete!"
echo "📝 Changes synced from: $ONEDRIVE_PROJECT"

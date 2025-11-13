#!/bin/bash

# Sync script to backup local project changes to OneDrive
# Usage: ./sync-to-onedrive.sh

LOCAL_PROJECT="$HOME/Projects/WhitedgeLMS"
ONEDRIVE_PROJECT="$HOME/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS"

echo "🔄 Syncing local project to OneDrive backup..."

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
    "$LOCAL_PROJECT/" \
    "$ONEDRIVE_PROJECT/"

echo "✅ Sync complete!"
echo "📝 Changes synced to: $ONEDRIVE_PROJECT"

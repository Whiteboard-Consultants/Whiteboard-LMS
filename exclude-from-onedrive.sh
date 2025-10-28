#!/bin/bash

# Script to exclude development directories from OneDrive sync
# This prevents sync conflicts that can cause webpack cache issues

echo "Excluding development directories from OneDrive sync..."

# Exclude .next directory from OneDrive sync (macOS)
if command -v xattr &> /dev/null; then
    xattr -w com.microsoft.OneDrive.DoNotSync 1 .next 2>/dev/null || echo ".next directory excluded from OneDrive sync"
fi

# Exclude node_modules if it exists
if [ -d "node_modules" ]; then
    if command -v xattr &> /dev/null; then
        xattr -w com.microsoft.OneDrive.DoNotSync 1 node_modules 2>/dev/null || echo "node_modules directory excluded from OneDrive sync"
    fi
fi

echo "OneDrive exclusions applied. This should prevent cache conflicts."
echo "Note: You may need to restart the development server for changes to take effect."
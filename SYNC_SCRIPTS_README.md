# Project Sync Scripts

Two-way sync scripts to keep your local development environment and OneDrive backup in sync.

## Overview

- **Local Development**: `~/Projects/WhitedgeLMS` (fast, recommended)
- **OneDrive Backup**: `~/Library/CloudStorage/OneDrive-Personal/Work/WhitedgeLMS`

## Scripts

### 1. Sync Local → OneDrive (Backup)
```bash
./sync-to-onedrive.sh
```
Use this after making changes locally that you want to backup to OneDrive.

**What it does:**
- Copies all source files from local to OneDrive
- Excludes: `node_modules/`, `.next/`, `.git/`, build artifacts
- Safe to run anytime

### 2. Sync OneDrive → Local (Pull Changes)
```bash
./sync-from-onedrive.sh
```
Use this if you've made changes on OneDrive that you want to pull to local.

**What it does:**
- Copies all source files from OneDrive to local
- Excludes: `node_modules/`, `.next/`, `.git/`, build artifacts
- Safe to run anytime

## Typical Workflow

1. **Daily Development**: Work in `~/Projects/WhitedgeLMS`
2. **Before Stopping**: Run `./sync-to-onedrive.sh` to backup changes
3. **Push to GitHub**: Commit and push important changes to GitHub
4. **Next Session**: Start with `./sync-from-onedrive.sh` to catch any changes from OneDrive

## Notes

- These scripts use `rsync` which comes pre-installed on macOS
- They automatically skip node_modules to avoid OneDrive timeout issues
- `.git` directory is also excluded to prevent merge conflicts
- Both scripts are safe to run multiple times

## Troubleshooting

If OneDrive is hanging while syncing:
- The local → OneDrive sync is usually slower due to OneDrive's file system
- If it times out, try running it again - rsync will resume
- For large syncs, consider doing smaller batches

## Git Workflow (Recommended)

For production code:
```bash
cd ~/Projects/WhitedgeLMS
git add .
git commit -m "Your message"
git push origin main
```

Then backup to OneDrive:
```bash
./sync-to-onedrive.sh
```

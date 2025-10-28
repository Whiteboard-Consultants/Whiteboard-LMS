# Development Setup Guide

## Common Issues and Solutions

### Webpack Cache Errors
If you see errors like:
```
[webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT: no such file or directory
```

**Solution:**
1. Stop the dev server (`Ctrl+C`)
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server: `npm run dev`

### Fast Refresh Warnings
If you see:
```
Fast Refresh had to perform a full reload
```

This is normal after structural changes to React components. The page will reload automatically.

### OneDrive Sync Conflicts
Since this project is in OneDrive, avoid sync conflicts by:

1. Run the exclusion script: `./exclude-from-onedrive.sh`
2. The following directories are automatically excluded:
   - `.next/` (build cache)
   - `node_modules/` (dependencies)

### Development Commands

#### Clean Development Start
```bash
# Full clean start
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

#### Quick Cache Clear
```bash
# Just clear build cache
rm -rf .next
npm run dev
```

### Performance Tips

1. **Keep dependencies updated**: Run `npm audit fix` periodically
2. **Use specific ports**: If port 3000 is busy, Next.js will use 3001 automatically
3. **Monitor memory usage**: Restart dev server if it becomes sluggish
4. **Exclude from OneDrive**: Run `./exclude-from-onedrive.sh` after fresh clones

### Troubleshooting Checklist

- [ ] Clear `.next` directory
- [ ] Restart dev server
- [ ] Check OneDrive exclusions are applied
- [ ] Verify no port conflicts (3000, 3001)
- [ ] Check terminal for specific error messages
- [ ] Run `npm install` if dependencies seem corrupted

### Environment Setup
Make sure you have:
- Node.js 18+ 
- npm 9+
- Proper environment variables in `.env.local`

### Contact
If issues persist, check the terminal output for specific error messages and consult the Next.js documentation at https://nextjs.org/docs
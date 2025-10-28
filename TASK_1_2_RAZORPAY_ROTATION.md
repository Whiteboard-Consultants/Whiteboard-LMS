# 🚨 PHASE 1, TASK 1.2: RAZORPAY KEY ROTATION - DETAILED GUIDE

**Criticality**: 🔴 CRITICAL  
**Estimated Time**: 30 minutes  
**Status**: Ready to execute after Task 1.1

---

## ⚠️ ATTENTION: THESE ARE LIVE KEYS!

Your `.env.local` contains these Razorpay LIVE credentials:

```
RAZORPAY_KEY_ID=rzp_live_RS4vYhESlsRtar
RAZORPAY_KEY_SECRET=WHuCvGKnbOmNNSD51LGuvF93
```

**CRITICAL RISKS**:
- 🚨 These are LIVE keys (not test keys)
- 🚨 Anyone with these can process real payments using YOUR account
- 🚨 Your customers' money could be stolen
- 🚨 Fraudulent charges could be made
- 🚨 Must rotate IMMEDIATELY

---

## Step-by-Step Rotation Process

### STEP 1: Open Razorpay Dashboard (5 minutes)

1. **Open**: https://dashboard.razorpay.com
2. **Log in** with your Razorpay account (same email/password as signup)
3. **Go to**: Settings icon (⚙️) → **API Keys**

You should see:
```
┌─────────────────────────────────────────┐
│ API Keys                                │
├─────────────────────────────────────────┤
│                                         │
│ Live Mode (🔴 CURRENTLY USING)         │
│                                         │
│ Key ID:          rzp_live_RS4vYhES...  │
│ Secret:          WHuCvGKnbOmNNSD...    │
│                                         │
│ [Regenerate API Key] [View] [Edit]     │
│                                         │
└─────────────────────────────────────────┘
```

**Make sure**: You see "Live Mode" (not Test Mode). Test keys are fine to rotate later.

---

### STEP 2: Regenerate Live API Keys (15 minutes)

1. **Look for**: "Regenerate API Key" button (should be on the Live section)
2. **Click**: Regenerate API Key
3. **Warning Dialog**: You'll see a warning:
   ```
   WARNING: Regenerating your API keys will invalidate 
   existing keys. All integrations using the current keys 
   will stop working until updated.
   ```
4. **Confirm**: Click "I understand, regenerate" or similar
5. **Wait**: Takes 10-15 seconds to generate
6. **Result**: New Key ID and Secret appear

---

### STEP 3: Copy New Keys (5 minutes)

**Copy the NEW keys carefully:**

```
NEW_KEY_ID: rzp_live_XXXXXXXXXXXX
NEW_SECRET: XXXXXXXXXXXXXXXXXXXXXXXX
```

**Paste into temporary file:**
```bash
cat > /tmp/razorpay_new_keys.txt << 'EOF'
NEW_RAZORPAY_KEY_ID=<paste your new key ID here>
NEW_RAZORPAY_KEY_SECRET=<paste your new secret here>
EOF
```

---

### STEP 4: Update .env.local (5 minutes)

1. **Open**: `.env.local` in your editor
2. **Find**: `RAZORPAY_KEY_ID=rzp_live_RS4vYhESlsRtar`
3. **Replace** with: Your NEW key ID
4. **Find**: `RAZORPAY_KEY_SECRET=WHuCvGKnbOmNNSD51LGuvF93`
5. **Replace** with: Your NEW secret
6. **Save** the file

---

### STEP 5: Test Payment Flow (5 minutes)

1. **Start dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Go to** any course page where you can initiate payment
3. **Click** "Enroll" or "Buy Course"
4. **Look for**: Razorpay payment modal
5. **Expected**: Payment modal should load (may show as test payment)
6. **Don't charge**: Just verify it opens without errors

**If payment modal opens**: ✅ Razorpay keys working correctly!

---

## Verification Checklist

✅ **Complete when all are checked:**

- [ ] Accessed Razorpay dashboard
- [ ] Located API Keys section in Settings
- [ ] Confirmed in Live Mode (not Test)
- [ ] Clicked Regenerate API Key
- [ ] Confirmed the warning dialog
- [ ] Copied NEW Key ID
- [ ] Copied NEW Secret
- [ ] Updated RAZORPAY_KEY_ID in `.env.local`
- [ ] Updated RAZORPAY_KEY_SECRET in `.env.local`
- [ ] Payment modal loads in dev environment
- [ ] No payment errors in browser console

---

## Important Notes

### Test Mode vs Live Mode

- **Test Mode** (`rzp_test_XXXXX`): Safe to experiment, no real charges
- **Live Mode** (`rzp_live_XXXXX`): Real money transfers, must protect carefully

Your old keys were in Live Mode, so they need immediate rotation.

### Multiple Integrations?

If you use Razorpay in multiple places:
- Check all your deployment environments (dev, staging, production)
- Update `.env.local` (development)
- Update `.env.production` later (production)
- Update any CI/CD pipeline secrets

---

## Troubleshooting

### ❌ "Invalid API Key" error when trying to pay

**Problem**: Dev server still using old keys  
**Solution**:
1. Stop dev server: `pkill -f "next dev"`
2. Verify `.env.local` has NEW keys
3. Clear browser cache (DevTools → Application → Clear)
4. Restart: `npm run dev`

### ❌ "Cannot regenerate" or button disabled

**Problem**: You might not have permission or need to wait  
**Solution**:
1. Refresh the Razorpay dashboard
2. Try in an incognito browser window
3. Check if account has 2FA enabled (might need verification)
4. Contact Razorpay support if button still doesn't work

### ❌ Payment still uses old key

**Problem**: Environment not reloaded  
**Solution**:
1. Completely stop the dev server: `pkill -f "next dev"`
2. Wait 3 seconds
3. Delete `.next` cache: `rm -rf .next`
4. Restart: `npm run dev`

---

## What Just Happened?

✅ **Old Razorpay keys are now INACTIVE** - they no longer work  
✅ **New Razorpay keys are now ACTIVE** - your app uses these  
✅ **`.env.local` is updated** - development ready  

**Security Improvement**:
- Old credentials leaked in git are now useless
- Future payments will use new secured credentials
- Old compromised keys cannot be used to process payments

---

## Next Steps

After Razorpay keys are rotated ✅:

1. **Mark Task 1.2 Complete** in PHASE_1_EXECUTION_LOG.md
2. **Proceed to Task 1.3**: Gemini API Key Rotation
3. **Continue through**: Task 1.4 (Gmail), 1.5 (Git cleanup), 1.6 (.env.production)

---

## Quick Reference

```bash
# View your current Razorpay keys
grep RAZORPAY .env.local

# Stop dev server
pkill -f "next dev"

# Restart dev server
npm run dev

# Check payment endpoint logs
tail -f /tmp/next-dev.log | grep -i razorpay
```

---

**Ready?** When you've completed Task 1.2, reply with "Task 1.2 Complete" and we'll move to Task 1.3: Gemini API!

---

*Estimated Time: 30 minutes*  
*Difficulty: Easy (mostly dashboard navigation)*  
*Importance: 🔴 CRITICAL - Live payment keys must be protected*

# Payment Gateway Integration Guide

## Overview
The purchase flow now includes Razorpay payment gateway integration for India-based customers.

## Setup Steps

### 1. Get Razorpay Keys
1. Go to https://dashboard.razorpay.com
2. Sign up or login with your business account
3. Go to **Settings > API Keys**
4. Copy your **Key ID** and **Key Secret**

### 2. Add Environment Variables
Add these to your `.env.local` file:
```
RAZORPAY_KEY_ID=your_key_id_from_dashboard
RAZORPAY_KEY_SECRET=your_key_secret_from_dashboard
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id_from_dashboard
```

### 3. Install Razorpay Package
```bash
npm install razorpay
```

## Purchase Flow

### Unauthenticated User
1. User visits `/mock-tests`
2. Clicks "Start" on a paid test
3. Sees purchase card with price
4. Clicks "Buy Test Access"
5. **Redirected to login page** → Login/Signup
6. **Redirected back** to test page
7. Purchase card shows again
8. Clicks "Buy Test Access" again
9. **Razorpay payment modal opens**
10. User completes payment
11. **Upon success**: Enrollment created, access granted
12. **User sees TestTaker component**

### Authenticated User (Already Logged In)
1. User visits `/student/tests/{testId}/take`
2. TestAccessGate checks if test is paid
3. If paid and no purchase: Shows purchase card
4. User clicks "Buy Test Access"
5. **Razorpay payment modal opens**
6. User completes payment
7. **Upon success**: Enrollment created, access granted
8. **TestTaker component loads**

## Payment Processing

### Create Order (`/api/payment/create-order`)
- Creates a Razorpay order
- Stores transaction metadata (userId, testId, seriesId)
- Returns order ID to frontend

### Verify Payment (`/api/payment/verify-payment`)
- Receives payment details from Razorpay
- Verifies signature using secret key
- Confirms payment status with Razorpay API
- Returns success/failure to frontend

### Create Enrollment
- After payment verification succeeds
- `purchaseIndividualTest()` or `purchaseSeriesPackage()` is called
- Creates enrollment record in database
- User gains instant access

## Test Mode (Sandbox)

### Razorpay Test Cards
For testing without real payments:
- **Success**: `4111 1111 1111 1111` (any future expiry, any CVV)
- **Failure**: `4000 0000 0000 0002` (any future expiry, any CVV)

### Testing in Staging
1. Use Razorpay sandbox credentials
2. Test payments won't charge actual cards
3. Orders still created in Supabase database

## Security

### Payment Verification
- All payments verified server-side using signature
- Secret key NEVER exposed to frontend
- Enrollment only created after verification

### PCI Compliance
- Razorpay handles all card data (PCI DSS Level 1)
- No card data stored in our database
- Only payment metadata stored

### Environment Variables
- `RAZORPAY_KEY_SECRET` - NEVER commit to git, only in `.env.local`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public, safe to expose

## Troubleshooting

### Payment Modal Not Opening
- Check if Razorpay script loaded: Open DevTools > Network tab
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`
- Check browser console for errors

### Payment Fails with "Order Not Found"
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- Check if order creation endpoint is accessible
- Look at server logs for API errors

### Signature Verification Failed
- Ensure `RAZORPAY_KEY_SECRET` is exact (no extra spaces)
- Check if payment verification endpoint is accessible
- Verify webhook is properly configured (if using)

## Future Enhancements

1. **Subscription Plans**
   - Monthly/yearly series access
   - Auto-renewal functionality

2. **Refunds**
   - Manual refund processing
   - Automated refund policy

3. **Invoicing**
   - Generate PDF invoices
   - Email receipts

4. **Analytics**
   - Revenue tracking
   - Payment success rate monitoring
   - Customer purchase history

5. **Multiple Payment Methods**
   - Credit/Debit cards (via Razorpay)
   - UPI payments
   - Digital wallets
   - Net Banking

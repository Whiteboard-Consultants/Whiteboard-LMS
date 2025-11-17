# Phase 1 Analytics Implementation - Setup & Usage Guide

**Date:** November 17, 2025  
**Status:** ✅ IMPLEMENTED & READY

---

## ✅ What's Been Done

### 1. **Google Analytics 4 (GA4)**
- ✅ Environment variable configured: `NEXT_PUBLIC_GA_ID`
- ✅ Google Analytics component created (`src/components/google-analytics.tsx`)
- ✅ Integrated into root layout
- ✅ Automatic page view tracking enabled

### 2. **Meta Pixel (Facebook Pixel)**
- ✅ Environment variable configured: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
- ✅ Meta Pixel component created (`src/components/meta-pixel.tsx`)
- ✅ Integrated into root layout
- ✅ Automatic PageView event tracking enabled

### 3. **Event Tracking Libraries**
- ✅ Analytics library created (`src/lib/analytics.ts`)
  - `trackEvent()` - Custom GA4 event function
  - `AnalyticsEvents` - Pre-built event functions for common actions
  
- ✅ Facebook Pixel library created (`src/lib/facebook-pixel.ts`)
  - `trackPixelEvent()` - Custom pixel event function
  - `FacebookPixelEvents` - Pre-built event functions
  - `initMetaPixel()` - Pixel initialization

---

## 📋 Configuration Required

### Step 1: Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com)
2. Click "Start Measuring"
3. Create property:
   - Name: `WhitedgeLMS`
   - Timezone: Your timezone
   - Currency: INR
4. Select **Web** platform
5. Add website data:
   - URL: `https://whitedgelms.vercel.app`
   - Stream name: `WhitedgeLMS Web`
6. Copy **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 2: Update .env.local with GA4 ID

```env
NEXT_PUBLIC_GA_ID=G-YOUR_MEASUREMENT_ID_HERE
```

### Step 3: Get Your Meta Pixel ID

1. Go to [Facebook Business Manager](https://business.facebook.com)
2. Navigate to Data Sources → Pixels
3. Create new pixel or get existing ID
4. Copy **Pixel ID** (16-digit number)

### Step 4: Update .env.local with Pixel ID

```env
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id_here
```

### Step 5: Deploy Environment Variables

- **Local Dev:** Changes to `.env.local` take effect on next dev server restart
- **Vercel Production:** Add variables to Vercel project settings → Environment Variables

---

## 🔍 Available Event Tracking Functions

### Google Analytics 4 Events

```typescript
import { AnalyticsEvents } from '@/lib/analytics';

// User Events
AnalyticsEvents.userRegistration(email, role);
AnalyticsEvents.userLogin(role);

// Course Events
AnalyticsEvents.courseView(courseId, courseName, instructorId);
AnalyticsEvents.courseEnrolled(courseId, courseName, amount);

// Payment Events
AnalyticsEvents.paymentInitiated(courseId, amount);
AnalyticsEvents.paymentCompleted(courseId, amount, orderId);
AnalyticsEvents.paymentFailed(courseId, amount, reason);

// Coupon Events
AnalyticsEvents.couponApplied(couponCode, discountAmount);

// Quiz/Test Events
AnalyticsEvents.testStarted(testId, testName, courseId);
AnalyticsEvents.testCompleted(testId, score, totalQuestions);

// Certificate Events
AnalyticsEvents.certificateDownloaded(courseId, certificateId);

// Content Events
AnalyticsEvents.lessonViewed(courseId, lessonId, lessonTitle);

// Contact Events
AnalyticsEvents.contactFormSubmitted(subject, email);
```

### Meta Pixel Events

```typescript
import { FacebookPixelEvents } from '@/lib/facebook-pixel';

// Standard Events
FacebookPixelEvents.pageView(); // Auto-called on load
FacebookPixelEvents.viewContent(contentId, contentName, contentType);
FacebookPixelEvents.addToCart(value, contentId, contentName);
FacebookPixelEvents.purchase(value, courseId, courseName);
FacebookPixelEvents.lead(email, phone, firstName, lastName);
FacebookPixelEvents.completeRegistration(email, firstName, lastName);

// Course-Specific Events
FacebookPixelEvents.courseEnrolled(courseId, courseName, price);
FacebookPixelEvents.testCompleted(testId, score);
FacebookPixelEvents.certificateDownloaded(courseId, certificateId);

// Engagement Events
FacebookPixelEvents.videoWatched(videoId, videoName, duration);
FacebookPixelEvents.contentEngaged(contentId, contentType);
```

---

## 📊 Integration Examples

### Example 1: Track Course Enrollment

```typescript
// In your course enrollment handler
import { AnalyticsEvents } from '@/lib/analytics';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';

async function enrollCourse(courseId: string, courseName: string, price: number) {
  try {
    // Enrollment logic...
    const enrollment = await createEnrollment(courseId);

    // Track in GA4
    AnalyticsEvents.courseEnrolled(courseId, courseName, price);

    // Track in Meta Pixel
    FacebookPixelEvents.purchase(price, courseId, courseName);

    return enrollment;
  } catch (error) {
    console.error('Enrollment failed:', error);
  }
}
```

### Example 2: Track Test Completion

```typescript
// In your test completion handler
import { AnalyticsEvents } from '@/lib/analytics';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';

async function submitTest(testId: string, score: number, total: number) {
  try {
    // Save test result...
    
    // Track in GA4
    AnalyticsEvents.testCompleted(testId, score, total);

    // Track in Meta Pixel
    FacebookPixelEvents.testCompleted(testId, score);

    return result;
  } catch (error) {
    console.error('Test submission failed:', error);
  }
}
```

### Example 3: Track Payment Completion

```typescript
// In your payment success handler
import { AnalyticsEvents } from '@/lib/analytics';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';

async function handlePaymentSuccess(orderId: string, courseId: string, amount: number) {
  // Track in GA4
  AnalyticsEvents.paymentCompleted(courseId, amount, orderId);

  // Track in Meta Pixel
  FacebookPixelEvents.purchase(amount, courseId);
}
```

---

## 📍 Recommended Event Placement

| Location | Event | Purpose |
|----------|-------|---------|
| Registration form submit | `userRegistration` | Track signup conversions |
| Login success | `userLogin` | Track active users by role |
| Course detail page load | `courseView` | Understand course interest |
| Enrollment button click | `courseEnrolled` | Track sales funnel |
| Payment button click | `paymentInitiated` | Track checkout behavior |
| Payment success | `paymentCompleted` | Track successful conversions |
| Test completion | `testCompleted` | Track engagement depth |
| Certificate download | `certificateDownloaded` | Track completion value |
| Contact form submit | `contactFormSubmitted` | Track lead generation |

---

## 🧪 Testing the Implementation

### Test GA4:
1. Go to [Google Analytics Real-time](https://analytics.google.com) → Real-time
2. Visit your site in a browser
3. You should see real-time visitor data within 2-3 seconds

### Test Meta Pixel:
1. Install [Meta Pixel Helper](https://chrome.google.com/webstore) Chrome extension
2. Open it on your site
3. You should see pixel initialization and PageView event firing

### Test Custom Events:
```typescript
// In browser console
// For GA4
window.gtag('event', 'test_event', {value: 123});

// For Meta Pixel
window.fbq('track', 'Test', {value: 123});
```

---

## 📈 Dashboard Access

### Google Analytics 4
- **URL:** https://analytics.google.com
- **Dashboard Sections:**
  - Real-time → Live visitor data
  - Reports → Engagement, Conversion, Audience
  - Explore → Custom analysis

### Meta Pixel / Facebook Business Manager
- **URL:** https://business.facebook.com
- **Sections:**
  - Ads Manager → Campaign performance
  - Pixels → Conversion tracking, Audience building
  - Events Manager → Real-time event monitoring

---

## 🔐 Privacy & GDPR Compliance

### Current Configuration:
- `anonymize_ip: true` - IP addresses are anonymized in GA4
- `allow_ad_personalization_signals: false` - Disabled personalization by default
- Email hashing in Meta Pixel events for privacy

### For Full GDPR Compliance:
1. Add cookie consent banner using [Google Consent Mode](https://support.google.com/analytics/answer/9976101)
2. Update Terms of Service with analytics disclosure
3. Only track after user consent

---

## 📝 Next Steps (Phase 2)

When ready, Phase 2 includes:
1. **Google Tag Manager** - Centralized tag management
2. **Simple Chatbot** - Tidio integration for customer support

---

## 📞 Troubleshooting

### GA4 not showing events:
- Verify `NEXT_PUBLIC_GA_ID` is set correctly
- Check GA4 property in Google Analytics → Data Streams
- Check [Real-time Report](https://analytics.google.com) within 2-3 seconds

### Meta Pixel not tracking:
- Verify `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` is set correctly
- Use Meta Pixel Helper extension to debug
- Check [Events Manager](https://business.facebook.com/events_manager) in Business Manager

### Environment variables not updating:
- Restart dev server: `npm run dev`
- Clear `.next` folder: `rm -rf .next && npm run dev`
- For Vercel: Re-deploy after updating environment variables

---

## ✨ Summary

**Phase 1 is COMPLETE!**

You now have:
- ✅ Google Analytics 4 fully integrated
- ✅ Meta Pixel fully integrated
- ✅ Ready-to-use event tracking libraries
- ✅ Pre-built event functions for common actions
- ✅ Automatic page view tracking

**What to do now:**
1. Get your GA4 Measurement ID
2. Get your Meta Pixel ID
3. Update `.env.local` with the IDs
4. Restart your dev server
5. Test the dashboards
6. Start using the event tracking functions throughout your app

---

*Document Created: November 17, 2025*  
*Implementation: Complete*  
*Status: Ready for Production*

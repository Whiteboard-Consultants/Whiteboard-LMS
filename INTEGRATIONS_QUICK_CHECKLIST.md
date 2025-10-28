# Third-Party Integrations - Quick Implementation Checklist

**Date:** October 23, 2025

---

## 🎯 Quick Links & Setup

### Google reCAPTCHA Setup
- [ ] Go to: https://www.google.com/recaptcha/admin
- [ ] Create project for WhitedgeLMS
- [ ] Choose reCAPTCHA v3
- [ ] Add domains (localhost, vercel.app, custom)
- [ ] Copy **Site Key** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- [ ] Copy **Secret Key** → `RECAPTCHA_SECRET_KEY`
- [ ] Add both to `.env.local` and `.env.production`

### Google Analytics Setup
- [ ] Go to: https://analytics.google.com
- [ ] Create new property
- [ ] Select platform: Web
- [ ] Add website: https://whitedgelms.vercel.app
- [ ] Copy **Measurement ID** → `NEXT_PUBLIC_GA_ID`
- [ ] Add to `.env.local` and `.env.production`

### Google Tag Manager Setup
- [ ] Go to: https://tagmanager.google.com
- [ ] Create account: Whiteboard Consultants
- [ ] Create container: WhitedgeLMS Web
- [ ] Copy **Container ID** → `NEXT_PUBLIC_GTM_ID`
- [ ] Add to `.env.local` and `.env.production`
- [ ] Link GA4 to GTM in GTM dashboard

### Meta Pixel Setup
- [ ] Go to: https://business.facebook.com
- [ ] Create Business account (if needed)
- [ ] Create Pixel
- [ ] Copy **Pixel ID** → `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
- [ ] Add to `.env.local` and `.env.production`
- [ ] Add conversion tracking in Meta Ads

### Chatbot Setup (Choose One)

#### Option A: Tidio (Easiest - 5 minutes)
- [ ] Go to: https://www.tidio.com
- [ ] Sign up
- [ ] Create Chat Widget
- [ ] Copy **Widget ID**
- [ ] Add script to `src/app/layout.tsx`

#### Option B: Custom AI Chatbot (Using Gemini)
- [ ] You already have `GEMINI_API_KEY` configured ✅
- [ ] Copy API route code from integration guide
- [ ] Copy chatbot component code
- [ ] Add to `src/app/layout.tsx`
- [ ] Test in development

#### Option C: Intercom (Professional)
- [ ] Go to: https://app.intercom.com
- [ ] Create account
- [ ] Copy **App ID**
- [ ] Add to `.env.local` and `.env.production`
- [ ] Add script to layout

---

## 📋 Environment Variables Template

```bash
# Google reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXXXX

# Meta Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789

# Chatbot (if using custom AI)
NEXT_PUBLIC_CHATBOT_ENABLED=true
```

---

## 🔧 Code Implementation Steps

### 1. Install Dependencies (If Needed)
```bash
npm install @next/third-parties
# (already have most dependencies)
```

### 2. Create Components

#### For reCAPTCHA:
- [ ] Create `src/components/recaptcha-wrapper.tsx`
- [ ] Add to registration form component
- [ ] Create verification route in API

#### For Chatbot:
- [ ] Create `src/components/ai-chatbot.tsx` (if custom)
- [ ] Create `src/app/api/chat/route.ts`
- [ ] Add utility functions in `src/lib/facebook-pixel.ts`

### 3. Update Layout
- [ ] Update `src/app/layout.tsx` with:
  - [ ] Google Analytics tag
  - [ ] Google Tag Manager tag
  - [ ] Meta Pixel initialization
  - [ ] Chatbot component (if using custom)

### 4. Add Tracking Events
- [ ] Track page views (auto)
- [ ] Track user registration
- [ ] Track course enrollment
- [ ] Track payment completion
- [ ] Track quiz completion

### 5. Test Everything
- [ ] Test GA - see events in real-time
- [ ] Test Meta Pixel - verify conversion tracking
- [ ] Test reCAPTCHA - submit form on dev
- [ ] Test Chatbot - send message
- [ ] Test GTM - verify tags fire

---

## 📊 What to Measure After Setup

### Google Analytics
- [ ] Daily active users
- [ ] Course enrollment rate
- [ ] Bounce rate by page
- [ ] Time on site
- [ ] Device breakdown (mobile vs desktop)

### Meta Pixel
- [ ] Conversion events tracked
- [ ] Cost per conversion
- [ ] ROAS (Return on Ad Spend)
- [ ] Audience size for retargeting
- [ ] Pixel status (active)

### Google reCAPTCHA
- [ ] Bot attempts blocked
- [ ] Form submission rate
- [ ] False positive rate

### Chatbot
- [ ] Conversation count
- [ ] Average message count
- [ ] Response time
- [ ] User satisfaction (if available)

---

## 🚀 Recommended Implementation Timeline

### Day 1: Quick Wins (2 hours)
- [ ] Google Analytics setup (30 min)
- [ ] Meta Pixel setup (30 min)
- [ ] Add to layout.tsx (30 min)
- [ ] Verify both work (30 min)

### Day 2: Form Protection (1-2 hours)
- [ ] Google reCAPTCHA setup (30 min)
- [ ] Create reCAPTCHA component (30 min)
- [ ] Add to registration form (30 min)
- [ ] Test verification endpoint (30 min)

### Day 3: Advanced Tracking (1-2 hours)
- [ ] Google Tag Manager setup (30 min)
- [ ] Link GA to GTM (30 min)
- [ ] Create custom events (30 min)
- [ ] Verify tracking in GTM dashboard (30 min)

### Day 4: Chatbot (2-4 hours)
- [ ] Choose chatbot option (Tidio vs Custom)
- [ ] If Tidio: 30 min setup + embed
- [ ] If Custom: 2-4 hours for full setup

---

## ✅ Testing Checklist

### Before Going Live
- [ ] Google Analytics seeing page views
- [ ] Meta Pixel conversion events firing
- [ ] reCAPTCHA blocking bots on form
- [ ] GTM tags all working
- [ ] Chatbot responding to messages
- [ ] No console errors

### After Deployment to Vercel
- [ ] All tracking still working
- [ ] Verify production URLs set correctly
- [ ] Test from different device
- [ ] Check analytics in dashboards
- [ ] Verify Meta pixel in production
- [ ] Chatbot working with live data

---

## 🔐 Security Reminders

### Keep Secret
- `RECAPTCHA_SECRET_KEY` - Server only
- `GEMINI_API_KEY` - Server only (if using custom chatbot)
- `OPENAI_API_KEY` - Server only (if using OpenAI)

### Safe to Expose (Public)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
- `NEXT_PUBLIC_CHATBOT_ENABLED`

### Vercel Configuration
- [ ] Mark secret keys as "Encrypted" in Vercel
- [ ] Set scope to "Production"
- [ ] Do NOT commit `.env` files to git
- [ ] Use `.env.production` template only

---

## 💰 Cost Summary

### Free Services ✅
- Google Analytics
- Google Tag Manager
- Google reCAPTCHA
- Meta Pixel
- Tidio (basic tier)
- Gemini API (you already have)

### Paid Services (Optional)
- Tidio Pro: $25/month
- Intercom: $39+/month
- Custom OpenAI: $10-50/month

**Recommendation:** Start with free tier, upgrade later if needed

---

## 📞 Support Resources

| Service | Docs | Support |
|---------|------|---------|
| Google Analytics | https://support.google.com/analytics | Analytics Help |
| reCAPTCHA | https://developers.google.com/recaptcha | Google Dev |
| GTM | https://support.google.com/tagmanager | GTM Help |
| Meta Pixel | https://www.facebook.com/help | Meta Support |
| Tidio | https://help.tidio.com | Tidio Help |
| OpenAI | https://platform.openai.com/docs | API Docs |

---

## 🎯 Success Criteria

✅ **Implementation Complete When:**

- [ ] All environment variables added to Vercel
- [ ] All services showing data in dashboards
- [ ] No TypeScript/Console errors
- [ ] Tracking events logging correctly
- [ ] Forms protected with reCAPTCHA
- [ ] Chatbot responsive to users
- [ ] Tags firing in GTM
- [ ] Conversions tracked in Meta

---

## Next Phase: Advanced (Optional)

After basic setup, consider:

1. **Custom Dashboards**
   - Build internal analytics dashboard
   - Real-time conversion tracking
   - Revenue attribution

2. **Advanced Segmentation**
   - User cohort analysis
   - Behavioral patterns
   - Conversion funnels

3. **Marketing Automation**
   - Automated email sequences
   - Lead scoring
   - Retargeting campaigns

4. **Advanced Chatbot**
   - Course-specific FAQs
   - Lead qualification
   - Integration with CRM

---

*Last Updated: October 23, 2025*  
*For: WhitedgeLMS Production Deployment*

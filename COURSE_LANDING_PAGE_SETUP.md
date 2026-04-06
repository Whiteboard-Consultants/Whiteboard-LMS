# Resume Mastery Course Landing Page - Setup Guide

## 🚀 Overview

This complete landing page system includes:
- ✅ Multi-step progressive form (10 steps)
- ✅ Beautiful hero section with course overview
- ✅ Benefits, curriculum, and FAQ sections
- ✅ React Hook Form with Zod validation
- ✅ Supabase integration for data storage
- ✅ API route for form submissions
- ✅ Responsive design (mobile-first)
- ✅ Toast notifications for user feedback

---

## 📋 Files Created

### Database
- `migrations/20260327_create_course_landing_form_responses.sql` - Supabase table schema and RLS policies

### Form Components
- `src/components/landing/course-landing-form.tsx` - 10-step progressive form
- `src/components/landing/course-landing-hero.tsx` - Hero section with course overview
- `src/components/landing/course-benefits.tsx` - Benefits and what you'll learn
- `src/components/landing/course-faq.tsx` - FAQ accordion section

### Pages & API
- `src/app/(public)/landing/resume-mastery/page.tsx` - Main landing page
- `src/app/api/landing/course-form/route.ts` - Form submission API endpoint

### Validation
- `src/lib/schemas/landing-form.ts` - Zod schema and form options

---

## 🔗 URL Recommendations

### Recommended Options (in order of preference):

#### Option 1: Dedicated Subdomain (RECOMMENDED)
```
resume-mastery.whiteboardconsultant.com
```
**Pros:**
- Clean, branded URL
- Easy to track in marketing campaigns
- SEO-friendly
- Professional appearance

**Setup:**
1. Add DNS CNAME record: `resume-mastery` → `www.whiteboardconsultant.com`
2. Configure custom domain in Vercel dashboard
3. Deploy with `next.config.ts` redirects if needed

---

#### Option 2: Campaign Subdomain
```
courses.whiteboardconsultant.com/resume-mastery-2026
```
**Pros:**
- All courses under one domain
- Scalable for future courses
- Centralized domain authority

---

#### Option 3: Direct Path Integration
```
www.whiteboardconsultant.com/landing/resume-mastery
```
**Pros:**
- Simple deployment (no DNS setup)
- Already deployed on your Next.js app

---

## 🛠️ Setup Instructions

### 1. Apply Database Migration

Run the migration file in your Supabase dashboard:

```bash
# Copy the SQL from migrations/20260327_create_course_landing_form_responses.sql
# Paste into Supabase SQL Editor and execute
```

Or use psql:
```bash
psql -h db.supabase.co -U postgres -d postgres \
  -f migrations/20260327_create_course_landing_form_responses.sql
```

### 2. Verify Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install Dependencies

All dependencies are already in your `package.json`:
- ✅ `react-hook-form` - Form state management
- ✅ `zod` - Type-safe validation
- ✅ `@hookform/resolvers` - Zod integration
- ✅ `sonner` - Toast notifications
- ✅ `@radix-ui/*` - UI components

### 4. Test Locally

```bash
# Start dev server
npm run dev

# Navigate to
http://localhost:3000/landing/resume-mastery
```

### 5. Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Vercel will auto-deploy
# Visit your production URL
```

---

## 🎨 Customization Options

### A. Update Course Information

Edit `src/app/(public)/landing/resume-mastery/page.tsx`:

```typescript
const COURSE_DATA = {
  id: '73f0185c-b5c2-4407-8ffe-17eb6a1350e7', // Your course ID
  title: 'Your Course Title',
  duration: '10 hours',
  students: 3,
  instructor: 'Instructor Name',
  price: 549,
};
```

### B. Customize Form Questions

Edit `src/lib/schemas/landing-form.ts`:

```typescript
// Add/remove form fields
// Update enum options
// Modify validation rules
```

### C. Change Colors

Edit component files (uses Tailwind CSS):
- Primary color: `bg-blue-600` → change to your brand color
- Replace all `blue-*` with your desired color

### D. Add Testimonials

In `src/app/(public)/landing/resume-mastery/page.tsx`, add new section:

```typescript
<section className="py-20 bg-gray-50">
  {/* Testimonials grid */}
</section>
```

---

## 📊 Form Data Structure

All form responses stored in `landing_form_responses` table:

```json
{
  "id": "UUID",
  "course_id": "course-uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "career_stage": "actively_job_hunting",
  "current_struggle": "User's response...",
  "experience_level": "mid_level_2_5",
  "job_target": "Tech PM at FAANG",
  "ats_awareness": "know_struggle",
  "linkedin_alignment": "partially_aligned",
  "timeline": "one_two_months",
  "decision_maker": "self_funded",
  "outcome_expectation": "User's goal...",
  "response_data": {},
  "source_url": "referrer",
  "user_agent": "user agent string",
  "ip_address": "visitor IP",
  "created_at": "2026-03-27T...",
  "updated_at": "2026-03-27T...",
  "status": "new"
}
```

---

## 📈 Analytics & Lead Management

### View Form Responses in Supabase

```sql
SELECT 
  first_name, 
  email, 
  career_stage, 
  created_at
FROM landing_form_responses
WHERE course_id = '73f0185c-b5c2-4407-8ffe-17eb6a1350e7'
ORDER BY created_at DESC;
```

### Segment by Status

```sql
SELECT status, COUNT(*) 
FROM landing_form_responses 
GROUP BY status;
```

### Export to CSV

Use Supabase UI to export data for email campaigns/outreach

---

## 🔐 Security Features

✅ **RLS Policies**: Only course instructors can see responses
✅ **Validation**: Zod schema validates all inputs server-side
✅ **Rate Limiting**: Implement via Vercel (recommended)
✅ **CSRF Protection**: Built-in with Next.js
✅ **Data Privacy**: Forms don't expose sensitive info in URLs

---

## 🚀 Enhancement Ideas

### Phase 1 (Now)
- [x] Landing page with multi-step form
- [x] Database schema
- [x] API integration

### Phase 2 (Recommended)
- [ ] Email confirmation after form submission
- [ ] Admin notification email to instructor
- [ ] Email marketing list integration (Mailchimp/SendGrid)
- [ ] Lead scoring based on urgency
- [ ] Google Analytics 4 tracking
- [ ] Conversion pixel (Facebook, Google Ads)

### Phase 3 (Advanced)
- [ ] Personalized follow-up sequences
- [ ] A/B testing different CTAs
- [ ] Dynamic pricing based on form answers
- [ ] Integration with CRM (Hubspot, Pipedrive)
- [ ] Before/after video testimonials
- [ ] Live chat support widget

---

## 📱 SEO Optimization

### Meta Tags to Add

```typescript
// src/app/(public)/landing/resume-mastery/page.tsx

export const metadata: Metadata = {
  title: 'Resume & Cover Letter Mastery 2026 | ATS Optimization',
  description: 'Master ATS systems, quantify achievements, and build your professional brand. 10 hours of proven strategies. 30-day guarantee.',
  keywords: 'resume course, ATS optimization, cover letter, job search, career coaching',
  openGraph: {
    title: 'Resume & Cover Letter Mastery 2026',
    description: 'Transform your job search with proven ATS and branding strategies',
    images: ['/resume-mastery-og-image.png'],
  },
};
```

### Schema Markup

Add JSON-LD schema in the page for rich snippets:

```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Resume & Cover Letter Mastery 2026',
      description: '...',
      provider: {
        '@type': 'Organization',
        name: 'Whiteboard Consultants',
      },
      // ... more fields
    }),
  }}
/>
```

---

## 🐛 Troubleshooting

### Form Not Submitting?

1. Check console for errors (F12)
2. Verify Supabase credentials in `.env.local`
3. Ensure `landing_form_responses` table exists
4. Check RLS policies allow inserts

### Form Fields Not Validating?

1. Check Zod schema matches field names
2. Ensure field `name` matches schema key
3. Check error messages display

### API Route 500 Error?

1. Check server logs: `next dev --debug`
2. Verify service role key has table permissions
3. Check SUPABASE_SERVICE_ROLE_KEY is set

---

## 📞 Support

For issues or questions:
1. Check Vercel deployment logs
2. Review Supabase project SQL editor
3. Check browser console for errors
4. Review GitHub Issues

---

## 📄 License & Attribution

Built with:
- Next.js 16
- React Hook Form
- Zod
- Radix UI
- Tailwind CSS
- Supabase

---

## 🎯 Next Steps

1. **Deploy**: Push to GitHub → Vercel auto-deploys
2. **Configure Domain**: Set up `resume-mastery.whiteboardconsultant.com`
3. **Test Form**: Fill out the form and verify data saves to Supabase
4. **Marketing**: Add to ads, email campaigns, social media
5. **Monitor**: Check Supabase dashboard for responses
6. **Follow-up**: Set up email sequences for leads

---

**Last Updated**: March 27, 2026
**Course ID**: 73f0185c-b5c2-4407-8ffe-17eb6a1350e7

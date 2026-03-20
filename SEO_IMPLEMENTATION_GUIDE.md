# SEO/SXO/AEO/GEO Implementation Guide
## WhitedgeLMS Optimization Plan

**Last Updated:** March 20, 2026

---

## Quick Implementation Checklist

### 🔴 PHASE 1: CRITICAL (Week 1-2)

#### [ ] 1. Fix Verification Codes in Layout
**File:** `src/app/layout.tsx`
**Current Lines:** 105-107
**Change:**
```ts
verification: {
  google: 'YOUR_ACTUAL_GOOGLE_CODE_HERE', // TODO: Replace with actual code from GSC
  other: {
    'facebook-domain-verification': 'YOUR_FACEBOOK_VERIFICATION_CODE',
  },
},
```

**Where to Get Codes:**
- Google: Google Search Console → Settings → Ownership verified
- Facebook: Facebook Domain Manager → Add domain

---

#### [ ] 2. Update NAP (Name, Address, Phone) Consistency
**File:** Multiple files
**Current:** `"My Cube', 6th Floor, Park Plaza, 71, Park Street"`
**Change to:** `Park Plaza, 71 Park Street, Floor 6, Kolkata, West Bengal 700016`

**Files to Update:**
1. `src/app/layout.tsx` - Lines 168-170
2. `src/lib/seo.ts` - Lines 15-17
3. `src/components/structured-data.tsx` - Lines 122-128
4. `src/components/seo-optimizations.tsx` - If referenced

**Phone Format:**
- Current: `+91-85830-35656`
- Change to: `+91 8583 035656` (remove dashes, add spaces)

---

#### [ ] 3. Add Core Web Vitals Targets
**File:** Create `src/lib/web-vitals-config.ts`

```ts
// src/lib/web-vitals-config.ts
export const WEB_VITALS_TARGETS = {
  // LCP (Largest Contentful Paint)
  LCP: {
    good: 2500,        // 2.5 seconds
    needsImprovement: 4000, // 4.0 seconds
    poor: 4000,         // Above 4.0 seconds is poor
  },

  // INP (Interaction to Next Paint) - replaces FID
  INP: {
    good: 200,          // 200 milliseconds
    needsImprovement: 500,  // 500 milliseconds
    poor: 500,          // Above 500ms is poor
  },

  // CLS (Cumulative Layout Shift)
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    poor: 0.25,
  },

  // TTFB (Time to First Byte)
  TTFB: {
    good: 600,          // 600ms
    needsImprovement: 1200, // 1.2s
    poor: 1200,
  },

  // FCP (First Contentful Paint)
  FCP: {
    good: 1800,         // 1.8 seconds
    needsImprovement: 3000, // 3.0 seconds
    poor: 3000,
  },
};

export function getVitalStatus(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const targets = WEB_VITALS_TARGETS[metric as keyof typeof WEB_VITALS_TARGETS];
  if (!targets) return 'poor';
  
  if (value <= targets.good) return 'good';
  if (value <= targets.needsImprovement) return 'needs-improvement';
  return 'poor';
}

export function trackCoreWebVitals() {
  // Alert if any metric is poor
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onLCP(report => {
      const status = getVitalStatus('LCP', report.value);
      if (status === 'poor') {
        console.warn(`❌ LCP is poor: ${report.value}ms`);
      }
    });
    
    onINP(report => {
      const status = getVitalStatus('INP', report.value);
      if (status === 'poor') {
        console.warn(`❌ INP is poor: ${report.value}ms`);
      }
    });
    
    onCLS(report => {
      const status = getVitalStatus('CLS', report.value);
      if (status === 'poor') {
        console.warn(`❌ CLS is poor: ${report.value}`);
      }
    });
  });
}
```

**Then Update** `src/components/seo-optimizations.tsx` **Lines 50-65:**
```ts
import { getVitalStatus } from '@/lib/web-vitals-config';

const trackWebVital = (metric: WebVitalMetric) => {
  const status = getVitalStatus(metric.name, metric.value);
  
  // Send to GA4 with status
  window.gtag?.('event', 'web_vitals', {
    event_category: 'Web Vitals',
    event_label: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
    metric_status: status, // 'good', 'needs-improvement', 'poor'
  });
  
  // Alert if poor
  if (status === 'poor') {
    console.warn(`⚠️ ${metric.name} is poor: ${metric.value}`);
  }
};
```

---

### 🟠 PHASE 2: HIGH PRIORITY (Week 3-4)

#### [ ] 4. Expand FAQ Content
**File:** `src/components/sections/StudyAbroadFaqSection.tsx`

**Current:** 7 FAQs
**Target:** Expand to 25+ comprehensive FAQs

**New FAQs to Add:**

```tsx
const expandedFaqs = [
  // ... existing 7 FAQs ...
  
  // Test Preparation FAQs (8 new)
  {
    question: "What is the ideal IELTS score for studying abroad?",
    answer: "IELTS requirements vary by university and country. Most UK universities require 6.5-7.0, Australia 6.5+, USA typically 6.0+. We provide targeted coaching based on your target university's requirements."
  },
  {
    question: "How much time should I dedicate to TOEFL preparation?",
    answer: "Most students benefit from 2-3 months of focused preparation with 15-20 hours weekly practice. Our accelerated programs can achieve results in 4-6 weeks with intensive coaching."
  },
  {
    question: "What's the difference between IELTS and TOEFL?",
    answer: "IELTS (British English focus) is popular in UK, Australia, Canada. TOEFL (American English) is preferred in USA. IELTS is spoken/written exam, TOEFL is computer-based. We offer coaching for both."
  },
  // ... add more ...
  
  // Cost & Finance FAQs (5 new)
  {
    question: "How much does studying abroad typically cost?",
    answer: "Costs vary: USA ($30,000-60,000/year), UK (£15,000-35,000/year), Canada ($20,000-35,000/year), Australia ($20,000-45,000/year). We help you explore scholarships reducing costs by 20-100%."
  },
  // ... add more ...
];
```

---

#### [ ] 5. Add Image Optimization
**File:** `src/components/sections/PopularDestinationsSection.tsx`
**Lines:** Destination card images

**Current:**
```tsx
<Image
  src={destination.image}
  alt={`Studying in ${destination.name}`}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

**Optimized:**
```tsx
<Image
  src={destination.image}
  alt={`Studying in ${destination.name}: Top universities, admission process, and cost guide for international students`}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
  quality={85}
  priority={index < 3} // Eager load first 3, lazy load rest
  placeholder="blur"
  blurDataURL={destination.blurDataURL} // Add blur placeholder
/>
```

---

#### [ ] 6. Create Location-Specific Schema
**File:** Create `src/lib/location-schema.ts`

```ts
// src/lib/location-schema.ts
export function generateLocationSchema(location: 'kolkata' | 'delhi' | 'bangalore') {
  const locations = {
    kolkata: {
      name: 'Whiteboard Consultants - Kolkata',
      address: 'Park Plaza, 71 Park Street, Kolkata, West Bengal 700016, India',
      phone: '+91 8583 035656',
      geo: { latitude: 22.5574, longitude: 88.3476 },
      areaServed: 'Kolkata, West Bengal, India',
    },
    delhi: {
      name: 'Whiteboard Consultants - Delhi (Coming Soon)',
      address: 'Delhi, India',
      geo: { latitude: 28.7041, longitude: 77.1025 },
      areaServed: 'Delhi, National Capital Region, India',
    },
    bangalore: {
      name: 'Whiteboard Consultants - Bangalore (Coming Soon)',
      address: 'Bangalore, India',
      geo: { latitude: 12.9716, longitude: 77.5946 },
      areaServed: 'Bangalore, Karnataka, India',
    },
  };

  const location_data = locations[location];

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EducationalOrganization"],
    "name": location_data.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": location_data.address.split(',')[0],
      "addressLocality": location_data.address.split(',')[1],
      "addressRegion": location_data.address.split(',')[2],
      "postalCode": location_data.address.split(',')[3],
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location_data.geo.latitude,
      "longitude": location_data.geo.longitude
    },
    "telephone": location_data.phone,
    "areaServed": location_data.areaServed,
  };
}
```

---

#### [ ] 7. Create Review Schema with Real Data
**File:** Update `src/components/structured-data.tsx`

**Current (Placeholder):**
```ts
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "500+",
}
```

**Updated with Real Reviews:**
```ts
function generateAggregateRating(reviews: Review[]) {
  const totalVotes = reviews.length;
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalVotes).toFixed(1);

  return {
    "@type": "AggregateRating",
    "ratingValue": avgRating,
    "reviewCount": totalVotes,
    "bestRating": "5",
    "worstRating": "1",
    // Add up to 5 individual reviews
    "review": reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating
      },
      "reviewBody": review.text,
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.date
    }))
  };
}
```

---

### 🟡 PHASE 3: MEDIUM PRIORITY (Next Month)

#### [ ] 8. Add Table of Contents to Long-Form Pages
**File:** Create `src/components/table-of-contents.tsx`

```tsx
// src/components/table-of-contents.tsx
interface TableOfContentsItem {
  text: string;
  href: string;
  level: 1 | 2 | 3;
}

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  return (
    <nav className="mb-8 p-4 bg-muted rounded-lg" aria-label="Table of Contents">
      <h2 className="font-bold mb-4">Table of Contents</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li 
            key={item.href}
            style={{ marginLeft: `${(item.level - 1) * 20}px` }}
          >
            <a 
              href={item.href}
              className="text-blue-600 hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

**Usage on Destination Pages:**
```tsx
<TableOfContents items={[
  { text: 'Universities in USA', href: '#universities', level: 1 },
  { text: 'Top Ranked Universities', href: '#top-ranked', level: 2 },
  { text: 'Cost of Studying', href: '#cost', level: 1 },
  { text: 'Average Tuition', href: '#tuition', level: 2 },
  { text: 'Scholarships & Financial Aid', href: '#scholarships', level: 1 },
]} />
```

---

#### [ ] 9. Video Transcript Schema
**File:** Create `src/lib/video-schema.ts`

```ts
export function generateVideoSchema(video: {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  uploadDate: string;
  transcript: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description,
    "thumbnailUrl": video.thumbnail,
    "uploadDate": video.uploadDate,
    "duration": video.duration, // PT1M30S format
    "contentUrl": video.url,
    "transcript": video.transcript, // Full transcript text
  };
}
```

---

## Files That Need Updates

### Updated Immediately:

1. **src/app/layout.tsx**
   - Verification codes
   - NAP consistency

2. **src/lib/seo.ts**
   - NAP consistency
   - Add schema generator functions

3. **src/components/seo-optimizations.tsx**
   - Core Web Vitals targets

4. **src/components/structured-data.tsx**
   - Local Business schema expansion
   - Review schema updates

### New Files to Create:

1. `src/lib/web-vitals-config.ts`
2. `src/lib/location-schema.ts`
3. `src/components/table-of-contents.tsx`
4. `src/lib/video-schema.ts`
5. `src/app/locations/[city]/page.tsx` (Location pages)

### High-Priority Content Updates:

1. `src/components/sections/StudyAbroadFaqSection.tsx` - Expand FAQs
2. `src/components/sections/PopularDestinationsSection.tsx` - Image optimization + alt text
3. All destination pages - Add tables of contents

---

## Quick Wins (Can Be Done This Week)

### [ ] 1. Fix All Verification Codes
**Time:** 15 minutes
**Impact:** High - Enable proper search engine verification

### [ ] 2. Update NAP Everywhere
**Time:** 30 minutes
**Impact:** High - Improves local search

### [ ] 3. Enhance Image Alt Text
**Time:** 1-2 hours
**Impact:** Medium - Better image search + accessibility

### [ ] 4. Expand FAQ by 10 Questions
**Time:** 2-3 hours
**Impact:** High - +10-15% organic traffic

### [ ] 5. Set Up Google My Business (if not done)
**Time:** 1 hour
**Impact:** High - Local search visibility

---

## Success Metrics to Track

### Monthly Reviews:

**SEO Metrics:**
- Keyword rankings (track top 50 keywords)
- Organic impressions (GSC)
- Organic clicks (GSC)
- Site visibility rating

**SXO Metrics:**
- Core Web Vitals scores
- Page speed improvements
- Bounce rate changes

**AEO Metrics:**
- Featured snippet captures
- "People also ask" appearances
- Answer box visibility

**GEO Metrics:**
- Local search impressions
- Local search clicks
- Local search CTR
- Google My Business insights

---

## Tools to Set Up

### Essential (Free):
- [ ] Google Search Console
- [ ] Google Analytics 4
- [ ] Google My Business
- [ ] Google Page Speed Insights
- [ ] Mobile-Friendly Test

### Recommended (Paid):
- [ ] SEMrush Keyword Gap Analysis
- [ ] Ahrefs Site Explorer
- [ ] Screaming Frog SEO Spider
- [ ] Moz Local Citation Tracker

---

## Next Steps

1. **This Week:** Implement Phase 1 (Critical items)
2. **Next Week:** Start Phase 2 (High Priority)
3. **Week 3-4:** Complete Phase 2
4. **Month 2:** Phase 3 (Medium Priority)
5. **Ongoing:** Monitor metrics, adjust strategy

---

**Implementation Status:** Ready to Begin
**Estimated Total Time:** 40-50 hours
**Expected ROI:** +50-75% organic traffic increase


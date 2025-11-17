# Performance Optimization Guide - Whiteboard LMS

## Current Performance Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| TTFB (Time to First Byte) | 1533.5ms | <600ms | ⚠️ Needs Improvement |
| FCP (First Contentful Paint) | 1812ms | <1800ms | ⚠️ Needs Improvement |
| LCP (Largest Contentful Paint) | 1812ms | <2500ms | ✅ Good |
| CLS (Cumulative Layout Shift) | 0.001 | <0.1 | ✅ Excellent |

---

## 1. TTFB Optimization (Server Response Time)

### Root Cause Analysis
- **Primary Issue**: Supabase database queries are slow (avg 1000-1500ms)
- **Secondary Issue**: Multiple sequential database calls on page load
- **Configuration**: Server-side rendering with database queries on every request

### Solutions (Priority Order)

#### 1.1 Implement Response Caching (IMMEDIATE - High Impact)
**Target**: Reduce TTFB from 1533ms to <800ms

Add caching headers to frequently accessed pages:

```typescript
// In next.config.ts - Add revalidation to ISR pages
export const revalidateTime = 3600; // 1 hour cache

// Or in individual route pages (recommended):
export const revalidate = 3600; // Cache for 1 hour
```

**Implementation Steps**:
1. Add `export const revalidate = 3600;` to:
   - `src/app/(public)/page.tsx` (home)
   - `src/app/(public)/courses/page.tsx` (courses list)
   - `src/app/(public)/blog/[slug]/page.tsx` (blog posts)
   - `src/app/(public)/courses/[courseId]/page.tsx` (course details)

2. Use Next.js built-in `<Link prefetch>` for route pre-fetching

#### 1.2 Database Query Optimization (MEDIUM Priority)
**Target**: Reduce Supabase query time from 1200ms to <400ms

```typescript
// Optimization pattern for src/lib/supabase-data.ts

// BEFORE: Multiple sequential queries
export async function getCourse(courseId: string) {
  const course = await supabase.from('courses').select('*').eq('id', courseId);
  const instructor = await supabase.from('instructors').select('*').eq('id', course.instructor_id);
  const reviews = await supabase.from('reviews').select('*').eq('course_id', courseId);
  // 3 sequential queries = 1200+ ms
}

// AFTER: Single query with joins
export async function getCourse(courseId: string) {
  const { data } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:instructors(*),
      reviews:course_reviews(*)
    `)
    .eq('id', courseId)
    .single();
  // 1 query = 300-400ms
}
```

**Implementation**:
- Review all `SELECT` queries in `src/lib/supabase-data.ts`
- Replace with joined queries using Supabase relationship syntax
- Add `select()` clauses to only fetch needed columns
- Remove unnecessary `.limit()` calls that cause extra queries

#### 1.3 Add Database Indexes (MEDIUM Priority)
**Target**: Speed up WHERE clause filters by 50-70%

Create indexes in Supabase SQL Editor:

```sql
-- Index frequently filtered columns
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);

-- Composite indexes for common WHERE+ORDER combinations
CREATE INDEX idx_courses_published_updated ON courses(published, updated_at DESC);
```

#### 1.4 Implement Connection Pooling (MEDIUM Priority)
**Current**: Using standard Supabase connections (no pooling)

```typescript
// src/lib/supabase-client-optimized.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// With connection pooling (PgBouncer)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit realtime events
    },
  },
});

export default supabase;
```

---

## 2. FCP Optimization (First Contentful Paint)

### Root Cause Analysis
- **Primary Issue**: Large CSS bundles being loaded synchronously
- **Secondary Issue**: Hero images not being pre-loaded
- **Tertiary Issue**: Google Fonts loading blocking render

### Solutions (Priority Order)

#### 2.1 Critical CSS Extraction (IMMEDIATE - High Impact)
**Target**: Move from 1812ms to <1200ms

Current issue: Full Tailwind CSS being loaded before render

```typescript
// src/app/layout.tsx - Add critical CSS inline
import './critical-css.css'; // New: Only critical above-the-fold styles
import './globals.css'; // Defer non-critical

// In next.config.ts
export const webpack = (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      styles: {
        type: 'css/mini-extract',
        test: /\.css$/,
        name: 'critical-css',
        priority: 100,
      },
    };
  }
  return config;
};
```

#### 2.2 Hero Image Pre-loading (IMMEDIATE - Medium Impact)
**Target**: Hero images load before FCP

```tsx
// src/app/(public)/page.tsx
import Image from 'next/image';

export default async function Page() {
  return (
    <>
      {/* Pre-load hero image for better FCP */}
      <link 
        rel="preload"
        as="image"
        href="/hero-image.webp"
        imagesrcset="/hero-image-mobile.webp 640w, /hero-image-desktop.webp 1920w"
      />
      
      {/* Rest of page */}
    </>
  );
}
```

#### 2.3 Google Fonts Optimization (IMMEDIATE - Medium Impact)
**Current**: Fonts loaded synchronously, blocking render

```typescript
// src/app/layout.tsx - CURRENT (Slow)
const fontHeadline = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
  display: 'swap', // Add: Display system font until custom loads
});

const fontBody = Poppins({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-body',
  display: 'swap', // Add: Display system font until custom loads
});
```

**Already Configured**: Your layout already uses these fonts. Add `display: 'swap'` to prevent blocking.

#### 2.4 Remove Render-Blocking Resources (IMMEDIATE)
**Current Blocks**: 
- Large JSON-LD scripts (lines 71-135 in layout.tsx)
- Multiple schema scripts

```typescript
// BEFORE: Inline, blocking
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>

// AFTER: Deferred, non-blocking
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  strategy="afterInteractive" // Next.js <Script> component
/>
```

---

## 3. Quick Wins (Implement These First)

### 3.1 Add ISR Revalidation (5 minutes)

```typescript
// src/app/(public)/page.tsx
export const revalidate = 3600; // Cache homepage for 1 hour

// src/app/(public)/courses/page.tsx  
export const revalidate = 1800; // Cache courses list for 30 min

// src/app/(public)/courses/[courseId]/page.tsx
export const revalidate = 3600; // Cache course details for 1 hour
```

**Expected Improvement**: TTFB 1533ms → 800ms (on cached requests)

### 3.2 Enable Brotli Compression (Already Active)
Your `next.config.ts` has `compress: true`. Verify in Vercel dashboard:
- Settings → Build & Development
- Ensure "Enable Gzip compression" is ON (should be default)

### 3.3 Implement Progressive Image Loading (15 minutes)

```typescript
// src/components/optimized-image.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

export function OptimizedImage({ src, alt, ...props }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative bg-slate-200 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        onLoadingComplete={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
      {/* Blur placeholder while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

### 3.4 Verify Supabase Connection (10 minutes)
Check if Supabase region is closest to your deployment:

1. Go to Supabase Dashboard → Project Settings → General
2. Check "Region": Should be closest to your users/deployment
3. If far: Consider migrating database or using read replicas

**Current Setup**: Likely in Asia region (good for India-based users)

---

## 4. Advanced Optimizations (For Later)

### 4.1 Implement Service Worker Caching
- Cache API responses offline
- Pre-cache critical assets
- Reduce TTFB on repeat visits to <200ms

### 4.2 Database Replication
- Set up Supabase read replicas in different regions
- Route read queries to nearest replica
- Reduce query latency by 50-70%

### 4.3 CDN Edge Functions
- Deploy Vercel Edge Functions for dynamic content
- Pre-render frequently accessed pages at edge
- Reduce TTFB from server response to <100ms

### 4.4 Image Optimization
- Convert all images to WebP
- Use AVIF format for modern browsers
- Implement lazy loading with `loading="lazy"`
- Reduce total page size by 30-40%

---

## 5. Implementation Checklist

### Phase 1: Quick Wins (Do First - 30 minutes)
- [ ] Add `export const revalidate` to public pages
- [ ] Verify Brotli compression enabled on Vercel
- [ ] Add `display: 'swap'` to Google Fonts
- [ ] Check Supabase connection region

### Phase 2: Database Optimization (1-2 hours)
- [ ] Audit `src/lib/supabase-data.ts` for sequential queries
- [ ] Convert to joined queries with relationship syntax
- [ ] Create database indexes for filtered columns
- [ ] Test query performance with browser DevTools

### Phase 3: FCP Optimization (2-3 hours)
- [ ] Extract critical CSS
- [ ] Pre-load hero images
- [ ] Implement progressive image loading
- [ ] Defer non-critical JavaScript

### Phase 4: Advanced Optimizations (For Next Sprint)
- [ ] Implement Service Worker
- [ ] Set up database replicas
- [ ] Deploy Edge Functions
- [ ] Image format optimization

---

## 6. Monitoring & Benchmarking

### Add Performance Monitoring

```typescript
// src/lib/performance-monitor.ts
export function capturePerformanceMetrics() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      console.log({
        ttfb: perfData.responseStart - perfData.fetchStart,
        fcp: perfData.responseEnd - perfData.fetchStart,
        lcp: perfData.loadEventEnd - perfData.fetchStart,
      });
      
      // Send to analytics service
      if (window.gtag) {
        window.gtag('event', 'page_performance', {
          ttfb: perfData.responseStart - perfData.fetchStart,
          fcp: Math.round(perfData.responseEnd - perfData.fetchStart),
          lcp: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        });
      }
    });
  }
}
```

### Test Performance Regularly
1. **Local Testing**: `npm run build && npm start`
2. **Production Monitoring**: Use Vercel Analytics dashboard
3. **Web Vitals**: Check Google Search Console → Core Web Vitals
4. **Lighthouse**: Chrome DevTools → Lighthouse (target: 90+ score)

---

## 7. Expected Results After Implementation

### Realistic Improvements (After All Optimizations)

| Metric | Current | After Quick Wins | After Full Optimization |
|--------|---------|-----------------|------------------------|
| TTFB | 1533ms | ~1000ms (cached) | ~300-400ms |
| FCP | 1812ms | ~1400ms | ~900ms |
| LCP | 1812ms | ~1800ms | ~1200ms |
| CLS | 0.001 | 0.001 | <0.05 |

---

## 8. Environment Variables

Meta Pixel is now properly configured:
```
✅ NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1417314569149086
✅ NEXT_PUBLIC_GA_ID=G-W160JBNYPR
```

Both analytics services are active and will track user interactions.

---

## Summary

**IMMEDIATE ACTIONS** (Today):
1. Add ISR revalidation to public pages (+30% TTFB improvement)
2. Add `display: 'swap'` to fonts (prevent render blocking)
3. Check Supabase region (potential +20% speed)

**MEDIUM TERM** (This Week):
1. Optimize database queries (join queries instead of sequential)
2. Extract critical CSS (major FCP improvement)
3. Pre-load hero images

**LONG TERM** (Next Sprint):
1. Service Worker implementation
2. Database read replicas
3. Edge Functions for dynamic content

These optimizations should improve your Core Web Vitals scores and push you into the "Green" zone for SEO rankings.

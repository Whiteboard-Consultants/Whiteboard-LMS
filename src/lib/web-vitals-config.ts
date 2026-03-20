/**
 * Core Web Vitals Configuration
 * 
 * Targets aligned with Google's "Good" thresholds:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms (deprecated, replaced by INP)
 * - INP (Interaction to Next Paint): < 200ms
 * - CLS (Cumulative Layout Shift): < 0.1
 * - TTFB (Time to First Byte): < 600ms
 * 
 * Reference: https://web.dev/vitals/
 */

export interface WebVitalsMetrics {
  lcp: number;      // Largest Contentful Paint (ms)
  inp: number;      // Interaction to Next Paint (ms)
  cls: number;      // Cumulative Layout Shift (unitless)
  ttfb: number;     // Time to First Byte (ms)
  fid?: number;     // First Input Delay (ms) - deprecated
}

export interface WebVitalsTargets {
  lcp: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

export interface PagePerformanceTarget {
  name: string;
  path: string;
  metrics: {
    lcp: number;
    inp: number;
    cls: number;
    ttfb: number;
  };
  priority: 'critical' | 'high' | 'medium' | 'low';
  notes?: string;
}

/**
 * Google's Core Web Vitals Thresholds
 * "Good" = 75th percentile, "Needs Improvement" = 25th percentile
 */
export const WEB_VITALS_TARGETS: WebVitalsTargets = {
  lcp: {
    good: 2500,              // 2.5 seconds
    needsImprovement: 4000   // 4.0 seconds
  },
  inp: {
    good: 200,               // 200 milliseconds
    needsImprovement: 500    // 500 milliseconds
  },
  cls: {
    good: 0.1,               // unitless (excellent: < 0.05)
    needsImprovement: 0.25
  },
  ttfb: {
    good: 600,               // 600 milliseconds
    needsImprovement: 1800   // 1.8 seconds
  }
};

/**
 * Page-specific performance targets
 * Priority pages get stricter targets for maximum impact
 */
export const PAGE_PERFORMANCE_TARGETS: PagePerformanceTarget[] = [
  {
    name: "Homepage",
    path: "/",
    priority: "critical",
    metrics: {
      lcp: 2000,   // Slightly stricter than baseline
      inp: 180,
      cls: 0.08,
      ttfb: 500
    },
    notes: "Hero section with multiple hero images - optimize image delivery and lazy loading"
  },
  {
    name: "Study Abroad",
    path: "/study-abroad",
    priority: "critical",
    metrics: {
      lcp: 2200,
      inp: 200,
      cls: 0.08,
      ttfb: 550
    },
    notes: "Destination cards with 8+ images - prioritize first 3, lazy load rest"
  },
  {
    name: "Instructor Tests",
    path: "/instructor/tests",
    priority: "high",
    metrics: {
      lcp: 2400,
      inp: 250,
      cls: 0.1,
      ttfb: 600
    },
    notes: "Test cards with gradients - optimize render performance"
  },
  {
    name: "Student Skills",
    path: "/student/skills",
    priority: "high",
    metrics: {
      lcp: 2400,
      inp: 250,
      cls: 0.1,
      ttfb: 600
    },
    notes: "Skills list with glassification - monitor for layout shifts"
  },
  {
    name: "Courses Catalog",
    path: "/courses",
    priority: "high",
    metrics: {
      lcp: 2500,
      inp: 250,
      cls: 0.1,
      ttfb: 600
    },
    notes: "Large course list - implement pagination/virtualization if needed"
  },
  {
    name: "Blog/Articles",
    path: "/blog",
    priority: "medium",
    metrics: {
      lcp: 2500,
      inp: 300,
      cls: 0.1,
      ttfb: 600
    },
    notes: "Content-heavy - monitor for interactive elements (ads, comments)"
  },
  {
    name: "Authentication Pages",
    path: "/login",
    priority: "medium",
    metrics: {
      lcp: 1800,
      inp: 100,
      cls: 0.05,
      ttfb: 400
    },
    notes: "Lightweight form - should be fastest pages on site"
  },
  {
    name: "Location Pages",
    path: "/locations/kolkata",
    priority: "high",
    metrics: {
      lcp: 2200,
      inp: 200,
      cls: 0.08,
      ttfb: 550
    },
    notes: "Location-specific content with local imagery"
  }
];

/**
 * Performance optimization strategies by metric
 */
export const OPTIMIZATION_STRATEGIES = {
  lcp: [
    "Optimize and compress hero images (WebP format preferred)",
    "Prioritize above-fold content delivery",
    "Remove render-blocking CSS/JavaScript",
    "Implement critical CSS inlining",
    "Use image lazy loading strategically (priority for first 3 images)",
    "Server-side rendering (already using Next.js App Router)",
    "Preload critical resources",
    "Cache static assets aggressively (60-30 days)"
  ],
  inp: [
    "Reduce JavaScript bundle size (code splitting)",
    "Defer non-critical JavaScript",
    "Optimize event listeners (debounce/throttle)",
    "Use Web Workers for heavy computations",
    "Monitor React re-renders (use React DevTools Profiler)",
    "Optimize database queries and API responses",
    "Implement request debouncing for form inputs",
    "Monitor for layout thrashing (batch DOM operations)"
  ],
  cls: [
    "Set explicit dimensions for images and videos",
    "Avoid dynamically injected content above the fold",
    "Use CSS containment for isolated sections",
    "Avoid animations that cause layout shifts",
    "Reserve space for ads and dynamic content",
    "Test with slow 3G to simulate real conditions",
    "Monitor font loading - use font-display: swap",
    "Stabilize modals/overlays - ensure reserved space"
  ],
  ttfb: [
    "Upgrade server infrastructure (decrease response time)",
    "Implement database query optimization",
    "Use edge caching (CloudFront, Cloudflare)",
    "Implement static site generation (ISR) where possible",
    "Reduce middleware processing time",
    "Optimize API endpoint response times",
    "Implement database connection pooling",
    "Monitor server CPU/memory utilization"
  ]
};

/**
 * Tools and services for measurement
 */
export const MEASUREMENT_TOOLS = {
  realUser: [
    "Google Search Console (Core Web Vitals report)",
    "Google PageSpeed Insights API",
    "web-vitals JavaScript library (on-page tracking)",
    "Vercel Analytics (built-in, if using Vercel)"
  ],
  lab: [
    "Lighthouse (via PageSpeed Insights)",
    "WebPageTest",
    "Chrome DevTools Performance tab",
    "Next.js built-in Analytics"
  ],
  monitoring: [
    "Sentry for error tracking",
    "Datadog for performance monitoring",
    "Custom analytics dashboard",
    "Google Analytics 4 custom events"
  ]
};

/**
 * Estimated impact of Core Web Vitals improvements
 */
export const ESTIMATED_IMPACT = {
  lcp_improvement: {
    baseline: "Currently measuring on Google Search Console",
    goal: "Improve by 20-30% (3-4 week optimization cycle)",
    ranking_impact: "5-10% increase in organic traffic"
  },
  inp_improvement: {
    baseline: "Currently measuring on Google Search Console",
    goal: "Improve by 15-25%",
    ranking_impact: "3-8% increase in organic traffic"
  },
  cls_improvement: {
    baseline: "Currently measuring on Google Search Console",
    goal: "Achieve < 0.05 across all pages",
    ranking_impact: "2-5% increase in organic traffic"
  },
  combined_impact: "Potential 15-25% total organic traffic increase when all three are optimized to 'Good' threshold"
};

/**
 * Audit checklist for Core Web Vitals optimization
 */
export const OPTIMIZATION_CHECKLIST = {
  images: [
    "[ ] Use modern formats (WebP with PNG/JPG fallback)",
    "[ ] Optimize image dimensions (don't serve images larger than viewport)",
    "[ ] Add quality parameter (quality=85 for web, quality=70 for thumbnails)",
    "[ ] Implement responsive images (srcSet attribute)",
    "[ ] Use Next.js Image component with optimization",
    "[ ] Set explicit width/height to prevent CLS",
    "[ ] Add blur placeholders for perceived performance",
    "[ ] Lazy load off-viewport images"
  ],
  javascript: [
    "[ ] Audit bundle size (target < 100KB gzipped main bundle)",
    "[ ] Implement code splitting by route",
    "[ ] Remove unused dependencies",
    "[ ] Defer non-critical JavaScript to idle time",
    "[ ] Minimize React re-renders",
    "[ ] Use React.memo for expensive components",
    "[ ] Implement virtualization for long lists"
  ],
  css: [
    "[ ] Remove unused CSS (PurgeCSS - Tailwind does this)",
    "[ ] Minimize CSS file size",
    "[ ] Inline critical CSS (< 14KB)",
    "[ ] Use CSS containment for layout performance",
    "[ ] Optimize animations (prefer transform/opacity)",
    "[ ] Remove blocking CSS if not critical"
  ],
  fonts: [
    "[ ] Use font-display: swap (prevent invisible text while loading)",
    "[ ] Preload critical fonts",
    "[ ] Subset fonts (remove unused characters)",
    "[ ] Optimize font file sizes",
    "[ ] Use web-safe fallbacks"
  ],
  api: [
    "[ ] Optimize API response times (target < 200ms)",
    "[ ] Implement request caching",
    "[ ] Use incremental static regeneration (ISR)",
    "[ ] Implement database query optimization",
    "[ ] Monitor API error rates"
  ],
  infrastructure: [
    "[ ] Enable gzip/brotli compression",
    "[ ] Implement CDN for static assets (Vercel, CloudFront, Cloudflare)",
    "[ ] Enable browser caching (60-30 days for static, shorter for dynamic)",
    "[ ] Optimize server response time (upgrade server if needed)",
    "[ ] Monitor CPU/memory utilization"
  ]
};

/**
 * Expected timeline for improvements
 */
export const IMPROVEMENT_TIMELINE = {
  week_1: [
    "Images: Add quality parameter, enable lazy loading (immediate cache busting effect)",
    "Fonts: Add font-display: swap",
    "CSS: Remove unused styles"
  ],
  week_2: [
    "JavaScript: Code splitting analysis",
    "Database: Query optimization",
    "Caching: Implement aggressive browser caching"
  ],
  week_3: [
    "API: Response time optimization",
    "React: Render performance optimization",
    "Monitoring: Set up tracking/dashboards"
  ],
  week_4: [
    "Comprehensive testing across all pages",
    "Monitor results in Google Search Console",
    "Iterate based on real user data"
  ]
};

/**
 * Utility function to classify performance
 */
export function classifyPerformance(metric: keyof WebVitalsTargets, value: number): 'good' | 'needsImprovement' | 'poor' {
  const target = WEB_VITALS_TARGETS[metric];
  
  if (value <= target.good) {
    return 'good';
  } else if (value <= target.needsImprovement) {
    return 'needsImprovement';
  } else {
    return 'poor';
  }
}

/**
 * Utility function to get page-specific target
 */
export function getPageTarget(path: string): PagePerformanceTarget | undefined {
  return PAGE_PERFORMANCE_TARGETS.find(page => page.path === path);
}

/**
 * Performance color coding (for dashboards/reports)
 */
export const PERFORMANCE_COLORS = {
  good: '#0cce6b',           // Green (75th percentile or better)
  needsImprovement: '#ffa400', // Orange (50th-75th percentile)
  poor: '#ff4e42'            // Red (below 50th percentile)
};

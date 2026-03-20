/**
 * Core Web Vitals Monitoring Utility
 * 
 * Tracks real user Core Web Vitals metrics and sends them for analysis
 * This runs in the browser and captures actual user performance
 * 
 * Usage:
 * import { setupWebVitalsMonitoring } from '@/lib/web-vitals-monitor';
 * 
 * // In your root layout or app component
 * useEffect(() => {
 *   setupWebVitalsMonitoring();
 * }, []);
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import type { Metric } from 'web-vitals';
import { classifyPerformance, PAGE_PERFORMANCE_TARGETS } from './web-vitals-config';

export interface VitalsPayload {
  pathname: string;
  metric: string;
  value: number;
  classification: 'good' | 'needsImprovement' | 'poor';
  navigationType?: string;
  timestamp: number;
  userAgent?: string;
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
    downlink?: number;
  };
}

export interface WebVitalsReport {
  lcp?: number;
  inp?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  timestamp: number;
  pathname: string;
  sessionId: string;
}

// Session ID for tracking user journey
const SESSION_ID = typeof window !== 'undefined' 
  ? sessionStorage.getItem('vitals-session-id') || generateSessionId()
  : '';

function generateSessionId(): string {
  const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('vitals-session-id', id);
  }
  return id;
}

/**
 * Send metric data to your analytics endpoint
 * IMPORTANT: Set up your backend endpoint to receive this data
 * Recommended: Google Analytics 4, Vercel Analytics, or custom endpoint
 */
async function sendMetricToAnalytics(payload: VitalsPayload): Promise<void> {
  // Option 1: Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'web_vitals', {
      metric_id: payload.metric,
      metric_value: payload.value,
      metric_category: 'web_vitals',
      metric_value_units: payload.metric === 'CLS' ? 'unitless' : 'milliseconds',
      page_path: payload.pathname,
      classification: payload.classification
    });
  }

  // Option 2: Send to custom analytics endpoint (if available)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    try {
      await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        // Use sendBeacon if available for better reliability
        keepalive: true
      }).catch(() => {
        // Silently fail - don't break user experience for analytics
        console.debug('Analytics endpoint unavailable');
      });
    } catch (error) {
      // Analytics failure should never impact user experience
      console.debug('Failed to send vitals:', error);
    }
  }

  // Option 3: Log to Sentry for error tracking integration
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(`Web Vitals: ${payload.metric} = ${payload.value}ms (${payload.classification})`, 'info');
  }
}

/**
 * Get connection information for performance context
 */
function getConnectionInfo() {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    return {
      effectiveType: conn.effectiveType,
      saveData: conn.saveData,
      downlink: conn.downlink
    };
  }
  return undefined;
}

/**
 * Main function to setup Core Web Vitals monitoring
 * Call this once in your app root
 */
export function setupWebVitalsMonitoring(): void {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const pageTarget = PAGE_PERFORMANCE_TARGETS.find(p => p.path === pathname);

  // Track LCP (Largest Contentful Paint)
  onLCP((metric: Metric) => {
    const payload: VitalsPayload = {
      pathname,
      metric: 'LCP',
      value: Math.round(metric.value),
      classification: classifyPerformance('lcp', metric.value),
      timestamp: Date.now(),
      connection: getConnectionInfo(),
      navigationType: metric.navigationType
    };

    console.info('[Vitals] LCP:', payload.value, `(${payload.classification})`);
    
    // Warn if exceeds page target
    if (pageTarget && payload.value > pageTarget.metrics.lcp) {
      console.warn(`[Vitals] LCP ${payload.value}ms exceeds target ${pageTarget.metrics.lcp}ms`);
    }

    sendMetricToAnalytics(payload);
  });

  // Track INP (Interaction to Next Paint) - replaces FID
  if ('PerformanceObserver' in window) {
    // INP is the modern replacement for FID
    try {
      onINP((metric: Metric) => {
        const payload: VitalsPayload = {
          pathname,
          metric: 'INP',
          value: Math.round(metric.value),
          classification: classifyPerformance('inp', metric.value),
          timestamp: Date.now(),
          connection: getConnectionInfo(),
          navigationType: metric.navigationType
        };

        console.info('[Vitals] INP:', payload.value, `(${payload.classification})`);
        
        if (pageTarget && payload.value > pageTarget.metrics.inp) {
          console.warn(`[Vitals] INP ${payload.value}ms exceeds target ${pageTarget.metrics.inp}ms`);
        }

        sendMetricToAnalytics(payload);
      });
    } catch (error) {
      console.debug('INP monitoring failed:', error);
    }
  }

  // Track CLS (Cumulative Layout Shift)
  onCLS((metric: Metric) => {
    const payload: VitalsPayload = {
      pathname,
      metric: 'CLS',
      value: parseFloat(metric.value.toFixed(3)),
      classification: classifyPerformance('cls', metric.value),
      timestamp: Date.now(),
      connection: getConnectionInfo(),
      navigationType: metric.navigationType
    };

    console.info('[Vitals] CLS:', payload.value, `(${payload.classification})`);
    
    if (pageTarget && payload.value > pageTarget.metrics.cls) {
      console.warn(`[Vitals] CLS ${payload.value} exceeds target ${pageTarget.metrics.cls}`);
    }

    sendMetricToAnalytics(payload);
  });

  // Track TTFB (Time to First Byte)
  onTTFB((metric: Metric) => {
    const payload: VitalsPayload = {
      pathname,
      metric: 'TTFB',
      value: Math.round(metric.value),
      classification: classifyPerformance('ttfb', metric.value),
      timestamp: Date.now(),
      connection: getConnectionInfo(),
      navigationType: metric.navigationType
    };

    console.info('[Vitals] TTFB:', payload.value, `(${payload.classification})`);
    
    if (pageTarget && payload.value > pageTarget.metrics.ttfb) {
      console.warn(`[Vitals] TTFB ${payload.value}ms exceeds target ${pageTarget.metrics.ttfb}ms`);
    }

    sendMetricToAnalytics(payload);
  });

  // Track FCP (First Contentful Paint) - supporting metric
  onFCP((metric: Metric) => {
    const payload: VitalsPayload = {
      pathname,
      metric: 'FCP',
      value: Math.round(metric.value),
      classification: metric.value < 1800 ? 'good' : metric.value < 3000 ? 'needsImprovement' : 'poor',
      timestamp: Date.now(),
      connection: getConnectionInfo(),
      navigationType: metric.navigationType
    };

    console.debug('[Vitals] FCP:', payload.value, `(${payload.classification})`);
    sendMetricToAnalytics(payload);
  });
}

/**
 * Manual performance measurement hook
 * Use this to track custom performance metrics
 */
export function measurePerformance(label: string): () => void {
  const startMark = `start-${label}`;
  const endMark = `end-${label}`;
  const measureName = `measure-${label}`;

  performance.mark(startMark);

  return () => {
    performance.mark(endMark);
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      console.info(`[Performance] ${label}: ${measure.duration.toFixed(2)}ms`);
    } catch (error) {
      console.debug(`Performance measurement failed for ${label}`);
    }
  };
}

/**
 * React Hook for setting up Web Vitals monitoring
 * Usage in root layout:
 * 
 * 'use client';
 * import { useEffect } from 'react';
 * import { useWebVitals } from '@/lib/web-vitals-monitor';
 * 
 * export default function RootLayout({ children }) {
 *   useWebVitals();
 *   return <>{children}</>;
 * }
 */
export function useWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Only setup once per page
  if ((window as any).__VITALS_SETUP__) {
    return;
  }
  (window as any).__VITALS_SETUP__ = true;

  setupWebVitalsMonitoring();
}

/**
 * Report Core Web Vitals to Google Analytics
 * This is a convenience function if you want to use GA's built-in vitals reporting
 */
export function reportWebVitalsToGA(): void {
  if (typeof window === 'undefined' || !(window as any).gtag) {
    console.warn('Google Analytics not found. Ensure gtag is loaded.');
    return;
  }

  setupWebVitalsMonitoring();
  console.info('Web Vitals reporting enabled via Google Analytics');
}

/**
 * Get current metrics for debugging
 * Returns metrics collected so far on this page
 */
export function getCollectedMetrics(): Partial<WebVitalsReport> {
  if (typeof window === 'undefined') return {};

  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  return {
    pathname: window.location.pathname,
    sessionId: SESSION_ID,
    timestamp: Date.now(),
    // These will be populated by the monitoring setup above
    ttfb: perfData?.responseStart ? perfData.responseStart - perfData.fetchStart : undefined
  };
}

'use client';

import { useEffect } from 'react';
import { setupWebVitalsMonitoring } from '@/lib/web-vitals-monitor';

/**
 * Client-side component to setup Core Web Vitals monitoring
 * This is separated from the layout to allow the layout to remain a Server Component
 * (since layout.tsx exports metadata, which requires Server Component)
 */
export function WebVitalsSetup() {
  useEffect(() => {
    // Initialize Core Web Vitals monitoring when component mounts
    setupWebVitalsMonitoring();
  }, []);

  // This component doesn't render anything
  return null;
}

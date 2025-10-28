'use client'

import { useEffect } from 'react'
import Script from 'next/script'

// Type definitions for Web Vitals and Google Analytics
interface WebVitalMetric {
  name: string
  delta: number
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Extend Window interface for gtag and web-vital tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    [key: string]: any
  }
}

// Web Vitals tracking for SXO (Search Experience Optimization)
export function WebVitalsTracker() {
  useEffect(() => {
    // Track Core Web Vitals
    if (typeof window !== 'undefined' && window['web-vital']) {
      return
    }

    // Mark that we've initialized web vitals tracking
    if (typeof window !== 'undefined') {
      window['web-vital'] = true
    }

    // Function to track web vitals
    const trackWebVital = (metric: WebVitalMetric) => {
      // Send to analytics (Google Analytics 4 example)
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        const { name, delta, value, rating } = metric
        
        // Send to GA4
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: name,
          value: Math.round(name === 'CLS' ? delta * 1000 : delta),
          custom_map: {
            metric_name: name,
            metric_value: value,
            metric_rating: rating
          }
        })

        // Console log for debugging (remove in production)
        console.log(`${name}: ${value} (${rating})`)
      }
    }

    // Dynamic import of web-vitals library
    import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB }) => {
      onCLS(trackWebVital)
      onFCP(trackWebVital)  
      onFID(trackWebVital)
      onLCP(trackWebVital)
      onTTFB(trackWebVital)
    })
  }, [])

  return null
}

// Google Analytics 4 component
interface GoogleAnalyticsProps {
  gaId: string
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_title: document.title,
              page_location: window.location.href,
              custom_map: {
                'metric_name': 'metric_name',
                'metric_value': 'metric_value', 
                'metric_rating': 'metric_rating'
              }
            });
          `
        }}
      />
    </>
  )
}

// Google Search Console verification
interface GSCVerificationProps {
  verificationCode: string
}

export function GSCVerification({ verificationCode }: GSCVerificationProps) {
  return (
    <meta name="google-site-verification" content={verificationCode} />
  )
}

// Bing Webmaster Tools verification
interface BingVerificationProps {
  verificationCode: string
}

export function BingVerification({ verificationCode }: BingVerificationProps) {
  return (
    <meta name="msvalidate.01" content={verificationCode} />
  )
}

// Performance optimization hints
export function PerformanceOptimizations() {
  return (
    <>
      {/* DNS Prefetch for external domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//checkout.razorpay.com" />
      
      {/* Preconnect to critical resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Resource hints for better performance */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
    </>
  )
}

// Schema.org WebSite markup for site search
export function WebsiteSearchSchema() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Whiteboard Consultants",
    "url": "https://www.whiteboardconsultant.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint", 
        "urlTemplate": "https://www.whiteboardconsultant.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://www.facebook.com/whiteboardconsultants",
      "https://www.linkedin.com/company/whiteboard-consultants", 
      "https://www.instagram.com/whiteboardconsultants",
      "https://twitter.com/whiteboardcons"
    ]
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteSchema)
      }}
    />
  )
}

// Critical CSS inlining helper
export function CriticalCSS({ css }: { css: string }) {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      data-critical-css
    />
  )
}
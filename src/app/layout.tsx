
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { AuthProvider } from './auth-provider';
import { CartProvider } from '@/hooks/use-cart';
import Script from 'next/script';
import { ThemeProvider } from "@/components/theme-provider";
import { WebVitalsTracker, PerformanceOptimizations, WebsiteSearchSchema } from '@/components/seo-optimizations';
import '@/lib/auth-fix'; // Auto-handle auth token issues
import type { Metadata } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';

const fontHeadline = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

const fontBody = Poppins({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-body',
});


export const metadata: Metadata = {
  metadataBase: new URL('https://www.whiteboardconsultant.com'),
  title: {
    default: 'Whiteboard Consultants | #1 Study Abroad & Test Prep Expert in Kolkata',
    template: '%s | Whiteboard Consultants - Your Gateway to Global Education',
  },
  description: 'Transform your academic future with Kolkata\'s top education consultant. Expert study abroad guidance, IELTS/TOEFL/GMAT/GRE preparation, college admissions, and career counseling. 1000+ success stories, 15+ years of experience.',
  keywords: [
    // Primary Keywords
    "education consultant in Kolkata", "study abroad consultants Kolkata", "IELTS coaching Kolkata", 
    "TOEFL classes Kolkata", "overseas education consultants", "career counseling Kolkata",
    
    // Long-tail Keywords (AEO focused)
    "best study abroad consultant in Kolkata", "top IELTS coaching center in Kolkata",
    "how to study abroad from India", "GMAT preparation classes Kolkata", 
    "GRE coaching institutes Kolkata", "student visa consultation Kolkata",
    
    // Location-based
    "education consultant Park Street Kolkata", "study abroad consultant near me",
    "IELTS coaching Park Street", "overseas education Salt Lake",
    
    // Service-specific
    "University of Wollongong India partner", "college admission guidance India",
    "study in Canada from India", "study in Australia from Kolkata",
    "UK university admissions", "US university applications"
  ],
  authors: [
    { name: 'Navnit Daniel Alley', url: 'https://www.linkedin.com/in/navnit-daniel-alley-sales-and-career-coach' },
    { name: 'Prateek Chaudhuri', url: 'https://www.linkedin.com/in/prateek-chaudhuri-6a003b23/' }
  ],
  creator: 'Whiteboard Consultants',
  publisher: 'Whiteboard Consultants',
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Whiteboard Consultants',
    title: 'Whiteboard Consultants | #1 Study Abroad & Test Prep Expert in Kolkata',
    description: 'Transform your academic future with Kolkata\'s top education consultant. Expert study abroad guidance, IELTS/TOEFL/GMAT/GRE preparation, college admissions, and career counseling.',
    images: [
      {
        url: '/og-image-home.png',
        width: 1200,
        height: 630,
        alt: 'Whiteboard Consultants - Kolkata\'s Premier Education Consultant',
        type: 'image/png',
      },
      {
        url: '/whiteboard-team.webp',
        width: 800,
        height: 600,
        alt: 'Whiteboard Consultants Expert Team',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@whiteboardcons',
    creator: '@whiteboardcons',
    title: 'Whiteboard Consultants | #1 Study Abroad & Test Prep Expert in Kolkata',
    description: 'Transform your academic future with expert study abroad guidance, test prep, and career counseling in Kolkata.',
    images: ['/twitter-image-home.png'],
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    other: {
      'facebook-domain-verification': 'your-fb-verification-code',
    },
  },
  category: 'Education',
  classification: 'Educational Services',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-128x128.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#0052CC' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance optimizations */}
        <PerformanceOptimizations />
        
        {/* Prevent theme flash by applying saved/system theme before hydration */}
        <script
          dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){var m=window.matchMedia('(prefers-color-scheme: dark)');t=m.matches?'dark':'light'}if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){} })()` }}
        />
        
        {/* KaTeX stylesheet - no preload to avoid integrity mismatch */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" 
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" 
          crossOrigin="anonymous" 
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["EducationalOrganization", "LocalBusiness"],
            "name": "Whiteboard Consultants",
            "url": "https://www.whiteboardconsultant.com", 
            "logo": "https://www.whiteboardconsultant.com/logo.png",
            "description": "Premier education consultant in Kolkata specializing in study abroad guidance, IELTS/TOEFL/GMAT/GRE preparation, and career counseling with 15+ years of experience.",
            "foundingDate": "2008",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-85830-35656",
              "contactType": "Customer Service",
              "availableLanguage": ["English", "Hindi", "Bengali"],
              "areaServed": "IN"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "'My Cube', 6th Floor, Park Plaza, 71, Park Street",
              "addressLocality": "Kolkata",
              "addressRegion": "West Bengal",
              "postalCode": "700016",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 22.5574,
              "longitude": 88.3476
            },
            "openingHours": [
              "Mo-Fr 09:00-18:00",
              "Sa 09:00-15:00"
            ],
            "priceRange": "₹₹",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "500+",
              "bestRating": "5"
            },
            "sameAs": [
              "https://www.facebook.com/whiteboardconsultants",
              "https://www.linkedin.com/company/whiteboard-consultants",
              "https://www.instagram.com/whiteboardconsultants",
              "https://twitter.com/whiteboardcons"
            ]
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
             "@context": "https://schema.org",
             "@type": "WebSite",
             "url": "https://www.whiteboardconsultant.com/",
             "potentialAction": {
               "@type": "SearchAction",
               "target": {
                 "@type": "EntryPoint",
                 "urlTemplate": "https://www.whiteboardconsultant.com/courses?search={search_term_string}"
               },
               "query-input": "required name=search_term_string"
             }
          })}}
        />
        
        {/* Website search schema for AEO */}
        <WebsiteSearchSchema />
      </head>
      <body className={`${fontBody.variable} ${fontHeadline.variable} font-body`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <CartProvider>
                    {children}
                    <Toaster />
                    <Sonner theme="system" position="top-right" />
                    
                    {/* Web Vitals tracking for SXO */}
                    <WebVitalsTracker />
                </CartProvider>
            </AuthProvider>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </ThemeProvider>
      </body>
    </html>
  );
}

'use client';

import Script from 'next/script';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function GoogleAnalyticsComponent() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) {
    console.warn('NEXT_PUBLIC_GA_ID is not configured');
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
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
              page_path: window.location.pathname,
              anonymize_ip: true,
              allow_google_signals: true,
              allow_ad_personalization_signals: false,
            });
          `,
        }}
      />
    </>
  );
}

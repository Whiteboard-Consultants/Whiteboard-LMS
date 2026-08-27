'use client';

import Script from 'next/script';

function getMetaPixelIds(): string[] {
  const ids = new Set<string>();

  const primary = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim();
  if (primary) ids.add(primary);

  const secondary = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID_2?.trim();
  if (secondary) ids.add(secondary);

  const list = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_IDS?.split(',') ?? [];
  for (const id of list) {
    const trimmed = id.trim();
    if (trimmed) ids.add(trimmed);
  }

  return Array.from(ids);
}

export function MetaPixelInit() {
  const pixelIds = getMetaPixelIds();

  if (pixelIds.length === 0) {
    return null;
  }

  const initCalls = pixelIds.map((id) => `fbq('init', '${id}');`).join('\n            ');
  const noscriptPixels = pixelIds.map((id) => (
    <img
      key={id}
      height="1"
      width="1"
      style={{ display: 'none' }}
      src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
      alt=""
    />
  ));

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${initCalls}
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>{noscriptPixels}</noscript>
    </>
  );
}

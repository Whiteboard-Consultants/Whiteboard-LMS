// Meta Pixel (Facebook Pixel) event tracking

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

export function trackPixelEvent(
  eventName: string,
  eventData?: Record<string, any>,
  options?: { eventId?: string }
) {
  if (typeof window === 'undefined') return;

  if (!window.fbq) {
    const pixelIds = getMetaPixelIds();
    if (pixelIds.length > 0) {
      initMetaPixel(pixelIds);
    }
  }

  if (window.fbq) {
    if (options?.eventId) {
      window.fbq('track', eventName, eventData, { eventID: options.eventId });
      return;
    }

    window.fbq('track', eventName, eventData);
  }
}

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

// Meta Pixel standard events for conversions
export const FacebookPixelEvents = {
  // Standard events
  pageView: () => trackPixelEvent('PageView'),

  viewContent: (contentId: string, contentName: string, contentType: string = 'course') =>
    trackPixelEvent('ViewContent', {
      content_id: contentId,
      content_name: contentName,
      content_type: contentType,
      value: 0,
      currency: 'INR',
    }),

  addToCart: (value: number, contentId?: string, contentName?: string) =>
    trackPixelEvent('AddToCart', {
      value,
      currency: 'INR',
      content_id: contentId,
      content_name: contentName,
      content_type: 'course',
    }),

  purchase: (value: number, courseId?: string, courseName?: string) =>
    trackPixelEvent('Purchase', {
      value,
      currency: 'INR',
      content_id: courseId,
      content_name: courseName,
      content_type: 'course',
      timestamp: new Date().toISOString(),
    }),

  lead: (
    email?: string,
    phone?: string,
    firstName?: string,
    lastName?: string,
    eventId?: string
  ) =>
    trackPixelEvent('Lead', {
      em: email ? hashEmail(email) : undefined,
      ph: phone ? hashPhone(phone) : undefined,
      fn: firstName,
      ln: lastName,
      timestamp: new Date().toISOString(),
    }, { eventId }),

  completeRegistration: (email?: string, firstName?: string, lastName?: string) =>
    trackPixelEvent('CompleteRegistration', {
      em: email ? hashEmail(email) : undefined,
      fn: firstName,
      ln: lastName,
      status: 'completed',
      timestamp: new Date().toISOString(),
    }),

  // Custom course events
  courseEnrolled: (courseId: string, courseName: string, price: number) =>
    trackPixelEvent('Purchase', {
      value: price,
      currency: 'INR',
      content_id: courseId,
      content_name: courseName,
      content_type: 'course',
      status: 'enrolled',
      timestamp: new Date().toISOString(),
    }),

  testCompleted: (testId: string, score: number) =>
    trackPixelEvent('Achievement', {
      content_id: testId,
      content_name: `Test Completed: ${score}%`,
      value: score,
      timestamp: new Date().toISOString(),
    }),

  certificateDownloaded: (courseId: string, certificateId: string) =>
    trackPixelEvent('Achievement', {
      content_id: certificateId,
      content_name: `Certificate Downloaded for Course: ${courseId}`,
      timestamp: new Date().toISOString(),
    }),

  // Engagement events
  videoWatched: (videoId: string, videoName: string, duration?: number) =>
    trackPixelEvent('Video', {
      content_id: videoId,
      content_name: videoName,
      value: duration || 0,
      timestamp: new Date().toISOString(),
    }),

  contentEngaged: (contentId: string, contentType: string) =>
    trackPixelEvent('Engagement', {
      content_id: contentId,
      content_type: contentType,
      timestamp: new Date().toISOString(),
    }),
};

// Helper function to hash email for privacy
function hashEmail(email: string): string {
  // Simple hash for email - in production, use proper hashing
  return email.toLowerCase().trim();
}

// Helper function to hash phone for privacy
function hashPhone(phone: string): string {
  // Remove non-digits and return
  return phone.replace(/\D/g, '');
}

// Initialize Meta Pixel(s)
export function initMetaPixel(pixelIds: string | string[]) {
  const ids = (Array.isArray(pixelIds) ? pixelIds : [pixelIds]).filter(Boolean);
  if (typeof window === 'undefined' || ids.length === 0) return;

  if (!window.fbq) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      ${ids.map((id) => `fbq('init', '${id}');`).join('\n')}
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    for (const id of ids) {
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript);
    }
    return;
  }

  // Script already present — ensure each pixel is initialized.
  for (const id of ids) {
    window.fbq('init', id);
  }
}

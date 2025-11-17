// Meta Pixel (Facebook Pixel) event tracking

export function trackPixelEvent(
  eventName: string,
  eventData?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, eventData);
  }
}

declare global {
  interface Window {
    fbq: (command: string, event: string, data?: any) => void;
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

  lead: (email?: string, phone?: string, firstName?: string, lastName?: string) =>
    trackPixelEvent('Lead', {
      em: email ? hashEmail(email) : undefined,
      ph: phone ? hashPhone(phone) : undefined,
      fn: firstName,
      ln: lastName,
      timestamp: new Date().toISOString(),
    }),

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

// Initialize Meta Pixel
export function initMetaPixel(pixelId: string) {
  if (typeof window !== 'undefined' && !window.fbq && pixelId) {
    // Load Meta Pixel Script
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
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Fallback image pixel
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);
  }
}

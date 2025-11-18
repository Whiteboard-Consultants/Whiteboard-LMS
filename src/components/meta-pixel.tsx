'use client';

import { useEffect } from 'react';
import { initMetaPixel } from '@/lib/facebook-pixel';

export function MetaPixelInit() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    
    if (!pixelId) {
      // Silently skip initialization if pixel ID is not configured
      // This is expected in development or if env var is not set
      return;
    }

    // Initialize Meta Pixel with pixel ID
    initMetaPixel(pixelId);
  }, []);

  return null;
}

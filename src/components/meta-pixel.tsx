'use client';

import { useEffect } from 'react';
import { initMetaPixel } from '@/lib/facebook-pixel';

export function MetaPixelInit() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    
    if (!pixelId) {
      console.warn('NEXT_PUBLIC_FACEBOOK_PIXEL_ID is not configured');
      return;
    }

    // Initialize Meta Pixel with pixel ID
    initMetaPixel(pixelId);
  }, []);

  return null;
}

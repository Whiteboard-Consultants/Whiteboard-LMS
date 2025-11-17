'use client';

import { useEffect } from 'react';
import { initMetaPixel } from '@/lib/facebook-pixel';

export function MetaPixelInit() {
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  useEffect(() => {
    if (!pixelId) {
      console.warn('NEXT_PUBLIC_FACEBOOK_PIXEL_ID is not configured');
      return;
    }

    // Initialize Meta Pixel
    initMetaPixel();
  }, [pixelId]);

  if (!pixelId) {
    return null;
  }

  return null;
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import RIASECCTASection from './RIASECCTASection';

/**
 * Wrapper component for RIASEC CTA Section
 * Handles OAuth redirect detection and auto-opens RIASEC modal if user just authenticated
 */
export default function RIASECCTASectionWrapper() {
  const searchParams = useSearchParams();
  const [riasecAutoOpen, setRiasecAutoOpen] = useState(false);

  useEffect(() => {
    // Check if user was redirected from OAuth callback
    const oauth = searchParams.get('oauth');
    const from = searchParams.get('from');
    
    if (oauth === 'true' && from === 'riasec') {
      setRiasecAutoOpen(true);
      
      // Clean up URL to remove query params; preserve hash anchors (e.g. /#RIASEC)
      const path = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, path);
    }
  }, [searchParams]);

  return <RIASECCTASection autoOpen={riasecAutoOpen} />;
}

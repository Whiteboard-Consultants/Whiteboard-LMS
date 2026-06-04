'use client';

import { useEffect } from 'react';

function scrollToHash(hash: string, attempt = 0) {
  const id = hash.replace(/^#/, '');
  if (!id) return;

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // Retry while below-the-fold sections hydrate (e.g. resume form client mount)
  if (attempt < 12) {
    window.setTimeout(() => scrollToHash(hash, attempt + 1), 100);
  }
}

/**
 * Scrolls to homepage sections when the URL has a hash (e.g. /#resume, /#RIASEC).
 */
export function HomeHashScroll() {
  useEffect(() => {
    const run = () => scrollToHash(window.location.hash);

    run();

    window.addEventListener('hashchange', run);
    return () => window.removeEventListener('hashchange', run);
  }, []);

  return null;
}

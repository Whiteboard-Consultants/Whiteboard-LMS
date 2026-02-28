'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: HTMLElement | string, options: object) => number;
    };
  }
}

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

/**
 * ReCaptcha Provider - loads the reCAPTCHA script globally
 * Add this to your layout or wrap your app with it
 */
export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
    return <>{children}</>;
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}

/**
 * Hook to execute reCAPTCHA v3 and get a token
 * @param action - The action name for reCAPTCHA analytics (e.g., 'contact_form', 'register')
 * @returns Object with execute function, loading state, and any error
 */
export function useReCaptcha() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      setError('reCAPTCHA site key not configured');
      return;
    }

    // Check if grecaptcha is already loaded
    const checkLoaded = () => {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true);
        });
      } else {
        // Retry after a short delay if not yet loaded
        setTimeout(checkLoaded, 100);
      }
    };

    checkLoaded();
  }, [siteKey]);

  const executeReCaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey) {
        console.error('reCAPTCHA site key not configured');
        return null;
      }

      if (!isLoaded || typeof window === 'undefined' || !window.grecaptcha) {
        console.error('reCAPTCHA not loaded yet');
        return null;
      }

      try {
        const token = await window.grecaptcha.execute(siteKey, { action });
        return token;
      } catch (err) {
        console.error('reCAPTCHA execution failed:', err);
        setError('reCAPTCHA verification failed');
        return null;
      }
    },
    [siteKey, isLoaded]
  );

  return {
    executeReCaptcha,
    isLoaded,
    error,
  };
}

/**
 * ReCaptcha Badge - displays the reCAPTCHA badge (required by Google ToS)
 * You can hide it with CSS but must include the required text attribution
 */
export function ReCaptchaBadge() {
  return (
    <div className="text-xs text-muted-foreground mt-4">
      This site is protected by reCAPTCHA and the Google{' '}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        Privacy Policy
      </a>{' '}
      and{' '}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        Terms of Service
      </a>{' '}
      apply.
    </div>
  );
}

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
  const useEnterprise = process.env.NEXT_PUBLIC_RECAPTCHA_USE_ENTERPRISE === 'true';

  if (!siteKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
    return <>{children}</>;
  }

  const scriptSrc = useEnterprise
    ? `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`
    : `https://www.google.com/recaptcha/api.js?render=${siteKey}`;

  return (
    <>
      <Script
        src={scriptSrc}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ reCAPTCHA script loaded successfully');
          console.log('window.grecaptcha:', typeof window !== 'undefined' ? window.grecaptcha : 'N/A');
        }}
        onError={(error) => {
          console.error('❌ reCAPTCHA script failed to load:', error);
        }}
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
      console.error('reCAPTCHA site key not configured');
      return;
    }

    // Check if grecaptcha is already loaded with retries
    let retries = 0;
    const maxRetries = 50; // 5 seconds max
    const checkLoaded = () => {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        console.log('✅ grecaptcha object found, calling ready()');
        window.grecaptcha.ready(() => {
          console.log('✅ grecaptcha ready callback executed');
          setIsLoaded(true);
        });
      } else {
        retries++;
        if (retries < maxRetries) {
          console.log(`⏳ grecaptcha not ready yet, retrying... (${retries}/${maxRetries})`);
          setTimeout(checkLoaded, 100);
        } else {
          console.error('❌ grecaptcha failed to load after retries');
          setError('reCAPTCHA failed to load');
        }
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

      if (typeof window === 'undefined') {
        console.error('Window is undefined');
        return null;
      }

      if (!window.grecaptcha) {
        console.error('❌ grecaptcha object not available', { isLoaded });
        return null;
      }

      if (!isLoaded) {
        console.error('❌ grecaptcha not loaded yet');
        return null;
      }

      try {
        console.log(`🔄 Executing reCAPTCHA for action: ${action}`);
        const token = await window.grecaptcha.execute(siteKey, { action });
        console.log(`✅ reCAPTCHA token generated (${token?.length} chars)`);
        return token;
      } catch (err) {
        console.error('❌ reCAPTCHA execution failed:', err);
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

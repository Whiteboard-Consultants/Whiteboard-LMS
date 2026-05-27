'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

interface GrecaptchaClient {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: {
      ready?: (callback: () => void) => void;
      execute?: (siteKey: string, options: { action: string }) => Promise<string>;
      enterprise?: GrecaptchaClient;
    };
  }
}

/** Keys from Google Cloud reCAPTCHA require enterprise.js */
export function useRecaptchaEnterprise(): boolean {
  return process.env.NEXT_PUBLIC_RECAPTCHA_USE_ENTERPRISE !== 'false';
}

function getRecaptchaClient(useEnterprise: boolean): GrecaptchaClient | null {
  if (typeof window === 'undefined' || !window.grecaptcha) {
    return null;
  }

  if (useEnterprise) {
    return window.grecaptcha.enterprise ?? null;
  }

  if (window.grecaptcha.ready && window.grecaptcha.execute) {
    return {
      ready: window.grecaptcha.ready.bind(window.grecaptcha),
      execute: window.grecaptcha.execute.bind(window.grecaptcha),
    };
  }

  return null;
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
  const useEnterprise = useRecaptchaEnterprise();

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
          console.log(
            `✅ reCAPTCHA script loaded (${useEnterprise ? 'enterprise' : 'standard'})`
          );
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
  const useEnterprise = useRecaptchaEnterprise();

  useEffect(() => {
    if (!siteKey) {
      setError('reCAPTCHA site key not configured');
      return;
    }

    let retries = 0;
    const maxRetries = 50;

    const checkLoaded = () => {
      const client = getRecaptchaClient(useEnterprise);

      if (client?.ready) {
        client.ready(() => {
          setIsLoaded(true);
        });
        return;
      }

      retries++;
      if (retries < maxRetries) {
        setTimeout(checkLoaded, 100);
      } else {
        setError('reCAPTCHA failed to load');
      }
    };

    checkLoaded();
  }, [siteKey, useEnterprise]);

  const executeReCaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey) {
        return null;
      }

      if (!isLoaded) {
        return null;
      }

      const client = getRecaptchaClient(useEnterprise);
      if (!client?.execute) {
        return null;
      }

      try {
        const token = await client.execute(siteKey, { action });
        return token;
      } catch (err) {
        console.error('reCAPTCHA execution failed:', err);
        setError('reCAPTCHA verification failed');
        return null;
      }
    },
    [siteKey, isLoaded, useEnterprise]
  );

  return {
    executeReCaptcha,
    isLoaded,
    error,
  };
}

/**
 * ReCaptcha Badge - displays the reCAPTCHA badge (required by Google ToS)
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

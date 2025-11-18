'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already made a consent choice
    const consentChoice = localStorage.getItem('cookie-consent');
    
    if (!consentChoice) {
      // Show banner only if no previous choice was made
      setIsVisible(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleAcceptAll = () => {
    // Store consent in localStorage
    localStorage.setItem('cookie-consent', JSON.stringify({
      analytics: true,
      marketing: true,
      tracking: true,
      timestamp: new Date().toISOString()
    }));
    
    // Enable all tracking
    enableAllTracking();
    
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    // Store minimal consent
    localStorage.setItem('cookie-consent', JSON.stringify({
      analytics: false,
      marketing: false,
      tracking: false,
      essential: true,
      timestamp: new Date().toISOString()
    }));
    
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    // Store rejection
    localStorage.setItem('cookie-consent', JSON.stringify({
      analytics: false,
      marketing: false,
      tracking: false,
      timestamp: new Date().toISOString()
    }));
    
    // Disable non-essential tracking
    disableNonEssentialTracking();
    
    setIsVisible(false);
  };

  const enableAllTracking = () => {
    // Enable Google Analytics if gtag is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
  };

  const disableNonEssentialTracking = () => {
    // Disable tracking if gtag is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
  };

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="container max-w-4xl py-6 px-4 md:px-6">
        {/* Close button */}
        <button
          onClick={handleRejectAll}
          className="absolute top-4 right-4 p-1 hover:bg-accent rounded-md transition-colors"
          aria-label="Close cookie banner"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          {/* Header with icon */}
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 mt-1 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Cookie & Tracking Consent
              </h3>
              <p className="text-sm text-muted-foreground">
                We use cookies, analytics, and tracking technologies to improve your experience, 
                deliver personalized content, and measure the effectiveness of our services. 
                Please review our{' '}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
                {' '}to understand how we handle your data.
              </p>
            </div>
          </div>

          {/* Technologies used */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Technologies we use:</p>
            <ul className="space-y-0.5 ml-4 list-disc">
              <li><strong>Google Analytics</strong> - User behavior and site performance</li>
              <li><strong>Meta Pixel</strong> - Conversion tracking and advertising</li>
              <li><strong>Google reCAPTCHA</strong> - Security and bot prevention</li>
              <li><strong>Cookies & Trackers</strong> - Session management and preferences</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleAcceptEssential}
              className="w-full sm:w-auto"
            >
              Reject All
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Open privacy policy for more details
                window.open('/privacy', '_blank');
              }}
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto"
            >
              Accept All
            </Button>
          </div>

          {/* Legal notice */}
          <p className="text-xs text-muted-foreground">
            By clicking "Accept All", you consent to the use of cookies and tracking technologies 
            as described in our Privacy Policy. Your choice will be remembered for 12 months.
          </p>
        </div>
      </div>
    </div>
  );
}

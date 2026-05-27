/**
 * Server-side reCAPTCHA verification
 * This module handles verification of reCAPTCHA tokens on the server
 */

interface ReCaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

interface VerificationResult {
  success: boolean;
  score?: number;
  error?: string;
}

// Minimum score threshold (0.0 to 1.0)
// 0.5 is recommended by Google as a good baseline
// Lower scores indicate more likely bot behavior
const MINIMUM_SCORE = 0.5;

function isEnterpriseConfigured(): boolean {
  return !!(
    process.env.RECAPTCHA_ENTERPRISE_API_KEY &&
    process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  );
}

function isV3Configured(): boolean {
  return !!process.env.RECAPTCHA_SECRET_KEY;
}

function useEnterpriseClient(): boolean {
  return process.env.NEXT_PUBLIC_RECAPTCHA_USE_ENTERPRISE !== 'false';
}

/**
 * Verify reCAPTCHA using whichever backend is configured.
 * When using enterprise.js on the client, prefer CreateAssessment API.
 */
export async function verifyReCaptcha(
  token: string,
  expectedAction?: string
): Promise<VerificationResult> {
  if (useEnterpriseClient() && isEnterpriseConfigured()) {
    return verifyReCaptchaToken(token, expectedAction);
  }
  if (isV3Configured()) {
    return verifyReCaptchaV3Token(token, expectedAction);
  }
  if (isEnterpriseConfigured()) {
    return verifyReCaptchaToken(token, expectedAction);
  }
  if (process.env.NODE_ENV === 'development') {
    console.warn('reCAPTCHA not configured, skipping verification in development');
    return { success: true, score: 1.0 };
  }
  return { success: false, error: 'reCAPTCHA not configured' };
}

/**
 * Verify a reCAPTCHA token on the server
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The expected action name (optional, for additional validation)
 * @returns Verification result with success status and score
 */
export async function verifyReCaptchaToken(
  token: string,
  expectedAction?: string
): Promise<VerificationResult> {
  const secretKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY?.trim();
  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID?.trim();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // If reCAPTCHA is not configured, skip verification in development
  if (!secretKey || !projectId || !siteKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('reCAPTCHA not configured, skipping verification in development');
      return { success: true, score: 1.0 };
    }
    return { success: false, error: 'reCAPTCHA not configured' };
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' };
  }

  try {
    // Use reCAPTCHA Enterprise API
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${secretKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token,
            siteKey,
            expectedAction: expectedAction || undefined,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('reCAPTCHA Enterprise API error:', errorText);
      return { success: false, error: 'reCAPTCHA verification failed' };
    }

    const data = await response.json();

    // Check token validity
    if (!data.tokenProperties?.valid) {
      console.error('Invalid reCAPTCHA token:', data.tokenProperties?.invalidReason);
      return { 
        success: false, 
        error: `Invalid token: ${data.tokenProperties?.invalidReason || 'unknown reason'}` 
      };
    }

    // Check action matches (if expected action was provided)
    if (expectedAction && data.tokenProperties?.action !== expectedAction) {
      console.error('reCAPTCHA action mismatch:', {
        expected: expectedAction,
        received: data.tokenProperties?.action,
      });
      return { success: false, error: 'Action mismatch' };
    }

    // Get the risk score (0.0 = likely bot, 1.0 = likely human)
    const score = data.riskAnalysis?.score ?? 0;

    // Check if score meets minimum threshold
    if (score < MINIMUM_SCORE) {
      console.warn('Low reCAPTCHA score:', score);
      return { 
        success: false, 
        score, 
        error: 'Verification failed - possible bot detected' 
      };
    }

    return { success: true, score };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, error: 'Verification request failed' };
  }
}

/**
 * Simplified verification for standard reCAPTCHA v3 (non-Enterprise)
 * Use this if you're using the standard free tier instead of Enterprise
 */
export async function verifyReCaptchaV3Token(
  token: string,
  expectedAction?: string
): Promise<VerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY?.trim();

  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('reCAPTCHA secret key not configured, skipping verification');
      return { success: true, score: 1.0 };
    }
    return { success: false, error: 'reCAPTCHA not configured' };
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    console.log('reCAPTCHA API response status:', response.status);
    const data: ReCaptchaVerifyResponse = await response.json();
    
    console.log('reCAPTCHA API response:', {
      success: data.success,
      errorCodes: data['error-codes'],
      score: data.score,
      action: data.action,
      hostname: data.hostname,
    });

    if (!data.success) {
      const errorCodes = data['error-codes'] ?? [];
      console.error('reCAPTCHA verification failed:', {
        errorCodes,
        hostname: data.hostname,
        action: data.action,
      });
      const errorMessage =
        errorCodes.includes('browser-error')
          ? 'Domain not allowed in reCAPTCHA settings'
          : errorCodes.includes('invalid-input-secret')
            ? 'Invalid reCAPTCHA secret key'
            : errorCodes.includes('timeout-or-duplicate')
              ? 'reCAPTCHA expired — please try again'
              : errorCodes.length > 0
                ? `Verification failed: ${errorCodes.join(', ')}`
                : 'Verification failed';
      return { success: false, error: errorMessage };
    }

    // Check action matches (log only — some clients omit action on first load)
    if (expectedAction && data.action && data.action !== expectedAction) {
      console.warn('reCAPTCHA action mismatch:', {
        expected: expectedAction,
        received: data.action,
      });
      return { success: false, error: 'Action mismatch' };
    }

    // Check score threshold
    const score = data.score ?? 0;
    if (score < MINIMUM_SCORE) {
      console.warn('Low reCAPTCHA score:', score, 'hostname:', data.hostname);
      return { success: false, score, error: 'Low score - please try again' };
    }

    return { success: true, score };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, error: 'Verification request failed' };
  }
}

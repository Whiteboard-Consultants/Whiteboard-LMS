/**
 * RIASEC Registration/Sign In Component
 * Handles both user registration and sign in for the assessment
 */

'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Check, LogIn } from 'lucide-react';

interface RIASECRegistrationProps {
  onComplete: (data: {
    userId: string;
    email: string;
    fullName: string;
    assessmentId: string;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
}

type AuthMode = 'signup' | 'signin';

export function RIASECRegistration({
  onComplete,
  isLoading = false,
  error = null,
}: RIASECRegistrationProps) {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSignUpForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignInForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUpForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/riasec/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setValidationErrors({
          submit: data.error || 'Registration failed',
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        onComplete({
          userId: data.user.id,
          email: data.user.email,
          fullName: formData.fullName,
          assessmentId: data.assessment.id,
        });
      }
    } catch (err) {
      setValidationErrors({
        submit: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignInForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/riasec/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setValidationErrors({
          submit: data.error || 'Sign in failed',
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        onComplete({
          userId: data.user.id,
          email: data.user.email,
          fullName: formData.email.split('@')[0], // Use email prefix as fallback
          assessmentId: data.assessment.id,
        });
      }
    } catch (err) {
      setValidationErrors({
        submit: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setValidationErrors({});
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      // Call Google OAuth endpoint
      const response = await fetch('/api/riasec/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          redirectUrl: `${window.location.origin}/auth/callback`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate Google sign in');
      }

      const data = await response.json();
      // Redirect to Supabase Google OAuth
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setValidationErrors({
        submit: err instanceof Error ? err.message : 'Google sign in failed',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">Career Assessment</h1>
          <p className="text-blue-100">Discover Your Career Path</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleModeSwitch('signup')}
            className={`flex-1 px-4 py-3 font-medium text-center transition ${
              mode === 'signup'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              New Student
            </span>
          </button>
          <button
            onClick={() => handleModeSwitch('signin')}
            className={`flex-1 px-4 py-3 font-medium text-center transition ${
              mode === 'signin'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
            {/* Full Name - Only for Sign Up */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900 placeholder-gray-500 text-base ${
                    validationErrors.fullName
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                  disabled={isSubmitting || isLoading}
                />
                {validationErrors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900 placeholder-gray-500 text-base ${
                  validationErrors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                disabled={isSubmitting || isLoading}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900 placeholder-gray-500 text-base ${
                  validationErrors.password
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="••••••"
                disabled={isSubmitting || isLoading}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password - Only for Sign Up */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900 placeholder-gray-500 text-base ${
                    validationErrors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••"
                  disabled={isSubmitting || isLoading}
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Error */}
            {(error || validationErrors.submit) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error || validationErrors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting || isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {mode === 'signup' ? 'Begin Assessment' : 'Sign In & Continue'}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Google</span>
            </button>

            {/* Info Text */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Your information is secure and used only for this assessment.{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

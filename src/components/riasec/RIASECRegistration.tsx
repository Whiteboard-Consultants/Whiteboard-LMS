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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function ResetPasswordForm() {
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasValidSession, setHasValidSession] = useState(false);

  // Verify we have a valid recovery session
  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log('🔍 Verifying recovery session...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw new Error('Failed to verify session');
        }

        if (session?.user) {
          console.log('✅ Valid recovery session found for:', session.user.email);
          setHasValidSession(true);
          setError(null);
        } else {
          console.error('❌ No valid session found');
          throw new Error('Your password reset link is invalid or has expired. Please request a new one.');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        console.error('❌ Verification error:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        // Redirect after error
        setTimeout(() => router.push('/forgot-password'), 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    // Small delay to let Supabase process the token
    const timer = setTimeout(verifySession, 300);
    return () => clearTimeout(timer);
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation
      if (!password || !confirmPassword) {
        throw new Error('Please enter your password');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      console.log('🔐 Updating password with recovery session...');

      // Update password using the authenticated session from the recovery link
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        throw new Error(updateError.message || 'Failed to reset password');
      }

      console.log('✅ Password reset successfully');
      toast.success('Password reset successfully!');

      // Sign out and redirect to login
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      console.error('Reset error:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your reset link...</p>
      </div>
    );
  }

  // Show error if no valid session
  if (!hasValidSession) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-800 dark:text-red-200">
          {error || 'Your password reset link is invalid or has expired.'}
        </p>
        <Button 
          onClick={() => router.push('/forgot-password')}
          className="w-full mt-4"
          variant="outline"
        >
          Request New Reset Link
        </Button>
      </div>
    );
  }

  // Reset password form
  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}

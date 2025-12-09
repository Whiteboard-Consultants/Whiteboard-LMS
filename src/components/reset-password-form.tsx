'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { resetPasswordWithCode, resetPasswordWithSession } from '@/app/(auth)/reset-password/actions';
import { toast } from 'sonner';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  // Check if the user has a valid recovery session or code
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for recovery code or session...');
        
        // First check if we have a code in the URL (from callback route)
        const code = searchParams.get('code');
        if (code) {
          console.log('✅ Recovery code found in URL');
          setRecoveryCode(code);
          setSessionValid(true);
          // For recovery links, we don't know the email until they submit
          setUserEmail('');
          setIsVerifying(false);
          return;
        }
        
        // Otherwise check for an active recovery session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }
        
        if (session) {
          console.log('✅ Valid session found for user:', session.user.email);
          setUserEmail(session.user.email || '');
          setSessionValid(true);
          setIsVerifying(false);
          return;
        }
        
        // Check URL for error parameters
        const error = searchParams.get('error');
        if (error) {
          throw new Error(`Auth error: ${error}`);
        }
        
        throw new Error('No active session or recovery code. Please request a new password reset.');
      } catch (error) {
        console.error('❌ Session/code check error:', error);
        toast.error(`Invalid or expired reset link. Please request a new password reset.`);
        setTimeout(() => router.push('/forgot-password'), 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    checkSession();
  }, [router, searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords
    if (!password || !confirmPassword) {
      toast.error('Please enter your password');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      let result;
      
      // If we have a recovery code from URL, use it to reset password
      if (recoveryCode) {
        console.log('🔄 Resetting password using recovery code...');
        console.log('Recovery code:', recoveryCode.substring(0, 10) + '...');
        result = await resetPasswordWithCode(password, recoveryCode);
      } else {
        // Otherwise use the active session
        console.log('🔄 Resetting password using active session...');
        result = await resetPasswordWithSession(password);
      }

      if (!result.success) {
        toast.error(result.message || 'Failed to reset password');
        return;
      }

      toast.success('Password reset successfully!');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while resetting your password';
      console.error('Detailed error:', errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isVerifying}
            className="pr-10"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isLoading || isVerifying}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Must be at least 8 characters
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading || isVerifying}
          minLength={8}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || isVerifying || !sessionValid}
      >
        {isVerifying ? 'Verifying reset link...' : isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>

      {isVerifying && (
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Verifying your reset link...
        </p>
      )}
    </form>
  );
}

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
  const [sessionValid, setSessionValid] = useState(false);

  // Check if the user has a valid recovery session from the URL token
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for recovery session...');
        
        // Check for error parameters in URL
        const params = new URLSearchParams(window.location.search);
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');
        
        if (errorCode) {
          console.error('❌ URL contains error:', { errorCode, errorDescription });
          throw new Error(`${errorDescription || errorCode}`);
        }
        
        // Get the recovery code from URL parameters
        const code = params.get('code');
        
        console.log('📍 Recovery code from URL:', code ? '✅ Found' : '❌ Not found');
        
        if (code) {
          // Exchange the recovery code for a session
          console.log('🔄 Exchanging recovery code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('❌ Code exchange error:', error);
            throw error;
          }
          
          if (data.session) {
            console.log('✅ Session created successfully for user:', data.session.user.email);
            setSessionValid(true);
          } else {
            throw new Error('No session created after code exchange');
          }
        } else {
          // No code in URL - check if there's already a valid session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('✅ Valid session already exists');
            setSessionValid(true);
          } else {
            throw new Error('No recovery code in URL and no active session');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Invalid or expired reset link (${errorMessage}). Please request a new password reset.`);
        setTimeout(() => router.push('/forgot-password'), 3000);
      } finally {
        setIsVerifying(false);
      }
    };

    checkSession();
  }, [router]);

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
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Password reset error:', error);
        toast.error(error.message || 'Failed to reset password');
        return;
      }

      toast.success('Password reset successfully!');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred while resetting your password');
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

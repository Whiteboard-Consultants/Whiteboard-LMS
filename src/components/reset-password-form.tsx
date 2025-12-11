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
  const [sessionUser, setSessionUser] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 Reset password form mounted');
    console.log('📋 Full URL:', typeof window !== 'undefined' ? window.location.href : 'server-side');
    console.log('📋 Hash:', typeof window !== 'undefined' ? window.location.hash : 'server-side');

    // Check for tokens in hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      console.log('📋 Hash params:', {
        access_token: hashParams.get('access_token') ? hashParams.get('access_token')!.substring(0, 20) + '...' : 'none',
        refresh_token: hashParams.get('refresh_token') ? hashParams.get('refresh_token')!.substring(0, 20) + '...' : 'none',
        type: hashParams.get('type')
      });
    }

    let isMounted = true;
    let sessionCheckCount = 0;
    const maxChecks = 5; // Check for 5 seconds

    // Function to check for session
    const checkForSession = async () => {
      sessionCheckCount++;
      console.log(`🔍 Session check #${sessionCheckCount}`);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        setError('Failed to verify reset link.');
        setIsVerifying(false);
        return;
      }

      if (session?.user) {
        console.log('✅ Session found:', session.user.email);
        setSessionUser(session.user.email);
        setHasValidSession(true);
        setError(null);
        setIsVerifying(false);
        return;
      }

      console.log(`⏳ No session yet, attempt ${sessionCheckCount}/${maxChecks}`);

      // Keep checking if we haven't reached max attempts
      if (sessionCheckCount < maxChecks) {
        setTimeout(checkForSession, 1000);
      } else {
        console.error('❌ No session after maximum attempts');
        setError('Your password reset link is invalid or has expired. Please request a new one.');
        setIsVerifying(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');

        if (session?.user) {
          console.log('✅ Session from auth change:', session.user.email);
          setSessionUser(session.user.email);
          setHasValidSession(true);
          setError(null);
          setIsVerifying(false);
        }
      }
    );

    // Start checking for session
    checkForSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!password || !confirmPassword) {
        throw new Error('Please enter your password');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      console.log('🔐 Updating password...');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('❌ No authenticated session');
        throw new Error('Session expired. Please use the reset link from your email again.');
      }

      console.log('📧 Updating password for:', session.user.email);

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        throw new Error(updateError.message || 'Failed to reset password');
      }

      console.log('✅ Password reset successfully');
      toast.success('Password reset successfully!');

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

  if (isVerifying) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your reset link...</p>
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Link Expired</h2>
          <p className="text-sm text-red-800 dark:text-red-200 mb-4">
            {error || 'Your password reset link is invalid or has expired.'}
          </p>
          <Button 
            onClick={() => router.push('/forgot-password')}
            className="w-full"
            variant="default"
          >
            Request New Reset Link
          </Button>
        </div>
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

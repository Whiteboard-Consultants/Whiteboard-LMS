'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getTestById } from '@/app/instructor/test-series-actions';
import { userHasTestAccess } from '@/app/instructor/series-purchase-actions';
import TestTaker from '@/components/test-taker';
import { SeriesPurchaseCard } from '@/components/series-purchase-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Test } from '@/types';

interface TestAccessGateProps {
  testId: string;
}

export function TestAccessGate({ testId }: TestAccessGateProps) {
  const { user, loading: authLoading } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);

  useEffect(() => {
    console.log('🔐 [TestAccessGate] useEffect triggered:', { testId, userExists: !!user, authLoading });
    if (authLoading) {
      console.log('🔐 [TestAccessGate] Auth still loading, waiting...');
      return;
    }
    
    if (!testId) {
      console.log('🔐 [TestAccessGate] No testId provided');
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always fetch test details (regardless of auth status)
        console.log('🔐 [TestAccessGate] Fetching test:', testId);
        const testResult = await getTestById(testId);

        if (!testResult.success || !testResult.data) {
          throw new Error(testResult.error || 'Test not found');
        }

        setTest(testResult.data);
        const testData = testResult.data;

        // Check if test is free (standalone)
        if (testData.isFree || testData.price === 0) {
          console.log('✅ [TestAccessGate] Test is free (standalone)');
          // For free tests, require authentication
          if (!user) {
            console.log('🔐 [TestAccessGate] Free test but user not logged in');
            return;
          }
          console.log('✅ [TestAccessGate] Granting access to free test');
          setHasAccess(true);
          return;
        }

        // User must be logged in for paid/course-linked tests
        if (!user) {
          console.log('🔐 [TestAccessGate] User not authenticated - showing purchase gate');
          setHasAccess(false);
          return;
        }

        // User is authenticated, check if they have access
        console.log('🔐 [TestAccessGate] Checking test access for user:', user.id);
        const accessResult = await userHasTestAccess(user.id, testId);

        if (accessResult.success && accessResult.hasAccess) {
          console.log('✅ [TestAccessGate] User has access to test (either purchased or enrolled in course)');
          setHasAccess(true);
        } else {
          console.log('🚫 [TestAccessGate] User does not have access, showing purchase gate');
          setHasAccess(false);
        }
      } catch (err) {
        console.error('❌ [TestAccessGate] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check test access');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, testId, authLoading]);

  // Handle successful purchase
  const handlePurchaseSuccess = () => {
    console.log('✅ [TestAccessGate] Purchase completed, granting access');
    setPurchaseCompleted(true);
    setHasAccess(true);
  };

  // Auth is still loading
  if (authLoading) {
    console.log('🔐 [TestAccessGate] Auth loading, showing skeleton');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state (for test data) - check this BEFORE checking user auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Test not found. Please try again.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // User not authenticated - show purchase gate if test is paid
  if (!user && test && (test.price && test.price > 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/mock-tests"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mock Tests
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {test.title}
            </h1>
            <p className="text-lg text-foreground/70 dark:text-slate-300">
              This test requires a purchase to access
            </p>
          </div>

          <SeriesPurchaseCard
            series={{
              id: test.seriesId || test.id,
              title: test.seriesTitle || test.title,
              price: test.seriesPrice || test.price || 0,
              individualTestPrice: test.price || 0,
              discountPercentage: test.discountPercentage || 0,
              description: test.description,
              testCount: 1,
            }}
            onPurchaseSuccess={handlePurchaseSuccess}
            isTestPurchase={true}
            testId={testId}
          />
        </div>
      </div>
    );
  }

  // User not authenticated and test is free
  if (!user) {
    const loginHref = `/login?returnUrl=${encodeURIComponent(`/test/${testId}`)}`;
    const registerHref = `/register?returnUrl=${encodeURIComponent(`/test/${testId}`)}`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Link 
            href="/mock-tests"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mock Tests
          </Link>
          
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Please log in or create an account to take this free test.
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Log in
            </Link>
            <Link
              href={registerHref}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Debug: If we reach here but nothing else renders, show debug info
  console.log('🔐 [TestAccessGate] Render state:', { loading, error, hasAccess, testExists: !!test });

  // User has access - show test taker
  if (hasAccess) {
    return <TestTaker testId={testId} />;
  }

  // User needs to purchase - show purchase gate
  // This happens when test is paid and user doesn't have access
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/mock-tests"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mock Tests
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {test.title}
          </h1>
          <p className="text-lg text-foreground/70 dark:text-slate-300">
            This test requires a purchase to access
          </p>
        </div>

        <SeriesPurchaseCard
          series={{
            id: test.seriesId || test.id,
            title: test.seriesTitle || test.title,
            price: test.seriesPrice || test.price || 0,
            individualTestPrice: test.price || 0, // Add individual test price
            discountPercentage: test.discountPercentage || 0,
            description: test.description,
            testCount: 1,
          }}
          onPurchaseSuccess={handlePurchaseSuccess}
          isTestPurchase={true}
          testId={testId}
        />

        {/* Show individual test price if not part of series */}
        {!test.seriesId && (
          <Card className="mt-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-lg">Individual Test Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Purchase access to this test only.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  ₹{test.price || 0}
                </span>
                <span className="text-sm text-foreground/60">per attempt</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

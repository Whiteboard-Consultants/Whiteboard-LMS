
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/page-header';
import { getTestById } from '@/app/instructor/test-series-actions';
import type { Test } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';

const TestForm = dynamic(() => import('@/components/series-test-form').then(mod => mod.SeriesTestForm), { ssr: false });
const TestSectionBuilder = dynamic(() => import('@/components/test-section-builder').then(mod => mod.TestSectionBuilder), {
    ssr: false,
    loading: () => <p>Loading section builder...</p>
});
const TestPassageManager = dynamic(() => import('@/components/test-passage-manager').then(mod => mod.TestPassageManager), {
    ssr: false,
    loading: () => <p>Loading passage manager...</p>
});
const TestQuestionManagerBySection = dynamic(() => import('@/components/test-question-manager-by-section').then(mod => mod.TestQuestionManagerBySection), {
    ssr: false,
    loading: () => <p>Loading question manager...</p>
});


export default function EditTestPage() {
  const params = useParams();
  const testId = params.testId as string;
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      setLoading(true);
      try {
        // Use server action to fetch test with series data
        const result = await getTestById(testId);

        console.log('🎯 [EditTestPage] getTestById result:', {
          success: result.success,
          testId: result.data?.id,
          seriesId: result.data?.seriesId,
          seriesPrice: result.data?.seriesPrice,
          discountPercentage: result.data?.discountPercentage
        });

        if (!result.success) {
          setError(result.error || 'Test not found.');
          console.error(result.error);
        } else if (result.data) {
          console.log('✅ [EditTestPage] Test loaded with series pricing:', {
            id: result.data.id,
            title: result.data.title,
            instructorId: result.data.instructorId,
            seriesId: result.data.seriesId,
            seriesPrice: result.data.seriesPrice,
            discountPercentage: result.data.discountPercentage
          });
          
          // Log what we're passing to form
          console.log('📋 [EditTestPage] Passing to SeriesTestForm initialData:', {
            id: result.data.id,
            seriesId: result.data.seriesId,
            seriesPrice: result.data.seriesPrice,
            discountPercentage: result.data.discountPercentage,
            isPurchasableSeries: result.data.seriesPrice ? true : false
          });
          
          setTest(result.data);
        } else {
          setError('Test not found.');
        }
      } catch (err) {
        setError('Failed to fetch test data.');
        console.error('❌ [EditTestPage] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/instructor/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </Button>
      </div>
      <PageHeader
        title="Edit Test"
        description="Update the details and manage questions for your test."
      />
      <div className="max-w-4xl mx-auto space-y-8 bg-muted/40 dark:bg-slate-900/50 border dark:border-slate-800 p-4 sm:p-6 md:p-8 rounded-lg">
        {loading && (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        )}
        {error && <p className="text-destructive text-center">{error}</p>}
        {!loading && !error && test && (
            <>
                <TestForm initialData={test} />
                <Separator />
                <TestSectionBuilder testId={test.id} />
                <Separator />
                <TestPassageManager testId={test.id} />
                <Separator />
                <TestQuestionManagerBySection testId={test.id} />
            </>
        )}
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/page-header';
import type { Test } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';

const TestForm = dynamic(() => import('@/components/test-form').then(mod => mod.TestForm), { ssr: false });
const TestQuestionManager = dynamic(() => import('@/components/test-question-manager').then(mod => mod.TestQuestionManager), {
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
        const { data, error } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single();

        if (error) {
          setError('Test not found.');
          console.error(error);
        } else if (data) {
          setTest(data as Test);
        } else {
          setError('Test not found.');
        }
      } catch (err) {
        setError('Failed to fetch test data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  return (
    <div>
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
      <div className="max-w-4xl mx-auto space-y-8 bg-muted/40 p-4 sm:p-6 md:p-8 rounded-lg">
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
                <TestQuestionManager testId={test.id} />
            </>
        )}
      </div>
    </div>
  );
}

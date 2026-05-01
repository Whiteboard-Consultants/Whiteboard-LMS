'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { NewThreadForm } from '@/app/(main)/student/messaging/components/new-thread-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface NewThreadPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default function NewThreadPage({
  params,
}: NewThreadPageProps) {
  const { courseId } = use(params);
  const { user, loading: authLoading, accessToken } = useAuth();
  const router = useRouter();
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const getEnrollmentId = async () => {
      try {
        console.log('[NewThreadPage] Fetching enrollment for user:', user.id, 'courseId:', courseId);

        // Use the API endpoint instead of client-side Supabase to bypass RLS policies
        const response = await fetch(`/api/enrollments?courseId=${courseId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.error('[NewThreadPage] Enrollment API error:', response.status);
          console.warn('[NewThreadPage] No enrollment found, redirecting to dashboard');
          router.push('/student/dashboard');
          return;
        }

        const data = await response.json();
        const enrollment = data.enrollment;

        console.log('[NewThreadPage] Enrollment query result:', { enrollment });

        if (enrollment) {
          console.log('[NewThreadPage] Enrollment found:', enrollment.id);
          setEnrollmentId(enrollment.id);
        } else {
          console.warn('[NewThreadPage] No enrollment found, redirecting to dashboard');
          router.push('/student/dashboard');
        }
      } catch (error) {
        console.error('[NewThreadPage] Exception fetching enrollment:', error);
        router.push('/student/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    getEnrollmentId();
  }, [courseId, user, authLoading, accessToken]);

  if (isLoading || !enrollmentId) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto p-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/student/${courseId}/messaging`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mt-4">Start a New Conversation</h1>
          <p className="text-muted-foreground mt-1">
            Ask your instructor a question or discuss a topic
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto mt-8">
        <NewThreadForm courseId={courseId} enrollmentId={enrollmentId} />
      </div>
    </div>
  );
}

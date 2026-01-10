'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface QuizAttempt {
  id: string;
  user_id: string;
  enrollment_id: string;
  course_id: string;
  lesson_id: string;
  answers: (number | string | null)[];
  questions: any[];
  submitted_at: string;
  grading_status: 'pending' | 'reviewed' | 'graded';
  instructor_feedback?: string;
  enrollments?: {
    student_name: string;
    course_title: string;
  };
  lessons?: {
    title: string;
  };
}

export default function InstructorGradingPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pendingAttempts, setPendingAttempts] = useState<QuizAttempt[]>([]);
  const [reviewedAttempts, setReviewedAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, total: 0 });

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Check if user is authenticated and is an instructor
    if (!user || userData?.role !== 'instructor') {
      router.push('/login');
      return;
    }

    const fetchPendingGrading = async () => {
      try {
        setLoading(true);

        // Import action
        const { getPendingGradingTasks, getGradingStats } = await import('./actions');

        // Get pending tasks
        const result = await getPendingGradingTasks(user.id);
        if (result.success && result.data) {
          // Separate pending and reviewed
          const pending = (result.data as any[]).filter((a: any) => a.grading_status === 'pending');
          const reviewed = (result.data as any[]).filter((a: any) => a.grading_status === 'reviewed');
          setPendingAttempts(pending as QuizAttempt[]);
          setReviewedAttempts(reviewed as QuizAttempt[]);
        }

        // Get stats
        const statsResult = await getGradingStats(user.id);
        if (statsResult.success) {
          setStats(statsResult.data as any || { pending: 0, reviewed: 0, total: 0 });
        }
      } catch (error) {
        console.error('❌ Error loading grading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingGrading();
  }, [user, userData, authLoading, router]);

  const countDescriptiveQuestions = (questions: any[]) => {
    return questions?.filter((q: any) => q.type === 'descriptive').length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-64 bg-slate-200 rounded"></div>
          <div className="h-32 w-full bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Assessment Grading</h1>
          <p className="text-slate-600">Review and grade student descriptive responses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Reviewed</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.reviewed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Attempts</p>
                  <p className="text-3xl font-bold text-slate-700">{stats.total}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-slate-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Attempts */}
        {pendingAttempts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Pending Grading ({pendingAttempts.length})</h2>
            <div className="grid gap-4">
              {pendingAttempts.map((attempt) => (
                <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {attempt.enrollments?.student_name || 'Unknown Student'}
                        </h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p>
                            <span className="font-medium">Course:</span> {attempt.enrollments?.course_title}
                          </p>
                          <p>
                            <span className="font-medium">Assessment:</span> {attempt.lessons?.title}
                          </p>
                          <p>
                            <span className="font-medium">Descriptive Questions:</span>{' '}
                            {countDescriptiveQuestions(attempt.questions)}
                          </p>
                          <p>
                            <span className="font-medium">Submitted:</span>{' '}
                            {new Date(attempt.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link href={`/instructor/grading/${attempt.id}`}>
                        <Button>Grade Now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed Attempts */}
        {reviewedAttempts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Already Reviewed ({reviewedAttempts.length})</h2>
            <div className="grid gap-4">
              {reviewedAttempts.map((attempt) => (
                <Card key={attempt.id} className="opacity-75">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {attempt.enrollments?.student_name || 'Unknown Student'}
                        </h3>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p>
                            <span className="font-medium">Course:</span> {attempt.enrollments?.course_title}
                          </p>
                          <p>
                            <span className="font-medium">Assessment:</span> {attempt.lessons?.title}
                          </p>
                          <p className="text-blue-600">
                            <span className="font-medium">Status:</span> Already graded
                          </p>
                        </div>
                      </div>
                      <Link href={`/instructor/grading/${attempt.id}`}>
                        <Button variant="outline">View Feedback</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingAttempts.length === 0 && reviewedAttempts.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">All caught up!</h3>
              <p className="text-slate-600">
                You have no pending assessments to grade at this time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

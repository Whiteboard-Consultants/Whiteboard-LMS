'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Target, Eye, RotateCcw, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { getStudentEnrolledTests } from '@/app/(main)/student/dashboard/actions';
import type { Test, TestAttempt, TestType } from '@/lib/types';

// Helper to safely render HTML content - decode HTML entities
const sanitizeAndRenderHTML = (html: string): string => {
  if (!html) return '';
  // Decode HTML entities
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&');
};

interface StudentTest extends Test {
  attempts: TestAttempt[];
  bestScore?: number;
  totalAttempts: number;
  canAttempt: boolean;
  lastAttempt?: TestAttempt;
}

export default function StudentTestsPage() {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [tests, setTests] = useState<StudentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (userData?.role === 'student') {
      fetchTests();
    }
  }, [userData]);

  const fetchTests = async () => {
    if (!userData?.id) return;

    try {
      setLoading(true);
      
      // Use server action to fetch enrolled tests (bypasses RLS)
      const testsResult = await getStudentEnrolledTests(userData.id);

      if (!testsResult.success) {
        console.error('Error fetching tests:', testsResult.error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch tests',
        });
        return;
      }

      const testsData = testsResult.data || [];
      
      // Fetch user's test attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', userData.id);

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
      }

      // Fetch question counts for all tests
      const { data: questionCounts, error: questionCountError } = await supabase
        .from('test_questions')
        .select('id, test_id')
        .in('test_id', (testsData || []).map(test => test.id));

      if (questionCountError) {
        console.error('Error fetching question counts:', questionCountError);
      }

      // Map tests with attempt data
      const mappedTests = (testsData || []).map((test) => {
        const testAttempts = (attemptsData || []).filter(
          attempt => attempt.test_id === test.id
        );

        const completedAttempts = testAttempts.filter(
          attempt => attempt.status === 'completed'
        );

        // Use the LATEST completed attempt (by submitted_at), not the best score
        // This ensures consistency with the results page showing the most recent attempt
        const latestAttempt = completedAttempts.length > 0
          ? completedAttempts.sort(
              (a, b) => new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime()
            )[0]
          : null;

        const bestScore = latestAttempt
          ? (() => {
              const score = latestAttempt.score || 0;
              const total = latestAttempt.total_questions || 0;
              const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
              console.log(`📊 Latest attempt for test "${test.title}": score=${score}, total=${total}, percentage=${percentage}, submitted=${latestAttempt.submitted_at}`);
              return percentage;
            })()
          : undefined;
        
        console.log(`📋 Test "${test.title}": latestScore=${bestScore}, passingScore=${test.passing_score || 80}, hasCompleted=${completedAttempts.length > 0}`);

        const canAttempt = test.max_attempts 
          ? testAttempts.length < test.max_attempts 
          : true;

        const lastAttempt = testAttempts.sort(
          (a, b) => new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime()
        )[0];

        // Count questions for this test
        const questionCountForTest = (questionCounts || []).filter(
          q => q.test_id === test.id
        ).length;

        return {
          id: test.id,
          title: test.title,
          description: test.description,
          type: test.type || 'assessment',
          duration: test.duration,
          isTimeLimited: test.is_time_limited ?? true,
          passingScore: test.passing_score || 80,
          maxAttempts: test.max_attempts,
          showResults: test.show_results ?? true,
          allowReview: test.allow_review ?? true,
          instructorId: test.instructor_id,
          questionCount: questionCountForTest,
          createdAt: test.created_at,
          courseId: test.course_id,
          courseTitle: test.course_title,
          attempts: testAttempts,
          bestScore,
          totalAttempts: testAttempts.length,
          canAttempt,
          lastAttempt,
        } as StudentTest;
      });

      setTests(mappedTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (test: StudentTest) => {
    if (test.totalAttempts === 0) {
      return { label: 'Not Started', color: 'text-gray-600', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    const hasInProgress = test.attempts.some(attempt => attempt.status === 'in-progress');
    if (hasInProgress) {
      return { label: 'In Progress', color: 'text-blue-600', icon: <Clock className="h-4 w-4" /> };
    }

    // Use best score (now calculated as percentage) to determine pass/fail
    if (test.bestScore !== undefined) {
      const passed = test.bestScore >= (test.passingScore || 80);
      return passed 
        ? { label: 'Passed', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> }
        : { label: 'Failed', color: 'text-red-600', icon: <XCircle className="h-4 w-4" /> };
    }

    // If no best score but has attempts, default to failed
    if (test.totalAttempts > 0) {
      return { label: 'Failed', color: 'text-red-600', icon: <XCircle className="h-4 w-4" /> };
    }

    return { label: 'Available', color: 'text-gray-600', icon: <Play className="h-4 w-4" /> };
  };

  const availableTests = tests.filter(test => test.canAttempt);
  const completedTests = tests.filter(test => test.totalAttempts > 0);
  const practiceTests = tests.filter(test => test.type === 'practice');
  const finalTests = tests.filter(test => test.type === 'final');

  if (userData?.role !== 'student') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Tests & Assessments"
        description="Take practice tests, final assessments, and track your progress"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="final">Final Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <TestGrid tests={availableTests} loading={loading} />
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <TestGrid tests={practiceTests} loading={loading} />
        </TabsContent>

        <TabsContent value="final" className="space-y-4">
          <TestGrid tests={finalTests} loading={loading} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <TestGrid tests={completedTests} loading={loading} showProgress />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TestGridProps {
  tests: StudentTest[];
  loading: boolean;
  showProgress?: boolean;
}

function TestGrid({ tests, loading, showProgress = false }: TestGridProps) {
  const getTestTypeIcon = (type: TestType) => {
    switch (type) {
      case 'practice':
        return <RotateCcw className="h-5 w-5" />;
      case 'final':
        return <Target className="h-5 w-5" />;
      case 'assessment':
        return <Eye className="h-5 w-5" />;
      case 'quiz':
        return <Clock className="h-5 w-5" />;
      default:
        return <Eye className="h-5 w-5" />;
    }
  };

  const getTestTypeBadge = (type: TestType) => {
    const colors = {
      practice: 'bg-blue-100 text-blue-800',
      final: 'bg-red-100 text-red-800',
      assessment: 'bg-green-100 text-green-800',
      quiz: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge variant="secondary" className={colors[type] || colors.assessment}>
        <div className="flex items-center gap-1">
          {getTestTypeIcon(type)}
          <span className="capitalize">{type}</span>
        </div>
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getTestStatus = (test: StudentTest) => {
    if (test.totalAttempts === 0) {
      return { label: 'Not Started', color: 'text-gray-600', icon: <AlertCircle className="h-4 w-4" /> };
    }
    
    const hasInProgress = test.attempts.some(attempt => attempt.status === 'in-progress');
    if (hasInProgress) {
      return { label: 'In Progress', color: 'text-blue-600', icon: <Clock className="h-4 w-4" /> };
    }

    // Use best score (now calculated as percentage) to determine pass/fail
    if (test.bestScore !== undefined) {
      const passed = test.bestScore >= (test.passingScore || 80);
      return passed 
        ? { label: 'Passed', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> }
        : { label: 'Failed', color: 'text-red-600', icon: <XCircle className="h-4 w-4" /> };
    }

    // If no best score but has attempts, default to failed
    if (test.totalAttempts > 0) {
      return { label: 'Failed', color: 'text-red-600', icon: <XCircle className="h-4 w-4" /> };
    }

    return { label: 'Available', color: 'text-gray-600', icon: <Play className="h-4 w-4" /> };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No tests found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no tests available in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((test) => {
        const status = getTestStatus(test);
        
        return (
          <Card key={test.id} className="flex flex-col hover:shadow-lg transition-shadow h-full">
            <CardHeader className="pb-3 border-b">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold line-clamp-2">{test.title}</CardTitle>
                  </div>
                  {getTestTypeBadge(test.type)}
                </div>
                {test.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{test.description.replace(/<[^>]*>/g, '')}</p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 py-4 space-y-4">
              {/* Test Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{test.isTimeLimited ? formatDuration(test.duration) : 'No limit'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span>{test.questionCount} Q{test.questionCount !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4 flex-shrink-0" />
                  <span>Pass: {test.passingScore}%</span>
                </div>

                {test.maxAttempts && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RotateCcw className="h-4 w-4 flex-shrink-0" />
                    <span>{test.totalAttempts}/{test.maxAttempts}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className={`flex items-center gap-2 text-sm font-semibold ${status.color}`}>
                {status.icon}
                <span>{status.label}</span>
              </div>

              {/* Progress Bar */}
              {showProgress && test.bestScore !== undefined && (
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Best Score</span>
                    <span className="font-bold">{test.bestScore}%</span>
                  </div>
                  <Progress value={test.bestScore} className="h-1.5" />
                </div>
              )}
            </CardContent>

            {/* Action Buttons */}
            <div className="border-t px-6 py-3 flex gap-2">
              {test.canAttempt && (
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/student/tests/${test.id}/take`}>
                    <Play className="h-4 w-4 mr-1.5" />
                    {test.totalAttempts === 0 ? 'Start Test' : 'Retake'}
                  </Link>
                </Button>
              )}
              
              {test.totalAttempts > 0 && test.allowReview && test.lastAttempt && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/student/quiz-results/${test.lastAttempt.id}`}>
                    <Eye className="h-4 w-4 mr-1.5" />
                    Review
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

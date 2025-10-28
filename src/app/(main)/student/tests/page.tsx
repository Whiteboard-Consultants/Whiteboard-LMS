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
import type { Test, TestAttempt, TestType } from '@/lib/types';

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
      
      // Fetch all available tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (testsError) {
        console.error('Error fetching tests:', testsError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch tests',
        });
        return;
      }

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
        .select('test_id')
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

        const bestScore = completedAttempts.length > 0 
          ? Math.max(...completedAttempts.map(attempt => {
              // Calculate percentage: (score / total_questions) * 100
              const score = attempt.score || 0;
              const total = attempt.total_questions || 0;
              return total > 0 ? Math.round((score / total) * 100) : 0;
            }))
          : undefined;

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
          <Card key={test.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{test.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {test.description}
                  </CardDescription>
                </div>
                {getTestTypeBadge(test.type)}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{test.isTimeLimited ? formatDuration(test.duration) : 'No time limit'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{test.questionCount} questions</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Passing: {test.passingScore}%</span>
                </div>

                {test.maxAttempts && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RotateCcw className="h-4 w-4" />
                    <span>{test.totalAttempts}/{test.maxAttempts} attempts</span>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-2 text-sm font-medium ${status.color}`}>
                {status.icon}
                <span>{status.label}</span>
              </div>

              {showProgress && test.bestScore !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Best Score</span>
                    <span className="font-medium">{test.bestScore}%</span>
                  </div>
                  <Progress value={test.bestScore} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                {test.canAttempt && (
                  <Button asChild className="flex-1">
                    <Link href={`/student/tests/${test.id}/take`}>
                      <Play className="h-4 w-4 mr-2" />
                      {test.totalAttempts === 0 ? 'Start Test' : 'Retake'}
                    </Link>
                  </Button>
                )}
                
                {test.totalAttempts > 0 && test.allowReview && test.lastAttempt && (
                  <Button variant="outline" asChild>
                    <Link href={`/student/quiz-results/${test.lastAttempt.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

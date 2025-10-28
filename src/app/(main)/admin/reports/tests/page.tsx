
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart, Users, Percent, HelpCircle, Target, Clock } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TestReport {
  id: string;
  title: string;
  description?: string;
  type: string;
  duration: number;
  passingScore: number;
  maxAttempts?: number;
  courseId: string;
  courseTitle: string;
  attemptCount: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  questionCount: number;
  createdAt: string;
}

export default function AdminTestReportsPage() {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestReports = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all tests with their courses and question counts
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select(`
            *,
            courses (
              id,
              title
            )
          `)
          .order('created_at', { ascending: false });

        if (testsError) {
          throw new Error(`Failed to fetch tests: ${testsError.message}`);
        }

        if (!testsData || testsData.length === 0) {
          setReports([]);
          return;
        }

        // Fetch all test attempts
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('test_attempts')
          .select('*');

        if (attemptsError) {
          throw new Error(`Failed to fetch test attempts: ${attemptsError.message}`);
        }

        // Get question counts for all tests
        const { data: questionCounts, error: questionError } = await supabase
          .from('test_questions')
          .select('test_id');

        if (questionError) {
          console.warn('Failed to fetch question counts:', questionError);
        }

        // Process the data to create reports
        const reportData: TestReport[] = testsData.map((test) => {
          const testAttempts = (attemptsData || []).filter(
            attempt => attempt.test_id === test.id && attempt.status === 'completed'
          );

          // Calculate statistics
          const attemptCount = testAttempts.length;
          let averageScore = 0;
          let averagePercentage = 0;
          let passRate = 0;

          if (attemptCount > 0) {
            const totalScore = testAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
            const totalPercentage = testAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
            const passedAttempts = testAttempts.filter(attempt => attempt.passed === true).length;

            averageScore = Math.round((totalScore / attemptCount) * 100) / 100;
            averagePercentage = Math.round((totalPercentage / attemptCount) * 100) / 100;
            passRate = Math.round((passedAttempts / attemptCount) * 100);
          }

          // Count questions for this test
          const questionCount = (questionCounts || []).filter(
            q => q.test_id === test.id
          ).length;

          return {
            id: test.id,
            title: test.title,
            description: test.description,
            type: test.type || 'assessment',
            duration: test.duration || 0,
            passingScore: test.passing_score || 80,
            maxAttempts: test.max_attempts,
            courseId: test.course_id,
            courseTitle: test.courses?.title || 'No Course',
            attemptCount,
            averageScore,
            averagePercentage,
            passRate,
            questionCount,
            createdAt: test.created_at
          };
        });

        setReports(reportData);
      } catch (err) {
        console.error("Failed to generate test reports:", err);
        setError(err instanceof Error ? err.message : 'Failed to generate test reports');
      } finally {
        setLoading(false);
      }
    };

    fetchTestReports();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <PageHeader title="Test Reports" description="Loading test analytics..." />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <PageHeader title="Test Reports" description="Error loading reports" />
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
      <PageHeader
        title="All Test Reports"
        description="Analyze performance across all tests on the platform."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum, report) => sum + report.attemptCount, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 
                ? Math.round(reports.reduce((sum, report) => sum + report.averagePercentage, 0) / reports.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 
                ? Math.round(reports.reduce((sum, report) => sum + report.passRate, 0) / reports.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Mobile View */}
       <div className="md:hidden">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge variant={report.type === 'final' ? 'destructive' : 'secondary'}>
                        {report.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.courseTitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{report.attemptCount} Attempts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{report.averagePercentage}% Avg.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span>{report.passRate}% Pass Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{report.questionCount} Questions</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 border-dashed border rounded-lg">
                <BarChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No tests found</h3>
                <p className="mt-1 text-sm text-muted-foreground">No tests have been created on the platform yet.</p>
             </div>
          )}
        </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Avg. Score</TableHead>
              <TableHead>Pass Rate</TableHead>
              <TableHead>Questions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    <Badge variant={report.type === 'final' ? 'destructive' : 'secondary'}>
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.courseTitle}</TableCell>
                  <TableCell>{report.attemptCount}</TableCell>
                  <TableCell>{report.averagePercentage}%</TableCell>
                  <TableCell>
                    <span className={report.passRate >= 80 ? 'text-green-600' : report.passRate >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                      {report.passRate}%
                    </span>
                  </TableCell>
                  <TableCell>{report.questionCount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

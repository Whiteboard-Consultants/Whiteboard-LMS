
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart, Users, Percent, HelpCircle } from "lucide-react";

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
import type { Test, TestAttempt, Course } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface TestReport {
  test: Test;
  attemptCount: number;
  averageScore: number;
  courseTitle?: string;
}

export default function InstructorTestReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    const fetchTestReports = async () => {
      setLoading(true);

      try {
        // Fetch tests for this instructor
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*')
          .eq('instructor_id', user.id);

        if (testsError) {
          console.error("Error fetching tests:", testsError);
          setReports([]);
          setLoading(false);
          return;
        }

        // Fetch question counts for all tests
        const testIds = (testsData || []).map(test => test.id);
        const { data: questionCounts, error: questionCountError } = await supabase
          .from('test_questions')
          .select('test_id')
          .in('test_id', testIds);

        if (questionCountError) {
          console.error("Error fetching question counts:", questionCountError);
        }

        // Count questions per test
        const questionCountMap = new Map();
        (questionCounts || []).forEach(q => {
          const currentCount = questionCountMap.get(q.test_id) || 0;
          questionCountMap.set(q.test_id, currentCount + 1);
        });

        // Map database fields to frontend format
        const tests = (testsData || []).map(test => ({
          ...test,
          instructorId: test.instructor_id,
          createdAt: test.created_at,
          courseId: test.course_id,
          questionCount: questionCountMap.get(test.id) || 0,
        })) as Test[];

        const reportPromises = tests.map(async (test) => {
          // Fetch test attempts for this test
          const { data: attemptsData, error: attemptsError } = await supabase
            .from('test_attempts')
            .select('*')
            .eq('test_id', test.id);

          if (attemptsError) {
            console.error(`Error fetching attempts for test ${test.id}:`, attemptsError);
            return {
              test,
              attemptCount: 0,
              averageScore: 0,
              courseTitle: 'N/A',
            };
          }

          const attempts = attemptsData || [];
          const totalScore = attempts.reduce((sum: number, attempt: any) => sum + (attempt.score || 0), 0);
          const averageScore = attempts.length > 0 ? parseFloat((totalScore / attempts.length).toFixed(2)) : 0;
          
          let courseTitle = 'N/A';
          if (test.courseId) {
            const { data: courseData, error: courseError } = await supabase
              .from('courses')
              .select('title')
              .eq('id', test.courseId)
              .single();

            if (!courseError && courseData) {
              courseTitle = courseData.title;
            }
          }

          return {
            test,
            attemptCount: attempts.length,
            averageScore,
            courseTitle,
          };
        });

        const reportData = await Promise.all(reportPromises);
        setReports(reportData);
      } catch (error) {
        console.error("Failed to generate test reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestReports();
  }, [user]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Test Reports" description="Loading..." />
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/instructor/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
      <PageHeader
        title="Your Test Reports"
        description="Analyze performance across all your created tests."
      />

       {/* Mobile View */}
       <div className="md:hidden">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.test.id}>
                  <CardHeader>
                    <CardTitle>{report.test.title}</CardTitle>
                    {report.courseTitle !== 'N/A' && <p className="text-sm text-muted-foreground">{report.courseTitle}</p>}
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{report.attemptCount} Attempts</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span>{report.averageScore.toFixed(2)} Avg. Score</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{report.test.questionCount} Questions</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 border-dashed border rounded-lg">
                <BarChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No tests found</h3>
                <p className="mt-1 text-sm text-muted-foreground">You have not created any tests yet.</p>
             </div>
          )}
        </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Linked Course</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Avg. Score</TableHead>
              <TableHead>Total Questions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report.test.id}>
                  <TableCell className="font-medium">{report.test.title}</TableCell>
                  <TableCell>{report.courseTitle}</TableCell>
                  <TableCell>{report.attemptCount}</TableCell>
                  <TableCell>{report.averageScore.toFixed(2)}</TableCell>
                  <TableCell>{report.test.questionCount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  You have not created any tests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

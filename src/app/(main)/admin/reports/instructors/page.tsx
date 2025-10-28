
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Star, Percent, User as UserIcon, Award, TrendingUp, Target } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InstructorReport {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageRating: number;
  completionRate: number;
  totalRevenue: number;
  activeStudents: number;
  joinedAt: string;
}

export default function InstructorReportsPage() {
  const [reports, setReports] = useState<InstructorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorReports = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch all instructors (filter by status if column exists)
        const { data: instructorsData, error: instructorsError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'instructor')
          .order('name');

        if (instructorsError) {
          throw new Error(`Failed to fetch instructors: ${instructorsError.message}`);
        }

        if (!instructorsData || instructorsData.length === 0) {
          setReports([]);
          return;
        }

        // 2. Fetch all courses with instructor information
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');

        if (coursesError) {
          throw new Error(`Failed to fetch courses: ${coursesError.message}`);
        }

        // 3. Fetch all enrollments (filter by status if column exists)
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*');

        if (enrollmentsError) {
          throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`);
        }

        // 4. Process data for each instructor
        const reportData: InstructorReport[] = instructorsData.map((instructor) => {
          // Find courses by this instructor
          const instructorCourses = (coursesData || []).filter(
            course => course.instructor_id === instructor.id
          );

          // Find enrollments for instructor's courses
          const courseIds = instructorCourses.map(course => course.id);
          const instructorEnrollments = (enrollmentsData || []).filter(
            enrollment => courseIds.includes(enrollment.course_id)
          );

          // Calculate metrics
          const totalCourses = instructorCourses.length;
          const totalEnrollments = instructorEnrollments.length;
          const completedEnrollments = instructorEnrollments.filter(
            enrollment => enrollment.completed === true || enrollment.progress === 100
          ).length;
          const completionRate = totalEnrollments > 0 
            ? Math.round((completedEnrollments / totalEnrollments) * 100) 
            : 0;

          // Calculate average rating (use available rating field or default to 0)
          const coursesWithRatings = instructorCourses.filter(course => course.rating && course.rating > 0);
          const averageRating = coursesWithRatings.length > 0
            ? Math.round((coursesWithRatings.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesWithRatings.length) * 10) / 10
            : 0;

          // Calculate total students (unique enrollments)
          const uniqueStudents = new Set(instructorEnrollments.map(e => e.user_id));
          const totalStudents = uniqueStudents.size;

          // Calculate active students (recent activity)
          const activeStudents = instructorEnrollments.filter(
            enrollment => {
              if (!enrollment.last_accessed_at) return false;
              const lastAccess = new Date(enrollment.last_accessed_at);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return lastAccess > thirtyDaysAgo;
            }
          ).length;

          // Calculate total revenue (if pricing data available)
          const totalRevenue = instructorCourses.reduce((sum, course) => {
            const courseEnrollments = instructorEnrollments.filter(e => e.course_id === course.id);
            return sum + (courseEnrollments.length * (course.price || 0));
          }, 0);

          return {
            id: instructor.id,
            name: instructor.name || instructor.email,
            email: instructor.email,
            avatar_url: instructor.avatar_url,
            totalCourses,
            totalStudents,
            totalEnrollments,
            completedEnrollments,
            averageRating,
            completionRate,
            totalRevenue,
            activeStudents,
            joinedAt: instructor.created_at
          };
        });

        // Sort by total students descending
        reportData.sort((a, b) => b.totalStudents - a.totalStudents);
        setReports(reportData);

      } catch (err) {
        console.error("Failed to generate instructor reports:", err);
        setError(err instanceof Error ? err.message : 'Failed to generate instructor reports');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorReports();
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
        <PageHeader title="Instructor Reports" description="Loading instructor analytics..." />
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
        <PageHeader title="Instructor Reports" description="Error loading reports" />
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
        title="Instructor Reports"
        description="Evaluate instructor performance and engagement across the platform."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum, report) => sum + report.totalStudents, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum, report) => sum + report.totalCourses, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.length > 0 
                ? Math.round(reports.reduce((sum, report) => sum + report.completionRate, 0) / reports.length)
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
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={report.avatar_url || ''} alt={report.name} />
                            <AvatarFallback>{report.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="text-lg">{report.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{report.email}</p>
                        </div>
                        {report.averageRating > 0 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            {report.averageRating}
                          </Badge>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{report.totalCourses} Courses</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{report.totalStudents} Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>{report.completionRate}% Completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{report.activeStudents} Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center py-12 border-dashed border rounded-lg">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No instructors found</h3>
                <p className="mt-1 text-sm text-muted-foreground">No active instructors to generate reports for.</p>
             </div>
          )}
        </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instructor</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Active Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={report.avatar_url || ''} alt={report.name} />
                        <AvatarFallback>{report.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{report.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{report.totalCourses}</TableCell>
                  <TableCell>{report.totalStudents}</TableCell>
                  <TableCell>
                    {report.averageRating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{report.averageRating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No ratings</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={report.completionRate >= 80 ? 'text-green-600' : report.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                      {report.completionRate}%
                    </span>
                  </TableCell>
                  <TableCell>{report.activeStudents}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No instructors found to generate reports for.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

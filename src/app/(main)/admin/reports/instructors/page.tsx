
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Star, Percent, User as UserIcon, Award, TrendingUp, Target, DollarSign } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getInstructorReports } from './data-actions';
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
  const [totalPlatformRevenue, setTotalPlatformRevenue] = useState(0);

  useEffect(() => {
    const fetchInstructorReports = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use server action to fetch instructor reports
        const result = await getInstructorReports();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch instructor reports');
        }

        setReports(result.data || []);
        setTotalPlatformRevenue(result.totalPlatformRevenue || 0);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
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
      <div className="grid gap-4 md:grid-cols-5 mb-6">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalPlatformRevenue.toLocaleString()}
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
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Revenue (at {report.commissionPercentage}% commission)</span>
                        <span className="font-semibold">₹{report.totalRevenue.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on {report.totalEnrollments} enrollment{report.totalEnrollments !== 1 ? 's' : ''} × {report.commissionPercentage}% commission
                      </p>
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
              <TableHead>Revenue</TableHead>
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
                  <TableCell className="font-semibold">₹{report.totalRevenue.toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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

'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Users, TrendingUp, Award } from "lucide-react";

import { getCommissionReports } from './data-actions';
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

interface CommissionReport {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  totalEnrollments: number;
  paidEnrollments: number;
  totalCommission: number;
  commissionPercentage: number;
  courses: number;
}

export default function CommissionReportsPage() {
  const [reports, setReports] = useState<CommissionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCommissionToPay, setTotalCommissionToPay] = useState(0);

  useEffect(() => {
    const fetchCommissionReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getCommissionReports();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch commission reports');
        }

        setReports(result.data || []);
        setTotalCommissionToPay(result.totalCommissionToPay || 0);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionReports();
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
        <PageHeader title="Commission Reports" description="Loading commission analytics..." />
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
        <PageHeader title="Commission Reports" description="Error loading reports" />
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
        title="Instructor Commission Reports" 
        description="View total commission payable to each instructor based on their course enrollments and commission rates."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission to Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalCommissionToPay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum, report) => sum + report.paidEnrollments, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Commission/Instructor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{reports.length > 0 ? Math.round(totalCommissionToPay / reports.length).toLocaleString('en-IN') : '0'}
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
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Courses</p>
                      <p className="text-lg font-semibold">{report.courses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Enrollments</p>
                      <p className="text-lg font-semibold">{report.paidEnrollments}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Commission Rate</p>
                      <Badge variant="secondary">{report.commissionPercentage}%</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Commission to Pay</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        ₹{report.totalCommission.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-dashed border rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No instructors found</h3>
            <p className="mt-1 text-sm text-muted-foreground">No active instructors with commission to display.</p>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instructor</TableHead>
              <TableHead className="text-center">Courses</TableHead>
              <TableHead className="text-center">Paid Enrollments</TableHead>
              <TableHead className="text-center">Commission Rate</TableHead>
              <TableHead className="text-right">Total Commission</TableHead>
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
                  <TableCell className="text-center">{report.courses}</TableCell>
                  <TableCell className="text-center">{report.paidEnrollments}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{report.commissionPercentage}%</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    ₹{report.totalCommission.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No instructors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Check, X, Clock, Calendar, User, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getCertificateRequests, getApprovedCertificates, rejectCertificate } from '@/app/student/certificate-actions';
import { approveCertificate } from '@/app/admin/actions';

interface CertificateData {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  certificate_status: string;
  certificate_requested_at?: string;
  certificate_approved_at?: string;
  users: {
    id: string;
    name: string;
    email: string;
  };
  courses: {
    id: string;
    title: string;
    image_url?: string;
  };
}

export default function AdminCertificatesPage() {
  const [pendingRequests, setPendingRequests] = useState<CertificateData[]>([]);
  const [approvedCertificates, setApprovedCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [pendingResult, approvedResult] = await Promise.all([
        getCertificateRequests(),
        getApprovedCertificates()
      ]);

      if (pendingResult.success) {
        setPendingRequests(pendingResult.data as CertificateData[]);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: pendingResult.error });
      }

      if (approvedResult.success) {
        setApprovedCertificates(approvedResult.data as CertificateData[]);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: approvedResult.error });
      }
    } catch (error) {
      console.error('Error fetching certificate data:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load certificate data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    setProcessingId(enrollmentId);
    try {
      const result = await approveCertificate(enrollmentId);
      if (result.success) {
        toast({ title: 'Success', description: 'Certificate approved successfully!' });
        await fetchData(); // Refresh data
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch (error) {
      console.error('Error approving certificate:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve certificate.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    setProcessingId(enrollmentId);
    try {
      const result = await rejectCertificate(enrollmentId, 'Certificate request rejected by admin');
      if (result.success) {
        toast({ title: 'Success', description: 'Certificate request rejected.' });
        await fetchData(); // Refresh data
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch (error) {
      console.error('Error rejecting certificate:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject certificate.' });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Certificate Management"
          description="Manage course completion certificates and approvals."
        />
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate Management"
        description="Manage course completion certificates and approvals."
      />

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Approved Certificates ({approvedCertificates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground text-center">
                  There are no certificate requests waiting for approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {request.courses.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {request.users.name} ({request.users.email})
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Requested: {format(new Date(request.certificate_requested_at!), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{request.users.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.users.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Progress: {request.progress}% • {request.completed ? 'Course Completed' : 'In Progress'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedCertificates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Approved Certificates</h3>
                <p className="text-muted-foreground text-center">
                  No certificates have been approved yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedCertificates.map((certificate) => (
                <Card key={certificate.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          {certificate.courses.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {certificate.users.name} ({certificate.users.email})
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Approved: {format(new Date(certificate.certificate_approved_at!), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{certificate.users.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{certificate.users.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Course completed with {certificate.progress}% progress
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Award, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Enrollment, Course, User as UserType } from "@/types";
import { approveCertificate } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

interface DetailedEnrollment extends Enrollment {
    courseTitle: string;
    studentName: string;
    studentEmail: string;
}

export default function CertificateRequestsPage() {
  const [requests, setRequests] = useState<DetailedEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    const q = query(collection(db, "enrollments"), where("certificateStatus", "==", "requested"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const enrollments = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Enrollment));
        
        const detailedRequests: DetailedEnrollment[] = await Promise.all(enrollments.map(async (req) => {
            const courseRef = doc(db, 'courses', req.courseId);
            const userRef = doc(db, 'users', req.userId);

            const [courseSnap, userSnap] = await Promise.all([getDoc(courseRef), getDoc(userRef)]);
            
            const course = courseSnap.exists() ? courseSnap.data() as Course : null;
            const user = userSnap.exists() ? userSnap.data() as UserType : null;

            return {
                ...req,
                courseTitle: course?.title || 'Unknown Course',
                studentName: user?.name || 'Unknown Student',
                studentEmail: user?.email || 'N/A'
            };
        }));
        
        setRequests(detailedRequests);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching certificate requests:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load certificate requests.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleApprove = async (enrollmentId: string) => {
    setUpdatingId(enrollmentId);
    const result = await approveCertificate(enrollmentId);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setUpdatingId(null);
  };

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
        title="Certificate Requests"
        description="Review and approve certificate requests from students who have completed their courses."
      />
      
      {/* Mobile View */}
       <div className="md:hidden">
         {loading ? (
             <p>Loading...</p>
         ) : requests.length > 0 ? (
             <div className="space-y-4">
                 {requests.map(req => (
                     <Card key={req.id}>
                         <CardHeader>
                             <CardTitle className="text-lg">{req.studentName}</CardTitle>
                             <p className="text-sm text-muted-foreground">{req.courseTitle}</p>
                         </CardHeader>
                         <CardContent>
                             <div className="mb-4">
                                <p className="text-sm">Email: {req.studentEmail}</p>
                                <p className="text-sm">Completed: {format(new Date(req.enrolledAt as string), 'dd MMM yyyy')}</p>
                             </div>
                             <Button size="sm" onClick={() => handleApprove(req.id)} disabled={updatingId === req.id} className="w-full">
                                {updatingId === req.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Approve Certificate
                             </Button>
                         </CardContent>
                     </Card>
                 ))}
             </div>
         ) : (
             <div className="text-center py-12 border-dashed border rounded-lg">
                <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No pending requests</h3>
                <p className="mt-1 text-sm text-muted-foreground">All certificate requests have been processed.</p>
             </div>
         )}
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Completion Date</TableHead>
              <TableHead>Avg. Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                      <p className="font-medium">{req.studentName}</p>
                      <p className="text-xs text-muted-foreground">{req.studentEmail}</p>
                  </TableCell>
                  <TableCell>{req.courseTitle}</TableCell>
                  <TableCell>{format(new Date(req.enrolledAt as string), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{req.averageScore?.toFixed(2) ?? 'N/A'}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(req.id)}
                      disabled={updatingId === req.id}
                    >
                        {updatingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No pending certificate requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

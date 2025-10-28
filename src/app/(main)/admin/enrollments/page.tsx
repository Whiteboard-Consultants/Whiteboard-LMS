
'use client';

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Calendar, User, ArrowLeft } from "lucide-react";
import type { Enrollment } from "@/types";
import { approveEnrollment, rejectEnrollment } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientProgress } from "@/components/ui/gradient-progress";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function AdminEnrollmentsPage() {
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);
  const [approvedEnrollments, setApprovedEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        setLoading(false);
        setPendingEnrollments([]);
        setApprovedEnrollments([]);
        return;
    }

    const fetchEnrollments = async (status: 'pending' | 'approved', setter: React.Dispatch<React.SetStateAction<Enrollment[]>>) => {
        try {
            // First, fetch the enrollments
            const { data: enrollments, error } = await supabase
                .from('enrollments')
                .select('*')
                .eq('status', status);

            if (error) {
                console.error(`Error fetching ${status} enrollments:`, error);
                toast({ variant: 'destructive', title: 'Error', description: `Failed to load ${status} enrollments.`});
                setLoading(false);
                return;
            }

            if (!enrollments || enrollments.length === 0) {
                setter([]);
                setLoading(false);
                return;
            }

            // Get unique user IDs and course IDs for batch fetching
            const userIds = Array.from(new Set(enrollments.map(e => e.user_id).filter(Boolean)));
            const courseIds = Array.from(new Set(enrollments.map(e => e.course_id).filter(Boolean)));
            const instructorIds = Array.from(new Set(enrollments.map(e => e.instructor_id).filter(Boolean)));

            // Fetch users data (combine student and instructor IDs)
            const allUserIds = Array.from(new Set([...userIds, ...instructorIds]));
            const { data: users } = await supabase
                .from('users')
                .select('id, name')
                .in('id', allUserIds);

            // Fetch courses data
            const { data: courses } = await supabase
                .from('courses')
                .select('id, title, price')
                .in('id', courseIds);

            // Create lookup maps
            const usersMap = new Map(users?.map(u => [u.id, u]) || []);
            const coursesMap = new Map(courses?.map(c => [c.id, c]) || []);

            // Map database fields to expected interface fields
            const mappedEnrollments = enrollments.map((enrollment: any) => ({
                id: enrollment.id,
                userId: enrollment.user_id,
                courseId: enrollment.course_id,
                instructorId: enrollment.instructor_id,
                progress: enrollment.progress || 0,
                completed: enrollment.completed || false,
                enrolledAt: enrollment.enrolled_at || enrollment.created_at,
                status: enrollment.status,
                paymentId: enrollment.payment_id,
                orderId: enrollment.order_id,
                amount: enrollment.amount,
                purchaseDate: enrollment.purchase_date,
                completedLessons: enrollment.completed_lessons || [],
                certificateStatus: enrollment.certificate_status,
                averageScore: enrollment.average_score,
                couponCode: enrollment.coupon_code,
                // Derived fields from lookups
                studentName: usersMap.get(enrollment.user_id)?.name || 'Unknown Student',
                courseTitle: coursesMap.get(enrollment.course_id)?.title || 'Unknown Course',
                coursePrice: coursesMap.get(enrollment.course_id)?.price || 0,
                instructorName: usersMap.get(enrollment.instructor_id)?.name || 'Unknown Instructor'
            }));

            setter(mappedEnrollments);
            setLoading(false);

            // Set up real-time subscription
            const subscription = supabase
                .channel(`enrollments_${status}`)
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'enrollments',
                        filter: `status=eq.${status}`
                    }, 
                    async (payload) => {
                        // Refetch data when changes occur - reuse the same fetching logic
                        await fetchEnrollments(status, setter);
                    }
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        } catch (error) {
            console.error(`Error setting up ${status} enrollments subscription:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Failed to load ${status} enrollments.`});
            setLoading(false);
        }
    };

    const setupSubscriptions = async () => {
        const unsubPending = await fetchEnrollments('pending', setPendingEnrollments);
        const unsubApproved = await fetchEnrollments('approved', setApprovedEnrollments);

        return () => {
            if (unsubPending) unsubPending();
            if (unsubApproved) unsubApproved();
        };
    };

    let cleanup: (() => void) | undefined;
    setupSubscriptions().then(cleanupFn => {
        cleanup = cleanupFn;
    });

    return () => {
        if (cleanup) cleanup();
    };
  }, [toast, user]);

  const handleApprove = async (enrollmentId: string) => {
    setUpdatingId(enrollmentId);
    const result = await approveEnrollment(enrollmentId);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setUpdatingId(null);
  };

  const handleReject = async (enrollmentId: string) => {
    setUpdatingId(enrollmentId);
    const result = await rejectEnrollment(enrollmentId);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
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
        title="Enrollment Management"
        description="Review pending requests and view approved course enrollments."
      />
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved Enrollments</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {/* Mobile View for Pending */}
           <div className="md:hidden">
             {loading ? (
                 <p>Loading...</p>
             ) : pendingEnrollments.length > 0 ? (
                 <div className="space-y-4">
                     {pendingEnrollments.map(req => (
                         <Card key={req.id}>
                             <CardHeader>
                                 <CardTitle className="text-lg">{req.studentName}</CardTitle>
                                 <p className="text-sm text-muted-foreground">{req.courseTitle}</p>
                             </CardHeader>
                             <CardContent>
                                 <div className="flex justify-between items-center mb-4">
                                     <p className="font-semibold">₹{req.coursePrice?.toFixed(2) ?? 'N/A'}</p>
                                     <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                         <Calendar className="h-4 w-4" />
                                         {new Date(req.enrolledAt as string).toLocaleDateString()}
                                     </div>
                                 </div>
                                 <div className="flex justify-end gap-2">
                                     {updatingId === req.id ? (
                                         <Loader2 className="h-6 w-6 animate-spin" />
                                     ) : (
                                         <>
                                             <Button variant="outline" size="sm" onClick={() => handleReject(req.id)}>
                                                 <XCircle className="mr-2 h-4 w-4" /> Reject
                                             </Button>
                                             <Button size="sm" onClick={() => handleApprove(req.id)}>
                                                 <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                             </Button>
                                         </>
                                     )}
                                 </div>
                             </CardContent>
                         </Card>
                     ))}
                 </div>
             ) : (
                 <div className="text-center py-12">
                     <p>No pending enrollment requests.</p>
                 </div>
             )}
          </div>

          {/* Desktop View for Pending */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : pendingEnrollments.length > 0 ? (
                  pendingEnrollments.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.studentName}</TableCell>
                      <TableCell>{req.courseTitle}</TableCell>
                      <TableCell>₹{req.coursePrice?.toFixed(2) ?? 'N/A'}</TableCell>
                      <TableCell>{new Date(req.enrolledAt as string).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {updatingId === req.id ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(req.id)}>
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleReject(req.id)}>
                              <XCircle className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No pending enrollment requests.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="approved">
            {/* Mobile View for Approved */}
            <div className="md:hidden">
              {loading ? (
                  <p>Loading...</p>
              ) : approvedEnrollments.length > 0 ? (
                  <div className="space-y-4">
                      {approvedEnrollments.map(req => (
                          <Card key={req.id}>
                              <CardHeader>
                                  <CardTitle className="text-lg">{req.studentName}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{req.courseTitle}</p>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <User className="h-4 w-4" /> {req.instructorName}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                     <Calendar className="h-4 w-4" /> {new Date(req.enrolledAt as string).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                                    <GradientProgress value={req.progress} />
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-12">
                      <p>No approved enrollments found.</p>
                  </div>
              )}
            </div>

            {/* Desktop View for Approved */}
            <div className="hidden md:block rounded-lg border">
              <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrolled On</TableHead>
                    <TableHead>Progress</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        Loading...
                        </TableCell>
                    </TableRow>
                    ) : approvedEnrollments.length > 0 ? (
                    approvedEnrollments.map((req) => (
                        <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.studentName}</TableCell>
                        <TableCell>{req.courseTitle}</TableCell>
                        <TableCell>{req.instructorName}</TableCell>
                        <TableCell>{new Date(req.enrolledAt as string).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <GradientProgress value={req.progress} className="w-40" />
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        No approved enrollments found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

      
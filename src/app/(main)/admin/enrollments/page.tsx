
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
import { fetchEnrollmentsByStatus } from "./actions";

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

    const subscriptions: { unsubscribe: () => Promise<void> }[] = [];
    let isMounted = true;

    const setupSubscription = async (status: 'pending' | 'approved', setter: React.Dispatch<React.SetStateAction<Enrollment[]>>) => {
        if (!isMounted) return;

        try {
            // Fetch enrollments using server action (bypasses RLS)
            const result = await fetchEnrollmentsByStatus(status);

            if (!result.success) {
                console.error(`Error fetching ${status} enrollments:`, result.error);
                if (isMounted) {
                    toast({ variant: 'destructive', title: 'Error', description: `Failed to load ${status} enrollments.`});
                }
                return;
            }

            if (isMounted) {
                setter(result.data);
            }

            // Set up real-time subscription
            if (isMounted) {
                try {
                    // Use unique channel name with timestamp to avoid conflicts
                    const channelName = `enrollments_${status}_${Date.now()}`;
                    const channel = supabase.channel(channelName, {
                        config: {
                            presence: {
                                key: `${status}_${Date.now()}`,
                            },
                        },
                    });

                    channel.on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'enrollments',
                            filter: `status=eq.${status}`,
                        },
                        async (payload) => {
                            if (!isMounted) return;
                            // Refetch data when changes occur
                            const refreshResult = await fetchEnrollmentsByStatus(status);
                            if (refreshResult.success && isMounted) {
                                setter(refreshResult.data);
                            }
                        }
                    );

                    channel.subscribe((status, err) => {
                        if (err) {
                            console.warn(`Subscription status for ${status} enrollments:`, status, err);
                        }
                    });

                    subscriptions.push(channel);
                } catch (subError) {
                    console.error(`Error subscribing to ${status} enrollments:`, subError);
                }
            }
        } catch (error) {
            console.error(`Error setting up ${status} enrollments:`, error);
            if (isMounted) {
                toast({ variant: 'destructive', title: 'Error', description: `Failed to load ${status} enrollments.`});
            }
        }
    };

    const init = async () => {
        if (!isMounted) return;
        setLoading(true);
        
        // Set up both subscriptions sequentially
        await setupSubscription('pending', setPendingEnrollments);
        if (isMounted) {
            await setupSubscription('approved', setApprovedEnrollments);
        }
        
        if (isMounted) {
            setLoading(false);
        }
    };

    init();

    return () => {
        isMounted = false;
        // Cleanup all subscriptions
        subscriptions.forEach(sub => {
            sub.unsubscribe().catch(err => {
                console.warn('Error unsubscribing:', err);
            });
        });
    };
  }, [user]);

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

      
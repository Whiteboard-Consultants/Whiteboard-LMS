
'use client';

import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, query, where, getDoc, getDocs, doc } from "firebase/firestore";
import { format } from "date-fns";
import Link from "next/link";
import { db } from "@/lib/firebase-compat";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, BookOpen, Trash2, MoreVertical, Calendar, AlertCircle, PlayCircle, User, ArrowLeft } from "lucide-react";
import type { RegistrationRequest, User as UserType, Enrollment, Course } from "@/types";
import { approveUser, rejectUser, revokeCourseAccess, deleteUser, suspendUser, reinstateUser } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentProfile } from "@/components/student-profile";
import { useAuth } from '@/hooks/use-auth';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface UserWithEnrollments extends UserType {
    enrollments: (Enrollment & { courseTitle: string; status: 'pending' | 'approved' })[];
}

export default function AdminUsersPage() {
  const [pendingRegistrations, setPendingRegistrations] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithEnrollments | null>(null);
  const [viewingProfileUser, setViewingProfileUser] = useState<UserType | null>(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    const unsubRequests = onSnapshot(collection(db, "registrationRequests"), (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date?.toDate() ? format(doc.data().date.toDate(), 'dd MMM yyyy') : 'N/A'
      })) as RegistrationRequest[];
      setPendingRegistrations(requests);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserType));
        setUsers(usersData);
        setLoading(false);
    });

    return () => {
        unsubRequests();
        unsubUsers();
    };
  }, [authUser]);

  const handleAction = useCallback(async (action: (userId: string) => Promise<{success: boolean, message?: string, error?: string}>, userId: string, successMessage: string, errorMessage: string) => {
      setUpdatingId(userId);
      const result = await action(userId);
       if (result.success) {
        toast({ title: "Success", description: result.message || successMessage });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || errorMessage });
      }
      setUpdatingId(null);
  }, [toast]);

  const handleApprove = (userId: string) => handleAction(approveUser, userId, "User approved.", "Failed to approve user.");
  const handleReject = (userId: string) => handleAction(rejectUser, userId, "User rejected.", "Failed to reject user.");
  const handleSuspend = (userId: string) => handleAction(suspendUser, userId, "User suspended.", "Failed to suspend user.");
  const handleReinstate = (userId: string) => handleAction(reinstateUser, userId, "User reinstated.", "Failed to reinstate user.");

  const handleManageEnrollments = async (user: UserType) => {
    const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', user.id));
    const enrollmentsSnap = await getDocs(enrollmentsQuery);
    
    const detailedEnrollments = await Promise.all(
        enrollmentsSnap.docs.map(async (enrollmentDoc) => {
            const enrollmentData = { ...enrollmentDoc.data(), id: enrollmentDoc.id } as Enrollment;
            const courseRef = doc(db, 'courses', enrollmentData.courseId);
            const courseSnap = await getDoc(courseRef);
            const courseTitle = courseSnap.exists() ? (courseSnap.data() as Course).title : 'Unknown Course';
            return { ...enrollmentData, courseTitle, status: enrollmentData.status };
        })
    );

    setSelectedUser({ ...user, enrollments: detailedEnrollments });
    setIsEnrollmentModalOpen(true);
  };
  
   const handleViewProfile = (user: UserType) => {
    setViewingProfileUser(user);
    setIsProfileModalOpen(true);
  };

  const handleRevokeAccess = async (enrollmentId: string) => {
      setIsDeleting(enrollmentId);
      const result = await revokeCourseAccess(enrollmentId);
      if (result.success) {
          toast({ title: "Success", description: "Course access revoked." });
          if(selectedUser) {
              const updatedEnrollments = selectedUser.enrollments.filter(e => e.id !== enrollmentId);
              setSelectedUser({...selectedUser, enrollments: updatedEnrollments});
          }
      } else {
          toast({ variant: 'destructive', title: "Error", description: result.error });
      }
      setIsDeleting(null);
  }

  const handleDeleteUser = async (userId: string) => {
    setUpdatingId(userId);
    const result = await deleteUser(userId);
    if (result.success) {
        toast({ title: "Success", description: "User has been deleted." });
    } else {
        toast({ variant: 'destructive', title: "Error", description: result.error });
    }
    setUpdatingId(null);
  }

  const UserActions = ({ user }: { user: UserType }) => (
    <AlertDialog>
       <DropdownMenu>
           <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="h-8 w-8 p-0">
                   <span className="sr-only">Open menu</span>
                   <MoreVertical className="h-4 w-4" />
               </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
                {user.role === 'student' && (
                    <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                        <User className="mr-2 h-4 w-4" /> View Profile
                    </DropdownMenuItem>
                 )}
               <DropdownMenuItem onClick={() => handleManageEnrollments(user)}>
                   <BookOpen className="mr-2 h-4 w-4" /> Manage Enrollments
               </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.status === 'suspended' ? (
                     <DropdownMenuItem onClick={() => handleReinstate(user.id)} className="text-green-600 focus:text-green-700 focus:bg-green-100">
                        <PlayCircle className="mr-2 h-4 w-4" /> Reinstate User
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => handleSuspend(user.id)} className="text-yellow-600 focus:text-yellow-700 focus:bg-yellow-100">
                        <AlertCircle className="mr-2 h-4 w-4" /> Suspend User
                    </DropdownMenuItem>
                )}
               <AlertDialogTrigger asChild>
                   <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-red-800/30 dark:text-red-400 dark:focus:text-red-400">
                       <Trash2 className="mr-2 h-4 w-4" />
                       Delete User
                   </DropdownMenuItem>
               </AlertDialogTrigger>
           </DropdownMenuContent>
       </DropdownMenu>
       <AlertDialogContent>
           <AlertDialogHeader>
               <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
               <AlertDialogDescription>
                   This action cannot be undone. This will permanently delete the user&apos;s data and un-enroll them from all courses, but their authentication record will remain.
               </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction
                   onClick={() => handleDeleteUser(user.id)}
                   disabled={updatingId === user.id}
                   className="bg-destructive hover:bg-destructive/90"
               >
                   {updatingId === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   Continue
               </AlertDialogAction>
           </AlertDialogFooter>
       </AlertDialogContent>
    </AlertDialog>
 );

  const getStatusBadge = (status: UserType['status']) => {
    switch (status) {
        case 'approved':
            return <Badge variant="secondary">Approved</Badge>;
        case 'pending':
            return <Badge variant="outline">Pending</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        case 'suspended':
            return <Badge variant="destructive" className="bg-yellow-500 text-white">Suspended</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
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
        title="User Management"
        description="Approve new registrations and manage all users on the platform."
      />
      
       <Tabs defaultValue="all-users">
        <TabsList className="mb-4">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="requests">Registration Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="all-users">
            {/* Mobile View */}
            <div className="md:hidden">
              {loading ? <p>Loading...</p> : users.length > 0 ? (
                <div className="space-y-4">
                  {users.map(user => (
                    <Card key={user.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{user.name}</CardTitle>
                                {updatingId === user.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserActions user={user} />}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <Badge variant="outline">{user.role}</Badge>
                            {getStatusBadge(user.status)}
                        </CardContent>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-center py-12">No users found.</p>}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
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
                    ) : users.length > 0 ? (
                    users.map((user) => (
                        <TableRow key={user.id} className={cn(user.status === 'suspended' && 'bg-yellow-50 hover:bg-yellow-100')}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell className="text-right">
                                {updatingId === user.id ? <Loader2 className="h-4 w-4 animate-spin ml-auto" /> : <UserActions user={user} />}
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        No users found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </TabsContent>
        <TabsContent value="requests">
             {/* Mobile View */}
             <div className="md:hidden">
              {loading ? <p>Loading...</p> : pendingRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {pendingRegistrations.map(req => (
                    <Card key={req.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{req.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{req.email}</p>
                        </CardHeader>
                        <CardContent>
                           <div className="flex justify-between items-center mb-4">
                               <Badge variant={req.role === 'instructor' ? 'secondary' : 'outline'}>{req.role}</Badge>
                               <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                   <Calendar className="h-4 w-4" /> {req.date}
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
              ) : <p className="text-center py-12">No pending registration requests.</p>}
            </div>

             {/* Desktop View */}
             <div className="hidden md:block rounded-lg border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
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
                    ) : pendingRegistrations.length > 0 ? (
                        pendingRegistrations.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.name}</TableCell>
                            <TableCell>{req.email}</TableCell>
                            <TableCell>
                            <Badge variant={req.role === 'instructor' ? 'secondary' : 'outline'}>
                                {req.role}
                            </Badge>
                            </TableCell>
                            <TableCell>{req.date}</TableCell>
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
                            No pending registration requests.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>
       </Tabs>

      <Dialog open={isEnrollmentModalOpen} onOpenChange={setIsEnrollmentModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Manage Enrollments for {selectedUser?.name}</DialogTitle>
                <DialogDescription>
                    View and revoke access to enrolled courses for this user.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-96 overflow-y-auto">
                {selectedUser?.enrollments && selectedUser.enrollments.length > 0 ? (
                    <ul className="space-y-3">
                        {selectedUser.enrollments.map(enrollment => (
                            <li key={enrollment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-semibold">{enrollment.courseTitle}</p>
                                    <p className="text-sm text-muted-foreground">Enrolled: {format(enrollment.enrolledAt.toDate(), 'dd MMM yyyy')}</p>
                                    <Badge variant={enrollment.status === 'approved' ? 'secondary' : 'default'} className="mt-1">{enrollment.status}</Badge>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={isDeleting === enrollment.id}>
                                            {isDeleting === enrollment.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will un-enroll the student from this course. They will lose all access and progress. This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRevokeAccess(enrollment.id)}>
                                                Continue
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground py-8">This student is not enrolled in any courses.</p>
                )}
            </div>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Student Profile: {viewingProfileUser?.name}</DialogTitle>
            </DialogHeader>
             {viewingProfileUser && <StudentProfile user={viewingProfileUser} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

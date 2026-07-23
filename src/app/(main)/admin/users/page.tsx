'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { authenticatedFetch } from "@/lib/auth-fetch";
import { sendPasswordResetEmail, setTemporaryPassword, fetchUserEnrollments, deleteUserEnrollment, approveUser, rejectUser, suspendUser, reinstateUser } from './actions';
import { getAllUsers, getPendingUsers } from './data-actions';
import { PageHeader } from "@/components/page-header";
import { convertToDate } from "@/lib/date-utils";
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
import { CheckCircle, XCircle, Loader2, BookOpen, Trash2, MoreVertical, Calendar, AlertCircle, PlayCircle, User, ArrowLeft, Plus, Key, Shield, ArrowUp, ArrowDown } from "lucide-react";
import type { User as UserType, Enrollment, Course } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { ManagerPermissionsFields } from "@/components/admin/manager-permissions-fields";
import {
  MANAGER_PERMISSION_CATALOG,
  normalizeManagerPermissions,
  type PermissionKey,
} from "@/lib/permissions";
import type { ManagerPermission } from "@/types";

interface UserWithEnrollments extends UserType {
    enrollments: (Enrollment & { courseTitle: string; status: 'pending' | 'approved'; enrollmentType?: 'course' | 'test' | 'series' })[];
}

interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  date: string;
  status: 'pending';
}

const newUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['student', 'instructor', 'admin', 'manager']),
  status: z.enum(['pending', 'approved']),
  phone: z.string().optional(),
});

type NewUserFormData = z.infer<typeof newUserSchema>;

function permissionsToMode(permissions?: ManagerPermission[] | null): 'all' | 'custom' {
  if (!permissions || permissions.includes('*')) return 'all';
  return 'custom';
}

function permissionsToSelected(permissions?: ManagerPermission[] | null): PermissionKey[] {
  if (!permissions || permissions.includes('*')) {
    return MANAGER_PERMISSION_CATALOG.map((p) => p.key);
  }
  return permissions.filter((p): p is PermissionKey => p !== '*');
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get('role');
  const initialTab = searchParams.get('tab') === 'requests' ? 'requests' : 'all-users';

  const [pendingRegistrations, setPendingRegistrations] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithEnrollments | null>(null);
  const [viewingProfileUser, setViewingProfileUser] = useState<UserType | null>(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [permissionMode, setPermissionMode] = useState<'all' | 'custom'>('all');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>(
    MANAGER_PERMISSION_CATALOG.map((p) => p.key)
  );
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<UserType | null>(null);
  const [editPermissionMode, setEditPermissionMode] = useState<'all' | 'custom'>('all');
  const [editSelectedPermissions, setEditSelectedPermissions] = useState<PermissionKey[]>([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const [sortColumn, setSortColumn] = useState<'name' | 'email' | 'role' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();
  const { user: authUser, userData } = useAuth();

  useEffect(() => {
    setActiveTab(searchParams.get('tab') === 'requests' ? 'requests' : 'all-users');
  }, [searchParams]);

  const newUserForm = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "student",
      status: "approved",
      phone: "",
    },
  });

  const watchedRole = newUserForm.watch('role');

  useEffect(() => {
    if (watchedRole === 'manager') {
      newUserForm.setValue('status', 'approved');
    }
  }, [watchedRole, newUserForm]);

  const handleSort = (column: 'name' | 'email' | 'role' | 'status') => {
    if (sortColumn === column) {
      // Toggle direction if same column is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredUsers = useMemo(() => {
    if (
      roleFilter === 'instructor' ||
      roleFilter === 'student' ||
      roleFilter === 'admin' ||
      roleFilter === 'manager'
    ) {
      return users.filter((user) => user.role === roleFilter);
    }
    return users;
  }, [users, roleFilter]);

  const getSortedUsers = useCallback(() => {
    if (!sortColumn) return filteredUsers;

    const sorted = [...filteredUsers].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortColumn) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          return 0;
      }

      // Convert to lowercase for case-insensitive comparison
      aValue = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
      bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredUsers, sortColumn, sortDirection]);

  const fetchUsers = useCallback(async () => {
    try {
      // Use server action to fetch all users with service role
      const result = await getAllUsers();

      if (!result.success || !result.data) {
        console.error('Error fetching users:', result.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users"
        });
        return;
      }

      setUsers(result.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [toast]);

  const fetchPendingRegistrations = useCallback(async () => {
    try {
      // Use server action to fetch pending users with service role
      const result = await getPendingUsers();

      if (!result.success || !result.data) {
        console.error('Error fetching pending registrations:', result.error);
        return;
      }

      const formattedRequests: RegistrationRequest[] = (result.data || []).map(user => ({
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        role: user.role || 'student',
        date: format(new Date(user.createdAt || new Date()), 'dd MMM yyyy'),
        status: 'pending' as const
      }));

      setPendingRegistrations(formattedRequests);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      await Promise.all([fetchUsers(), fetchPendingRegistrations()]);
      setLoading(false);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]); // Only depend on authUser, not the callback functions

  const handleApprove = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const result = await approveUser(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({ title: "Success", description: "User approved successfully" });
      await fetchUsers();
      await fetchPendingRegistrations();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve user"
      });
    }
    setUpdatingId(null);
  };

  const handleReject = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const result = await rejectUser(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({ title: "Success", description: "User rejected successfully" });
      await fetchUsers();
      await fetchPendingRegistrations();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to reject user"
      });
    }
    setUpdatingId(null);
  };

  const handleSuspend = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const result = await suspendUser(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({ title: "Success", description: "User suspended successfully" });
      await fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend user"
      });
    }
    setUpdatingId(null);
  };

  const handleReinstate = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const result = await reinstateUser(userId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({ title: "Success", description: "User reinstated successfully" });
      await fetchUsers();
    } catch (error) {
      console.error('Error reinstating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reinstate user"
      });
    }
    setUpdatingId(null);
  };

  const handleResetPassword = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      // Send password reset email using server action
      const result = await sendPasswordResetEmail(user.email);

      // Show the recovery link for testing (until email is configured)
      if (result.link) {
        const copyLink = async () => {
          await navigator.clipboard.writeText(result.link);
          toast({
            title: "Link Copied!",
            description: "Recovery link copied to clipboard. Paste in browser to test."
          });
        };
        
        // Show dialog with link
        const shouldCopy = window.confirm(
          `Recovery link generated!\n\n${result.link}\n\n` +
          `Click OK to copy to clipboard, or Cancel to close.`
        );
        
        if (shouldCopy) {
          await copyLink();
        }
      }

      toast({
        title: "Success",
        description: result.message
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send password reset email"
      });
    }
    setUpdatingId(null);
  };

  const handleSetTemporaryPassword = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      // Set temporary password using server action
      const result = await setTemporaryPassword(user.email);

      toast({
        title: "Success",
        description: `Temporary password: ${result.tempPassword}`,
        duration: 10000, // Show longer for users to copy
      });

      // Show modal with copyable password
      setSelectedUser({ ...user, enrollments: [] });
      setIsEnrollmentModalOpen(true);
    } catch (error) {
      console.error('Error setting temporary password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set temporary password"
      });
    }
    setUpdatingId(null);
  };

  const handleManageEnrollments = async (user: UserType) => {
    try {
      console.log('🔍 [CLIENT] Fetching enrollments for user:', user.id);
      
      const result = await fetchUserEnrollments(user.id);

      console.log('📊 [CLIENT] Server action result:', result);

      if (!result.success) {
        throw new Error(result.error);
      }

      const detailedEnrollments = (result.enrollments || []).map((enrollment: any) => ({
        ...enrollment,
        courseTitle: enrollment.title,
        enrollmentType: enrollment.type,
        status: enrollment.status as 'pending' | 'approved'
      }));

      console.log('✅ [CLIENT] Detailed enrollments mapped:', detailedEnrollments);

      setSelectedUser({ ...user, enrollments: detailedEnrollments });
      setIsEnrollmentModalOpen(true);
    } catch (error) {
      console.error('❌ [CLIENT] Error fetching enrollments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user enrollments"
      });
    }
  };
  
  const handleViewProfile = (user: UserType) => {
    setViewingProfileUser(user);
    setIsProfileModalOpen(true);
  };

  const handleRevokeAccess = async (enrollmentId: string) => {
    setIsDeleting(enrollmentId);
    try {
      console.log('🔍 [CLIENT] Revoking access for enrollment:', enrollmentId);
      
      const result = await deleteUserEnrollment(enrollmentId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({ title: "Success", description: result.message });
      
      if (selectedUser) {
        const updatedEnrollments = selectedUser.enrollments.filter(e => e.id !== enrollmentId);
        setSelectedUser({ ...selectedUser, enrollments: updatedEnrollments });
      }
    } catch (error) {
      console.error('❌ [CLIENT] Error revoking access:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke course access"
      });
    }
    setIsDeleting(null);
  };

  const handleDeleteUser = async (userId: string) => {
    setUpdatingId(userId);
    try {
      // First delete enrollments
      await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', userId);

      // Then delete user profile
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({ title: "Success", description: "User deleted successfully" });
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user"
      });
    }
    setUpdatingId(null);
  };

  const handleCreateUser = async (data: NewUserFormData) => {
    setIsCreatingUser(true);
    try {
      // Check if current user is admin
      if (!authUser || !userData || userData.role !== 'admin') {
        throw new Error('Only admin users can create new users');
      }

      if (data.role === 'manager' && permissionMode === 'custom' && selectedPermissions.length === 0) {
        throw new Error('Select at least one permission for the manager, or choose ALL');
      }

      const requestBody: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.role === 'manager' ? 'approved' : data.status,
      };

      if (data.phone && data.phone.trim()) {
        requestBody.phone = data.phone.trim();
      }

      if (data.role === 'manager') {
        requestBody.permissions = normalizeManagerPermissions(
          permissionMode,
          selectedPermissions
        );
      }

      const response = await authenticatedFetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      toast({ 
        title: "User Profile Created Successfully!", 
        description: data.role === 'manager'
          ? result.temporaryPassword
            ? `Manager "${result.user.name}" created. Copy the password from the dialog.`
            : `Manager "${result.user.name}" created with assigned permissions.`
          : `User "${result.user.name}" profile has been created. They can register using the standard sign-up page.`,
      });

      if (data.role === 'manager' && result.temporaryPassword) {
        setCreatedCredentials({
          email: result.user.email,
          password: result.temporaryPassword,
          name: result.user.name,
        });
      }
      
      setIsAddUserModalOpen(false);
      newUserForm.reset();
      setPermissionMode('all');
      setSelectedPermissions(MANAGER_PERMISSION_CATALOG.map((p) => p.key));
      await fetchUsers();
      await fetchPendingRegistrations();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message?.includes('No active session') || error.message?.includes('Admin access required')
          ? "Your session expired or could not be verified. Please refresh the page and try again."
          : error.message?.includes('duplicate') || error.message?.includes('unique')
          ? "A user with this email already exists"
          : error.message?.includes('Permission denied')
          ? "Permission denied. Please check admin privileges."
          : `Failed to create user: ${error.message || 'Unknown error'}`
      });
    }
    setIsCreatingUser(false);
  };

  const openEditPermissions = (user: UserType) => {
    setEditingPermissionsUser(user);
    setEditPermissionMode(permissionsToMode(user.permissions));
    setEditSelectedPermissions(permissionsToSelected(user.permissions));
  };

  const handleSaveManagerPermissions = async () => {
    if (!editingPermissionsUser) return;
    if (editPermissionMode === 'custom' && editSelectedPermissions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Select at least one permission, or choose ALL',
      });
      return;
    }

    setIsSavingPermissions(true);
    try {
      if (!authUser || !userData || userData.role !== 'admin') {
        throw new Error('Only admin users can update manager permissions');
      }

      const permissions = normalizeManagerPermissions(
        editPermissionMode,
        editSelectedPermissions
      );

      const response = await authenticatedFetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingPermissionsUser.id,
          permissions,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update permissions');
      }

      toast({
        title: 'Permissions updated',
        description: `Updated access for ${editingPermissionsUser.name}`,
      });
      setEditingPermissionsUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update permissions',
      });
    } finally {
      setIsSavingPermissions(false);
    }
  };

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
                {user.role === 'manager' && (
                    <DropdownMenuItem onClick={() => openEditPermissions(user)}>
                        <Shield className="mr-2 h-4 w-4" /> Edit Permissions
                    </DropdownMenuItem>
                 )}
               <DropdownMenuItem onClick={() => handleManageEnrollments(user)}>
                   <BookOpen className="mr-2 h-4 w-4" /> Manage Enrollments
               </DropdownMenuItem>
                <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => handleResetPassword(user.id)} className="text-blue-600 focus:text-blue-700 focus:bg-blue-100">
                   <Key className="mr-2 h-4 w-4" /> Send Password Reset Email
               </DropdownMenuItem>
               <DropdownMenuItem onClick={() => handleSetTemporaryPassword(user.id)} className="text-purple-600 focus:text-purple-700 focus:bg-purple-100">
                   <Shield className="mr-2 h-4 w-4" /> Set Temporary Password
               </DropdownMenuItem>
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
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="User Management"
          description="Approve new registrations and manage all users on the platform."
        />
        <Button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </div>
      
       <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="requests">Registration Requests ({pendingRegistrations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all-users">
            {roleFilter && (
              <p className="mb-4 text-sm text-muted-foreground">
                Showing {roleFilter}s only.{' '}
                <Link href="/admin/users" className="text-primary underline-offset-4 hover:underline">
                  Clear filter
                </Link>
              </p>
            )}
            {/* Mobile View */}
            <div className="md:hidden">
              {loading ? <p>Loading...</p> : getSortedUsers().length > 0 ? (
                <div className="space-y-4">
                  {getSortedUsers().map(user => (
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
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        Name
                        {sortColumn === 'name' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-2">
                        Email
                        {sortColumn === 'email' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-2">
                        Role
                        {sortColumn === 'role' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status
                        {sortColumn === 'status' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
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
                    getSortedUsers().map((user) => (
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
                    View and revoke access to enrolled courses, tests, and test series for this user.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-96 overflow-y-auto">
                {selectedUser?.enrollments && selectedUser.enrollments.length > 0 ? (
                    <ul className="space-y-3">
                        {selectedUser.enrollments.map(enrollment => (
                            <li key={enrollment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{enrollment.courseTitle}</p>
                                        <Badge variant="outline" className="text-xs">
                                            {enrollment.enrollmentType === 'course' ? '📚 Course' : enrollment.enrollmentType === 'series' ? '📋 Series' : '📝 Test'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Enrolled: {(() => {
                                        const date = convertToDate(enrollment.enrolledAt);
                                        return date ? format(date, 'dd MMM yyyy') : 'Invalid date';
                                    })()}</p>
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
                                                This will un-enroll the student from this {enrollment.enrollmentType || 'course'}. They will lose all access and progress. This cannot be undone.
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
                    <p className="text-center text-muted-foreground py-8">This student is not enrolled in any courses or tests.</p>
                )}
            </div>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Student Profile: {viewingProfileUser?.name}</DialogTitle>
            </DialogHeader>
             {viewingProfileUser && (
               <div className="space-y-4">
                 <div>
                   <p className="text-sm text-muted-foreground">Email</p>
                   <p className="font-medium">{viewingProfileUser.email}</p>
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Role</p>
                   <Badge variant="outline">{viewingProfileUser.role}</Badge>
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Status</p>
                   {getStatusBadge(viewingProfileUser.status)}
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Joined</p>
                   <p className="font-medium">{(() => {
                       const date = convertToDate(viewingProfileUser.createdAt);
                       return date ? format(date, 'dd MMM yyyy') : 'Invalid date';
                   })()}</p>
                 </div>
               </div>
             )}
        </DialogContent>
      </Dialog>

      {/* Add New User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account manually. Managers are created by admin only (no public registration).
            </DialogDescription>
          </DialogHeader>
          <Form {...newUserForm}>
            <form onSubmit={newUserForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={newUserForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedRole === 'manager' && (
                <ManagerPermissionsFields
                  mode={permissionMode}
                  onModeChange={setPermissionMode}
                  selected={selectedPermissions}
                  onSelectedChange={setSelectedPermissions}
                />
              )}

              {watchedRole !== 'manager' && (
                <FormField
                  control={newUserForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="approved">Approved (Active)</SelectItem>
                          <SelectItem value="pending">Pending (Requires approval)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={newUserForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={isCreatingUser}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingUser}>
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Manager Permissions Modal */}
      <Dialog
        open={!!editingPermissionsUser}
        onOpenChange={(open) => {
          if (!open) setEditingPermissionsUser(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Manager Permissions</DialogTitle>
            <DialogDescription>
              {editingPermissionsUser
                ? `Update access for ${editingPermissionsUser.name} (${editingPermissionsUser.email})`
                : 'Update manager access'}
            </DialogDescription>
          </DialogHeader>
          <ManagerPermissionsFields
            mode={editPermissionMode}
            onModeChange={setEditPermissionMode}
            selected={editSelectedPermissions}
            onSelectedChange={setEditSelectedPermissions}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingPermissionsUser(null)}
              disabled={isSavingPermissions}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveManagerPermissions} disabled={isSavingPermissions}>
              {isSavingPermissions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Permissions'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Created Manager Credentials Dialog */}
      <Dialog
        open={!!createdCredentials}
        onOpenChange={(open) => {
          if (!open) setCreatedCredentials(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manager login created</DialogTitle>
            <DialogDescription>
              Share these credentials securely with {createdCredentials?.name}. They should change
              the password after first login.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                <p className="font-mono text-sm break-all rounded border bg-muted/40 px-3 py-2">
                  {createdCredentials.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Temporary password</p>
                <p className="font-mono text-sm break-all rounded border bg-muted/40 px-3 py-2">
                  {createdCredentials.password}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                  );
                  toast({ title: 'Copied', description: 'Credentials copied to clipboard' });
                }}
              >
                Copy credentials
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
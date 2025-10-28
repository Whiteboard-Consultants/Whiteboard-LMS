
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, PlusCircle, Trash2, Loader2, MoreVertical, Clock, HelpCircle, ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import type { Test, User } from "@/types";
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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { deleteTest } from "@/app/instructor/tests/actions";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function InstructorTestsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [instructors, setInstructors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(authLoading);
      if(!user) setTests([]);
      return;
    }
    
    const fetchTestsAndInstructors = async () => {
      try {
        setLoading(true);
        
        // Fetch tests based on user role
        let testsQuery = supabase
          .from('tests')
          .select('*')
          .order('created_at', { ascending: false });

        if (userData?.role !== 'admin') {
          // For non-admin users, filter by instructor_id
          testsQuery = testsQuery.eq('instructor_id', user.id);
        }

        const { data: testsData, error: testsError } = await testsQuery;

        if (testsError) {
          console.error("Error fetching tests:", testsError);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch tests.' });
          setTests([]);
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
        const mappedTests = (testsData || []).map(test => ({
          ...test,
          createdAt: test.created_at,
          instructorId: test.instructor_id,
          questionCount: questionCountMap.get(test.id) || 0,
        })) as Test[];

        setTests(mappedTests);

        // Fetch all instructors if user is admin
        if (userData?.role === 'admin') {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, name')
            .eq('role', 'instructor');

          if (usersError) {
            console.error("Error fetching instructors:", usersError);
          } else {
            const instructorMap = new Map();
            (usersData || []).forEach(user => {
              instructorMap.set(user.id, user.name);
            });
            setInstructors(instructorMap);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch tests.' });
        setLoading(false);
      }
    };

    fetchTestsAndInstructors();
  }, [user, userData?.role, authLoading, toast]);

  const handleDeleteTest = async (testId: string) => {
    setIsDeleting(testId);
    const result = await deleteTest(testId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Test deleted successfully.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsDeleting(null);
  };
  
  const TestActions = ({ test }: { test: Test }) => (
     <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/instructor/tests/edit/${test.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit / Add Questions</span>
                    </Link>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Test</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the test and all its questions.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => handleDeleteTest(test.id)}
                    disabled={!!isDeleting}
                >
                    {isDeleting === test.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
     </AlertDialog>
  );
  
  const dashboardUrl = userData?.role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard';

  return (
    <div>
       <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href={dashboardUrl}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <PageHeader
        title="Test Management"
        description="Create and Manage your Assessments Here"
      >
        <Button asChild>
          <Link href="/instructor/tests/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Test
          </Link>
        </Button>
      </PageHeader>
      
      {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Card key={i}><CardContent className="p-6"><div className="h-48 w-full rounded-lg bg-muted animate-pulse" /></CardContent></Card>)}
          </div>
      ) : tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map(test => (
                  <Card key={test.id} className="flex flex-col">
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{test.title}</CardTitle>
                              <TestActions test={test} />
                          </div>
                           {userData?.role === 'admin' && (
                                <p className="text-xs text-muted-foreground pt-1">
                                    By: {instructors.get(test.instructorId) || 'Unknown Instructor'}
                                </p>
                            )}
                          {test.description && <div className="text-sm text-muted-foreground pt-2">{test.description}</div>}
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                          <div className="flex items-center justify-around text-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                <span>{test.questionCount} Questions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{test.duration / 60} mins</span>
                            </div>
                          </div>
                      </CardContent>
                      <CardFooter>
                           <Button asChild className="w-full" variant="secondary">
                             <Link href={`/instructor/tests/edit/${test.id}`}>
                                 <Edit className="mr-2 h-4 w-4" />
                                 Edit Test
                             </Link>
                           </Button>
                      </CardFooter>
                  </Card>
              ))}
          </div>
      ) : (
          <div className="text-center py-12 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-medium">No Tests Found</h3>
              <p className="text-muted-foreground mt-2">You haven&apos;t created any tests yet. Get started by creating one!</p>
          </div>
      )}
    </div>
  );
}

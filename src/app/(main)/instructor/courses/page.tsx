
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, PlusCircle, Trash2, Loader2, Users, MoreVertical, BarChart } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { deleteCourse } from "@/app/instructor/actions-supabase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";


export default function InstructorCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setLoading(false);
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', user.id);

        if (error) {
          console.error("Error fetching courses: ", error);
          toast({ 
            variant: 'destructive', 
            title: 'Error', 
            description: 'Could not fetch courses.'
          });
        } else {
          setCourses(data || []);
        }
      } catch (error) {
        console.error("Error fetching courses: ", error);
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: 'Could not fetch courses.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Set up real-time subscription
    const subscription = supabase
      .channel('courses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses',
          filter: `instructor_id=eq.${user.id}`
        },
        () => {
          fetchCourses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, authLoading, toast]);

  const handleDeleteCourse = async (courseId: string, imageUrl: string) => {
    setIsDeleting(courseId);
    const result = await deleteCourse(courseId, imageUrl);
    if (result.success) {
      toast({
        title: "Success",
        description: "Course deleted successfully.",
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
  
  const CourseActions = ({ course }: { course: Course }) => (
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
                    <Link href={`/instructor/courses/edit/${course.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Details</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href={`/instructor/students/${course.id}`}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Manage Students</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Course</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the course, along with all its lessons, tests, and enrollment data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => handleDeleteCourse(course.id, course.imageUrl)}
                    disabled={!!isDeleting}
                >
                    {isDeleting === course.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
     </AlertDialog>
  );


  return (
    <div>
      <PageHeader
        title="Courses & Reports"
        description="Manage your courses and view their performance reports."
      >
        <Button asChild>
          <Link href="/instructor/courses/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
          </Link>
        </Button>
      </PageHeader>
      
      {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-64 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-64 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-64 w-full rounded-lg bg-muted animate-pulse" />
          </div>
      ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                  <Card key={course.id} className="flex flex-col">
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <CourseActions course={course} />
                          </div>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                          <div className="flex items-center justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold">{course.studentCount}</p>
                                <p className="text-sm text-muted-foreground">Students</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{course.rating}</p>
                                <p className="text-sm text-muted-foreground">Rating</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge variant={course.type === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                {course.type}
                            </Badge>
                             <Badge variant="outline">Published</Badge>
                          </div>
                      </CardContent>
                      <CardFooter>
                           <Button asChild className="w-full">
                             <Link href={`/instructor/reports/${course.id}`}>
                                 <BarChart className="mr-2 h-4 w-4" />
                                 View Reports
                             </Link>
                           </Button>
                      </CardFooter>
                  </Card>
              ))}
          </div>
      ) : (
          <div className="text-center py-12 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-medium">No Courses Found</h3>
              <p className="text-muted-foreground mt-2">You haven&apos;t created any courses yet. Get started by creating one!</p>
          </div>
      )}
    </div>
  );
}


'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, PlusCircle, Trash2, Loader2, MoreVertical, DollarSign, Users, StarIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { supabase } from "@/lib/supabase";
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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { deleteCourse } from "@/app/admin/courses/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // Fetch courses from Supabase
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses from Supabase...');
        const { data: coursesData, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching courses:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load courses."
          });
          setCourses([]);
        } else {
          console.log('Courses loaded:', coursesData?.length || 0);
          setCourses(coursesData || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Set up real-time subscription
    const subscription = supabase
      .channel('courses_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses'
      }, () => {
        // Refetch courses when changes occur
        fetchCourses();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

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
        description: result.message,
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
                        <span>Edit</span>
                    </Link>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-red-800/30 dark:text-red-400 dark:focus:text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the course and all associated lessons, tests, enrollments, and other data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => handleDeleteCourse(course.id, course.imageUrl)}
                    disabled={!!isDeleting}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                    {isDeleting === course.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
     </AlertDialog>
  )

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Oversee all courses on the platform."
      >
        <Button asChild>
          <Link href="/instructor/courses/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Course
          </Link>
        </Button>
      </PageHeader>
      
      {/* Mobile View */}
      <div className="md:hidden">
         {loading ? (
             <p>Loading...</p>
         ) : courses.length > 0 ? (
             <div className="space-y-4">
                 {courses.map(course => (
                     <Card key={course.id}>
                         <CardHeader>
                             <div className="flex justify-between items-start">
                                 <CardTitle className="text-lg">{course.title}</CardTitle>
                                 <CourseActions course={course} />
                             </div>
                         </CardHeader>
                         <CardContent className="space-y-3">
                             <p className="text-sm text-muted-foreground">
                                 By {course.instructor.name}
                             </p>
                             <div className="flex items-center gap-4 text-sm">
                                 <div className="flex items-center gap-1">
                                     <Users className="h-4 w-4" />
                                     <span>{course.studentCount}</span>
                                 </div>
                                 <div className="flex items-center gap-1">
                                     <StarIcon className="h-4 w-4" />
                                     <span>{course.rating}</span>
                                 </div>
                                 <div className="flex items-center gap-1">
                                     <DollarSign className="h-4 w-4" />
                                     <span>{course.type === 'paid' ? `₹${course.price?.toFixed(2)}` : 'Free'}</span>
                                 </div>
                             </div>
                             <div>
                                 <Badge variant="secondary">Published</Badge>
                             </div>
                         </CardContent>
                     </Card>
                 ))}
             </div>
         ) : (
             <div className="text-center py-12">
                 <p>No courses found.</p>
             </div>
         )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.instructor.name}</TableCell>
                  <TableCell>
                    <Badge variant={course.type === 'paid' ? 'secondary' : 'outline'}>
                        {course.type === 'paid' ? 'Paid' : 'Free'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.type === 'paid' ? `₹${course.price?.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell>{course.studentCount}</TableCell>
                  <TableCell>{course.rating}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Published</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CourseActions course={course} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Test, Course, User } from "@/types";
import { createTest, updateTest } from "@/app/instructor/tests/actions";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  duration: z.coerce.number().int().positive("Duration must be a positive number of minutes."),
  type: z.enum(["practice", "final", "assessment", "quiz"]),
  courseId: z.string().optional(),
  instructorId: z.string().optional(),
});

interface TestFormProps {
    initialData?: Test | null;
}

export function TestForm({ initialData }: TestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const isEditMode = !!initialData;
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  useEffect(() => {
    if (!user || !userData) {
      console.log('TestForm: Waiting for user and userData to load...', { user: !!user, userData: !!userData, role: userData?.role });
      return;
    }
    
    console.log('TestForm: Starting data fetch for role:', userData.role);
    setLoadingCourses(true);
    
    // Fetch courses based on user role
    const fetchCourses = async () => {
      try {
        let query = supabase.from('courses').select('*').order('title');
        
        if (userData.role !== 'admin') {
          // For instructors, filter by their ID
          console.log('TestForm: Filtering courses for instructor:', user.id);
          query = query.eq('instructor_id', user.id);
        } else {
          console.log('TestForm: Fetching all courses for admin');
        }
        
        const { data: coursesData, error } = await query;
        
        if (error) {
          console.error("Failed to fetch courses:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch courses.' });
        } else {
          console.log('TestForm: Courses fetched:', coursesData?.length || 0);
          setCourses(coursesData || []);
          // If no initial course is set, ensure "none" is selected
          if (!initialData?.courseId && form.getValues('courseId') === '') {
            form.setValue('courseId', 'none');
          }
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch courses.' });
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();

    // Fetch instructors if user is admin
    if (userData.role === 'admin') {
      console.log('TestForm: Fetching instructors for admin user');
      setLoadingInstructors(true);
      
      const fetchInstructors = async () => {
        try {
          const { data: instructorsData, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'instructor')
            .order('name');
          
          if (error) {
            console.error("Failed to fetch instructors:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch instructors.' });
          } else {
            console.log('TestForm: Instructors fetched:', instructorsData?.length || 0);
            setInstructors(instructorsData || []);
            // If no initial instructor is set, set the current user as default
            if (!initialData?.instructorId && user?.id) {
              form.setValue('instructorId', user.id);
            }
          }
        } catch (err) {
          console.error("Failed to fetch instructors:", err);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch instructors.' });
        } finally {
          setLoadingInstructors(false);
        }
      };

      fetchInstructors();
    } else {
      console.log('TestForm: User is not admin, skipping instructor fetch');
    }

  }, [user?.id, userData?.role, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      duration: initialData ? initialData.duration / 60 : 60,
      type: initialData?.type || "assessment",
      courseId: initialData?.courseId || "none",
      instructorId: initialData?.instructorId || user?.id || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
        return;
    }
    
    const instructorId = userData?.role === 'admin' ? values.instructorId : user.id;
    if (!instructorId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Instructor could not be determined.'});
        return;
    }

    const course = courses.find(c => c.id === values.courseId);
    const finalCourseId = values.courseId === 'none' ? null : values.courseId;

    const testData = {
        title: values.title,
        description: values.description,
        duration: values.duration * 60, // Convert minutes to seconds
        type: values.type,
        instructorId: instructorId,
        courseId: finalCourseId || null,
        courseTitle: course?.title || null,
    };

    const result = isEditMode
        ? await updateTest(initialData.id, testData)
        : await createTest(testData);

    if(result.success) {
        toast({ title: "Success", description: `Test ${isEditMode ? 'updated' : 'created'} successfully!` });
        if (!isEditMode && 'testId' in result && result.testId) {
            router.push(`/instructor/tests/edit/${result.testId}`);
        }
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Test Details" : "New Test Details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CAT Mock Test 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (in minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 120" {...field} />
                  </FormControl>
                   <FormDescription>The total time allowed for the test in minutes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="practice">Practice Test</SelectItem>
                      <SelectItem value="final">Final Test</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Practice tests allow unlimited attempts, final tests are course assessments, assessments are general evaluations, and quizzes are shorter evaluations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             {/* Debug Info: Role={userData?.role || 'Not loaded'}, Courses={courses.length}, Instructors={instructors.length}, LoadingCourses={loadingCourses.toString()}, LoadingInstructors={loadingInstructors.toString()}, InstructorValue={form.watch('instructorId')}, CourseValue={form.watch('courseId')} */}
             {userData?.role === 'admin' && (
                <FormField
                    control={form.control}
                    name="instructorId"
                    render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign to Instructor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''} name={field.name}>
                                    <FormControl>
                                        <SelectTrigger 
                                            disabled={loadingInstructors || instructors.length === 0}
                                            className="cursor-pointer"
                                            onClick={() => console.log('Instructor dropdown clicked - instructors:', instructors.length, 'disabled:', loadingInstructors || instructors.length === 0)}
                                        >
                                            <SelectValue placeholder={loadingInstructors ? "Loading instructors..." : instructors.length === 0 ? "No instructors available" : "Select an instructor"} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {instructors.map(instructor => (
                                        <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>The instructor who will own this test.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )
                    }
                />
            )}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                    <FormItem>
                    <FormLabel>Link to Course (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'} name={field.name}>
                        <FormControl>
                                                <SelectTrigger 
                          disabled={loadingCourses}
                          className="cursor-pointer"
                          onClick={() => console.log('Course dropdown clicked - courses:', courses.length, 'disabled:', loadingCourses)}
                        >
                            <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select a course to link"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {courses.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormDescription>Link this test as a final assessment for a course.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )
              }
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSubmitting || (isEditMode && !form.formState.isDirty)}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : (isEditMode ? "Save Changes" : "Create Test & Add Questions")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

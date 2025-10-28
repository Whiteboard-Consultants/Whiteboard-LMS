'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Clock, Target, Eye, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { createTest, updateTest } from "@/app/instructor/tests/actions";
import type { Test, TestType, Course } from "@/types";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  type: z.enum(['practice', 'final', 'assessment', 'quiz'] as const),
  duration: z.coerce.number().int().positive("Duration must be a positive number of minutes."),
  isTimeLimited: z.boolean(),
  passingScore: z.coerce.number().min(0).max(100).optional(),
  maxAttempts: z.coerce.number().int().positive().optional(),
  showResults: z.boolean(),
  allowReview: z.boolean(),
  courseId: z.string().optional(),
});

interface EnhancedTestFormProps {
  initialData?: Partial<Test>;
  courses?: Course[];
}

export function EnhancedTestForm({ initialData, courses = [] }: EnhancedTestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>(courses);

  const isEditMode = !!initialData?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: (initialData?.type as TestType) || 'practice',
      duration: initialData ? Math.floor(initialData.duration / 60) : 60, // Convert to minutes
      isTimeLimited: initialData?.isTimeLimited ?? true,
      passingScore: initialData?.passingScore || 80,
      maxAttempts: initialData?.maxAttempts || undefined,
      showResults: initialData?.showResults ?? true,
      allowReview: initialData?.allowReview ?? true,
      courseId: initialData?.courseId || "",
    },
  });

  const watchTestType = form.watch('type');
  const watchIsTimeLimited = form.watch('isTimeLimited');

  // Fetch courses if not provided
  useEffect(() => {
    if (courses.length === 0 && userData) {
      fetchCourses();
    }
  }, [userData]);

  const fetchCourses = async () => {
    try {
      let query = supabase.from('courses').select('id, title');
      
      // If instructor, only show their courses
      if (userData?.role === 'instructor') {
        query = query.eq('instructor_id', userData.id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }

      setAvailableCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a test.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const testData = {
        ...values,
        duration: values.duration * 60, // Convert minutes to seconds
        instructorId: userData.id,
        courseTitle: values.courseId 
          ? availableCourses.find(c => c.id === values.courseId)?.title 
          : null,
      };

      const result = isEditMode
        ? await updateTest(initialData!.id!, testData, initialData!.courseId)
        : await createTest(testData);

      if (result.success) {
        toast({ 
          title: "Success", 
          description: `Test ${isEditMode ? 'updated' : 'created'} successfully!` 
        });
        
        if (!isEditMode && 'testId' in result && result.testId) {
          router.push(`/instructor/tests/edit/${result.testId}`);
        } else {
          router.push('/instructor/tests');
        }
      } else {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: result.error 
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getTestTypeDescription = (type: TestType) => {
    switch (type) {
      case 'practice':
        return 'Practice tests allow unlimited attempts and help students prepare. Results are shown immediately.';
      case 'final':
        return 'Final tests are typically timed assessments with limited attempts. Use for course completion.';
      case 'assessment':
        return 'General assessments for evaluating student progress. Flexible configuration options.';
      case 'quiz':
        return 'Quick quizzes for lesson-based testing. Usually shorter and less formal.';
      default:
        return '';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Test' : 'Create New Test'}</CardTitle>
        <CardDescription>
          {isEditMode ? 'Update your test settings and configuration.' : 'Create a new test with advanced settings and timing controls.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Essential test details and description.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter test title..." {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="practice">
                            <div className="flex items-center gap-2">
                              <RotateCcw className="h-4 w-4" />
                              Practice Test
                            </div>
                          </SelectItem>
                          <SelectItem value="final">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Final Test
                            </div>
                          </SelectItem>
                          <SelectItem value="assessment">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Assessment
                            </div>
                          </SelectItem>
                          <SelectItem value="quiz">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Quiz
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>{getTestTypeDescription(watchTestType)}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this test covers..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {availableCourses.length > 0 && (
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Course (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course to link..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No course selected</SelectItem>
                          {availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Link this test to a specific course for better organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Timing & Attempts */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Timing & Attempts</h3>
                <p className="text-sm text-muted-foreground">Configure time limits and attempt restrictions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="isTimeLimited"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Time Limited</FormLabel>
                        <FormDescription>
                          Enable automatic submission when time expires
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchIsTimeLimited && (
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Test will auto-submit after this time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="maxAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attempts (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited attempts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Score (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="80"
                          min="0"
                          max="100"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum percentage required to pass
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Results & Review */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Results & Review</h3>
                <p className="text-sm text-muted-foreground">Control how students see their results.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="showResults"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Results Immediately</FormLabel>
                        <FormDescription>
                          Display score and results after submission
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowReview"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Answer Review</FormLabel>
                        <FormDescription>
                          Let students review their answers after submission
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Test' : 'Create Test'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
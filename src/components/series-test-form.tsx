'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
import { getTestSeries, createTestSeries, getInstructors } from "@/app/instructor/test-series-actions";
import type { Test, TestType, TestSeries, DifficultyLevel } from "@/types";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  type: z.enum(['practice', 'final', 'assessment', 'quiz', 'mock'] as const),
  duration: z.coerce.number().int().positive("Duration must be a positive number of minutes."),
  isTimeLimited: z.boolean(),
  passingScore: z.coerce.number().min(0).max(100).optional(),
  maxAttempts: z.coerce.number().int().positive().optional(),
  showResults: z.boolean(),
  allowReview: z.boolean(),
  // Course linking
  courseId: z.string().optional(),
  // Series-specific fields
  isSeriesTest: z.boolean().default(false),
  seriesId: z.string().optional(),
  seriesTitle: z.string().optional(),
  seriesDescription: z.string().optional(),
  topicArea: z.string().optional(), // e.g., "Campus Recruitment", "IELTS"
  topic: z.string().optional(), // e.g., "QA", "VA", "LRDI"
  difficultyLevel: z.enum(['Easy', 'Medium', 'Medium-Hard', 'Hard'] as const).optional(),
  price: z.coerce.number().min(0).optional(),
  isFree: z.boolean().default(true),
  // Series package pricing fields
  seriesPrice: z.coerce.number().min(0).optional(),
  isPurchasableSeries: z.boolean().default(true),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  // Admin fields
  instructorId: z.string().optional(),
});

interface SeriesTestFormProps {
  initialData?: Partial<Test>;
  onSuccess?: () => void;
}

export function SeriesTestForm({ initialData, onSuccess }: SeriesTestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingSeriesData, setIsLoadingSeriesData] = useState(false);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [newSeriesData, setNewSeriesData] = useState({ 
    title: '', 
    topicArea: '', 
    description: '',
    price: undefined as number | undefined,
    isPurchasable: true,
    discountPercentage: 0
  });

  const isEditMode = !!initialData?.id;

  console.log('🎯 SeriesTestForm mounted:', {
    isEditMode,
    initialDataId: initialData?.id,
    initialDataInstructorId: initialData?.instructorId,
    initialDataSeriesId: initialData?.seriesId,
    initialDataSeriesPrice: initialData?.seriesPrice,
    initialDataDiscountPercentage: initialData?.discountPercentage,
    userDataId: userData?.id,
    userDataEmail: userData?.email
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      console.log('🎯 Edit mode - initial data:', {
        id: initialData.id,
        title: initialData.title,
        seriesId: initialData.seriesId,
        topic: initialData.topic,
        difficultyLevel: initialData.difficultyLevel,
        instructorName: initialData.instructorName
      });
    }
  }, [isEditMode, initialData]);

  // Watch testSeries state changes
  useEffect(() => {
    console.log('📚 Test series state updated:', {
      count: testSeries.length,
      series: testSeries.map(s => ({ id: s.id, title: s.title, topicArea: s.topicArea }))
    });
  }, [testSeries]);
  const isSeriesTest = initialData?.seriesId ? true : false;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: (initialData?.type as TestType) || 'mock',
      duration: initialData ? Math.floor(initialData.duration / 60) : 60,
      isTimeLimited: initialData?.isTimeLimited ?? true,
      passingScore: initialData?.passingScore || 80,
      maxAttempts: initialData?.maxAttempts || undefined,
      showResults: initialData?.showResults ?? true,
      allowReview: initialData?.allowReview ?? true,
      courseId: initialData?.courseId ? initialData.courseId : "none",
      isSeriesTest: isSeriesTest,
      seriesId: initialData?.seriesId || "",
      topic: initialData?.topic || "",
      difficultyLevel: initialData?.difficultyLevel as DifficultyLevel | undefined,
      price: initialData?.price || 0,
      isFree: initialData?.isFree ?? true,
      seriesPrice: initialData?.seriesPrice || 0,
      isPurchasableSeries: initialData?.seriesPrice ? true : true,
      discountPercentage: initialData?.discountPercentage || 0,
      instructorId: initialData?.instructorId || userData?.id || "",
    },
  });

  // Log initial form values for debugging
  console.log('💾 Form initialized with values:', {
    seriesPrice: form.getValues('seriesPrice'),
    isPurchasableSeries: form.getValues('isPurchasableSeries'),
    discountPercentage: form.getValues('discountPercentage'),
    initialDataSeriesPrice: initialData?.seriesPrice,
    initialDataDiscountPercentage: initialData?.discountPercentage
  });

  const watchIsSeriesTest = form.watch('isSeriesTest');
  const watchIsFree = form.watch('isFree');
  const watchSeriesId = form.watch('seriesId');
  const watchIsPurchasableSeries = form.watch('isPurchasableSeries');
  const watchSeriesPrice = form.watch('seriesPrice');
  const watchDiscountPercentage = form.watch('discountPercentage');

  // Monitor form field changes
  useEffect(() => {
    console.log('🎬 Form fields changed:', {
      seriesPrice: watchSeriesPrice,
      discountPercentage: watchDiscountPercentage,
      isPurchasableSeries: watchIsPurchasableSeries
    });
  }, [watchSeriesPrice, watchDiscountPercentage, watchIsPurchasableSeries]);

  // Load test series on mount
  useEffect(() => {
    // In edit mode, use the test's instructor ID; in create mode, use the current user's ID
    const instructorId = isEditMode ? (initialData?.instructorId || userData?.id) : userData?.id;
    
    if (instructorId) {
      console.log('👤 User data loaded:', { userId: userData?.id, userEmail: userData?.email });
      console.log('📚 Loading series for instructor:', instructorId, '(edit mode:', isEditMode, ')');
      loadTestSeries(instructorId);
      loadInstructors();
      loadCourses();
    } else {
      console.log('⏳ Waiting for user data to load...', {
        isEditMode,
        initialDataInstructorId: initialData?.instructorId,
        userDataId: userData?.id
      });
    }
  }, [userData?.id, isEditMode, initialData?.instructorId]);

  const loadTestSeries = async (instructorId: string) => {
    setIsLoadingSeriesData(true);
    try {
      console.log('📚 Loading test series for instructor:', instructorId);
      // In edit mode, we want to see all available series (not just the instructor's)
      // Pass undefined for instructorId to get all series
      const result = await getTestSeries({ 
        instructorId: isEditMode ? undefined : instructorId 
      });
      console.log('📚 Test series result:', result);
      if (result.success && result.data) {
        console.log('📚 Series loaded:', result.data);
        setTestSeries(result.data);
      } else {
        console.warn('⚠️ No series found or error:', result.error);
      }
    } catch (error) {
      console.error('Error loading test series:', error);
    } finally {
      setIsLoadingSeriesData(false);
    }
  };

  const loadInstructors = async () => {
    setIsLoadingInstructors(true);
    try {
      // Use server action to fetch instructors (bypasses RLS)
      const instructorsList = await getInstructors();
      console.log('📚 Instructors loaded from server:', instructorsList);
      setInstructors(instructorsList);
    } catch (error) {
      console.error('❌ Error loading instructors:', error);
      setInstructors([]);
    } finally {
      setIsLoadingInstructors(false);
    }
  };

  const loadCourses = async () => {
    setIsLoadingCourses(true);
    try {
      let query = supabase.from('courses').select('id, title');
      
      // If instructor, only show their courses
      if (userData?.role === 'instructor') {
        query = query.eq('instructor_id', userData.id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } else {
        console.log('✅ Courses loaded:', data?.length || 0);
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleCreateNewSeries = async () => {
    if (!newSeriesData.title || !newSeriesData.topicArea) {
      toast({
        title: "Error",
        description: "Please enter series title and topic area",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await createTestSeries({
        title: newSeriesData.title,
        description: newSeriesData.description,
        topicArea: newSeriesData.topicArea,
        // In edit mode, use the test's instructor; in create mode, use the current user
        instructorId: isEditMode ? (initialData?.instructorId || userData?.id || '') : (userData?.id || ''),
        isPublished: false,
        price: newSeriesData.price,
        isPurchasable: newSeriesData.isPurchasable,
        discountPercentage: newSeriesData.discountPercentage
      });

      if (result.success && result.data) {
        setTestSeries([...testSeries, result.data]);
        console.log('✅ Series created, updating form:', { seriesId: result.data.id });
        form.setValue('isSeriesTest', true);  // ✅ IMPORTANT: Mark this as a series test!
        form.setValue('seriesId', result.data.id);
        form.setValue('seriesPrice', newSeriesData.price);
        form.setValue('isPurchasableSeries', newSeriesData.isPurchasable);
        form.setValue('discountPercentage', newSeriesData.discountPercentage);
        setShowCreateSeries(false);
        setNewSeriesData({ title: '', topicArea: '', description: '', price: undefined, isPurchasable: true, discountPercentage: 0 });
        toast({
          title: "Success",
          description: "Series created successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create series",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating series:', error);
      toast({
        title: "Error",
        description: "Failed to create series",
        variant: "destructive"
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      console.log('📝 Form submitted with values:', {
        title: values.title,
        isSeriesTest: values.isSeriesTest,
        seriesId: values.seriesId,
        topic: values.topic,
        difficultyLevel: values.difficultyLevel,
        isFree: values.isFree,
        price: values.price,
        seriesPrice: values.seriesPrice,
        isPurchasableSeries: values.isPurchasableSeries,
        discountPercentage: values.discountPercentage
      });

      // Get instructor ID - use form value if admin selected one, otherwise use current user
      let instructorId = values.instructorId || userData?.id || (await supabase.auth.getUser()).data.user?.id;
      
      if (!instructorId) {
        toast({
          title: "Error",
          description: "You must be logged in as an instructor to create tests",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const testData = {
        title: values.title,
        description: values.description,
        duration: values.duration * 60, // Convert to seconds
        instructorId: instructorId,
        type: values.type,
        isTimeLimited: values.isTimeLimited,
        passingScore: values.passingScore,
        maxAttempts: values.maxAttempts,
        showResults: values.showResults,
        allowReview: values.allowReview,
        // Course linking
        courseId: values.courseId && values.courseId !== 'none' ? values.courseId : null,
        // Series fields
        seriesId: values.isSeriesTest ? values.seriesId : null,
        topic: values.isSeriesTest ? values.topic : null,
        difficultyLevel: values.isSeriesTest ? values.difficultyLevel : null,
        price: values.isSeriesTest && !values.isFree ? values.price : 0,
        isFree: values.isFree,
        // Series pricing fields
        seriesPrice: values.isSeriesTest && values.isPurchasableSeries ? values.seriesPrice : null,
        discountPercentage: values.isSeriesTest && values.isPurchasableSeries ? values.discountPercentage : null,
        isPurchasableSeries: values.isSeriesTest ? values.isPurchasableSeries : false
      };
      
      console.log('📦 Test data to submit:', {
        seriesId: testData.seriesId,
        topic: testData.topic,
        difficultyLevel: testData.difficultyLevel,
        price: testData.price,
        isFree: testData.isFree,
        seriesPrice: testData.seriesPrice,
        discountPercentage: testData.discountPercentage,
        isPurchasableSeries: testData.isPurchasableSeries
      });

      let result;
      if (isEditMode && initialData?.id) {
        result = await updateTest(initialData.id, testData);
      } else {
        result = await createTest(testData);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Test ${isEditMode ? 'updated' : 'created'} successfully`
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/instructor/tests`);
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save test",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Edit Test' : 'Create New Test'}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update test details and configuration' 
              : 'Create a new test for students to take'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., QA - Medium Mock #1" {...field} />
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

                {/* Admin can assign to specific instructor */}
                {userData?.role === 'admin' && (
                  <FormField
                    control={form.control}
                    name="instructorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Instructor</FormLabel>
                        {instructors.length > 0 ? (
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an instructor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {instructors.map((instructor) => (
                                <SelectItem key={instructor.id} value={instructor.id}>
                                  {instructor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                            No instructor accounts exist. Create instructor accounts in the Users section first, or leave this test assigned to yourself.
                          </div>
                        )}
                        <FormDescription>
                          Choose which instructor owns this test
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="practice">Practice Test</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="final">Final Exam</SelectItem>
                          <SelectItem value="mock">Mock Test</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Link to Course */}
                {courses.length > 0 && (
                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link to Course (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'none'}>
                          <FormControl>
                            <SelectTrigger disabled={isLoadingCourses}>
                              <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course to link"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No course selected</SelectItem>
                            {courses.map(course => (
                              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Link this test to a course to provide <strong>free access</strong> to enrolled students.
                        </FormDescription>
                        <div className="mt-2 text-xs space-y-1 list-disc list-inside text-muted-foreground">
                          <div><strong>With course:</strong> Students enrolled in the course get this test for free</div>
                          <div><strong>Without course:</strong> Test can only be purchased separately</div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Series Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isSeriesTest"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between border rounded-lg p-4 bg-slate-50">
                      <div className="space-y-0.5">
                        <FormLabel>Part of a Series?</FormLabel>
                        <FormDescription>
                          Add this test to a mock test series
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

                {watchIsSeriesTest && (
                  <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
                    {/* Series Selection */}
                    <FormField
                      control={form.control}
                      name="seriesId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Series or Create New</FormLabel>
                          <div className="space-y-2">
                            {!showCreateSeries ? (
                              <>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a series..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {isLoadingSeriesData ? (
                                      <SelectItem value="loading" disabled>Loading series...</SelectItem>
                                    ) : testSeries.length > 0 ? (
                                      testSeries.map((series) => (
                                        <SelectItem key={series.id} value={series.id}>
                                          {series.title} ({series.topicArea})
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="no-series" disabled>No series found</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  onClick={() => setShowCreateSeries(true)}
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create New Series
                                </Button>
                              </>
                            ) : (
                              <div className="space-y-3 p-3 bg-white rounded border">
                                <Input
                                  placeholder="Series Title (e.g., Campus Recruitment Training)"
                                  value={newSeriesData.title}
                                  onChange={(e) => setNewSeriesData({ ...newSeriesData, title: e.target.value })}
                                />
                                <Input
                                  placeholder="Topic Area (e.g., Campus Recruitment, IELTS, GMAT)"
                                  value={newSeriesData.topicArea}
                                  onChange={(e) => setNewSeriesData({ ...newSeriesData, topicArea: e.target.value })}
                                />
                                <Textarea
                                  placeholder="Description (optional)"
                                  value={newSeriesData.description}
                                  onChange={(e) => setNewSeriesData({ ...newSeriesData, description: e.target.value })}
                                  className="min-h-[60px]"
                                />
                                
                                {/* Series Pricing Section */}
                                <div className="border-t pt-3 space-y-2">
                                  <p className="text-sm font-medium">Series Package Pricing (Optional)</p>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Package price (₹)"
                                      value={newSeriesData.price || ''}
                                      onChange={(e) => setNewSeriesData({ ...newSeriesData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                      step="100"
                                      min="0"
                                      className="flex-1"
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Discount %"
                                      value={newSeriesData.discountPercentage}
                                      onChange={(e) => setNewSeriesData({ ...newSeriesData, discountPercentage: parseInt(e.target.value) || 0 })}
                                      min="0"
                                      max="100"
                                      className="w-24"
                                    />
                                  </div>
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={newSeriesData.isPurchasable}
                                      onChange={(e) => setNewSeriesData({ ...newSeriesData, isPurchasable: e.target.checked })}
                                      className="w-3 h-3"
                                    />
                                    Make this series purchasable as a package
                                  </label>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={handleCreateNewSeries}
                                    size="sm"
                                  >
                                    Create Series
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => setShowCreateSeries(false)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Topic within Series */}
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic within Series</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., QA (Quantitative Aptitude), VA (Verbal Ability), LRDI"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Topics organize tests within a series (e.g., QA, VA, LRDI in Campus Recruitment)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Difficulty Level */}
                    <FormField
                      control={form.control}
                      name="difficultyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Medium-Hard">Medium-Hard</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Series Package Pricing */}
                    <div className="space-y-3 border-t pt-3">
                      <h4 className="font-semibold text-sm">Series Package Pricing</h4>
                      
                      <FormField
                        control={form.control}
                        name="isPurchasableSeries"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Make Series Purchasable</FormLabel>
                              <FormDescription>
                                Allow students to buy this entire series as a package
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

                      {watchIsPurchasableSeries && (
                        <>
                          <FormField
                            control={form.control}
                            name="seriesPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Package Price (₹)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="e.g., 999"
                                    step="100"
                                    min="0"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Price for the entire series package
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="discountPercentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount vs Individual Tests (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    placeholder="e.g., 10"
                                    min="0"
                                    max="100"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  e.g., 10% means students save 10% by buying the package
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-3 border-t pt-3">
                      <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel>Free Test</FormLabel>
                              <FormDescription>
                                Toggle off to set a price
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

                      {!watchIsFree && (
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (₹)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="0.00"
                                  step="100"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Test Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Configuration</h3>

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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isTimeLimited"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between border rounded-lg p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Time Limited</FormLabel>
                        <FormDescription>
                          Enforce time limit for test
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
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Score (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="70"
                          min="0"
                          max="100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attempts (Leave empty for unlimited)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="showResults"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between border rounded-lg p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Show Results</FormLabel>
                          <FormDescription>
                            Display results after submission
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
                      <FormItem className="flex items-center justify-between border rounded-lg p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Allow Review</FormLabel>
                          <FormDescription>
                            Allow answer review after submission
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

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditMode ? 'Update Test' : 'Create Test'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Creating Test Series</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            <strong>What is a Test Series?</strong> A test series is a collection of tests organized by topic and difficulty level. For example, "Campus Recruitment Training" can have multiple topics (QA, VA, LRDI), each with different difficulty levels (Easy, Medium, Hard).
          </p>
          <p>
            <strong>How to create:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Toggle "Part of a Series?" to enable series features</li>
            <li>Choose an existing series or create a new one</li>
            <li>Specify the topic (e.g., QA, VA) and difficulty level</li>
            <li>Set individual pricing for this test variant</li>
            <li>Complete with other series fields and save</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from 'zod';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Course, User } from "@/types";
import { createCourse, updateCourse } from "@/app/instructor/actions-supabase";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CourseFormProps {
  initialData?: Course | null;
}

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    type: z.enum(['free', 'paid']),
    price: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number().nonnegative("Price must be a positive number.")
    ),
    category: z.enum(['Test Prep', 'Career Development', 'Language Skills']),
    instructorId: z.string().optional(),
    programOutcome: z.string().optional(),
    courseStructure: z.string().optional(),
    faqs: z.string().optional(),
    duration: z.string().optional(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    tags: z.string().optional(),
}).refine(data => {
    if (data.type === 'paid') {
        return data.price > 0;
    }
    return true;
}, {
    message: "Price is required for paid courses.",
    path: ['price'],
});


export function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userData, accessToken } = useAuth();
  const isEditMode = !!initialData;

  const [instructors, setInstructors] = useState<User[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isThumbnailChanged, setIsThumbnailChanged] = useState(false);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  const defaultValues = useMemo(() => ({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "free",
    price: initialData?.price || 0,
    category: initialData?.category || 'Test Prep',
    instructorId: initialData?.instructor?.id || (userData?.role === 'instructor' ? user?.id : undefined),
    programOutcome: initialData?.programOutcome || "",
    courseStructure: initialData?.courseStructure || "",
    faqs: initialData?.faqs || "",
    duration: initialData?.duration || "",
    level: initialData?.level || 'Beginner',
    tags: initialData?.tags?.join(', ') || "",
  }), [initialData, user, userData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  useEffect(() => {
    form.reset(defaultValues);
    setThumbnailPreview(initialData?.imageUrl || null);
  }, [initialData, defaultValues, form]);


   useEffect(() => {
    if (userData?.role === 'admin') {
        setLoadingInstructors(true);
        const fetchInstructors = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('role', 'instructor')
                    .order('name');
                
                if (error) {
                    console.error('Failed to fetch instructors:', error);
                } else {
                    setInstructors(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch instructors:', err);
            } finally {
                setLoadingInstructors(false);
            }
        };
        
        fetchInstructors();
    }
  }, [userData?.role]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsThumbnailChanged(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveThumbnail = () => {
      setIsThumbnailChanged(true);
      setThumbnailPreview(null);
      if(thumbnailFileRef.current) {
          thumbnailFileRef.current.value = "";
      }
  }

  const { formState: { isDirty, isSubmitting } } = form;
  const isSaveable = isDirty || isThumbnailChanged;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('=== 🚀 FORM SUBMISSION STARTED ===');
    console.log('Form values:', values);
    
    // STEP 1: Validate user is logged in
    if (!user || !userData) {
      console.error('❌ User not authenticated');
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to perform this action." });
      return;
    }
    console.log('✅ User authenticated:', { userId: user.id, userName: userData.name, role: userData.role });

    // STEP 2: Prepare form data with all values
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Add user metadata
    formData.append('userId', user.id);
    formData.append('userName', userData.name);
    formData.append('userRole', userData.role);
    console.log('✅ User data added to form');

    // STEP 3: Handle thumbnail upload if present
    let uploadedImageUrl = '';
    const thumbnailFile = thumbnailFileRef.current?.files?.[0];
    
    if (thumbnailFile) {
      console.log('📤 UPLOAD PHASE: Processing thumbnail...');
      try {
        // Use access token from auth context
        if (!accessToken) {
          console.warn('⚠️ No access token available, skipping image upload');
          uploadedImageUrl = '';
        } else {
          console.log('✅ Using access token from auth context');
          // Prepare upload
          const uploadFormData = new FormData();
          uploadFormData.append('file', thumbnailFile);
          uploadFormData.append('folder', 'course_thumbnails');
          uploadFormData.append('bucket', 'course-assets');

          console.log('📝 Uploading file:', { name: thumbnailFile.name, size: thumbnailFile.size });
          const uploadStartTime = Date.now();

          // Upload with 30-second timeout
          const uploadResponse = await fetch('/api/supabase-upload-direct', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            body: uploadFormData,
            signal: AbortSignal.timeout(30000)
          });

          const uploadDuration = Date.now() - uploadStartTime;
          console.log(`📥 Upload response: ${uploadDuration}ms, status: ${uploadResponse.status}`);

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            if (uploadResult.success && uploadResult.url) {
              uploadedImageUrl = uploadResult.url;
              console.log('✅ Image uploaded successfully');
              formData.append('uploadedImageUrl', uploadedImageUrl);
            } else {
              throw new Error(uploadResult.error || 'Upload response invalid');
            }
          } else {
            throw new Error(`Upload failed: HTTP ${uploadResponse.status}`);
          }
        }
      } catch (uploadError) {
        const errorMsg = uploadError instanceof Error ? uploadError.message : 'Upload failed';
        console.error('⚠️ Image upload error:', errorMsg);
        toast({ 
          variant: "destructive", 
          title: "Image Upload Failed", 
          description: `Could not upload thumbnail: ${errorMsg}. Course will be created without image.` 
        });
        // Continue - image is optional, don't block course creation
      }
    } else {
      console.log('ℹ️ No thumbnail selected');
    }

    // STEP 4: Add existing image for edit mode
    if (isEditMode && initialData?.imageUrl && !uploadedImageUrl) {
      formData.append('existingImageUrl', initialData.imageUrl);
      console.log('📸 Using existing image from edit mode');
    }

    // STEP 5: Call appropriate server action
    try {
      console.log(`🔄 Calling ${isEditMode ? 'updateCourse' : 'createCourse'} server action...`);
      
      const result = isEditMode 
        ? await updateCourse(initialData!.id, formData)
        : await createCourse(formData);

      console.log('📬 Server action response:', result);

      if (result.success && result.courseId) {
        console.log('✅ SUCCESS: Course saved with ID:', result.courseId);
        toast({ 
          title: isEditMode ? "Course updated successfully!" : "Course created successfully!",
          description: isEditMode ? "Your changes have been saved." : "Your new course is ready."
        });
        
        if (isEditMode) {
          router.refresh();
          form.reset(values);
          setIsThumbnailChanged(false);
        } else {
          // Navigate to edit page, then refresh to load the new course data
          await router.push(`/instructor/courses/edit/${result.courseId}`);
          // Delay refresh slightly to ensure navigation completes
          setTimeout(() => {
            router.refresh();
          }, 500);
        }
      } else {
        throw new Error(result.error || 'Unknown server error');
      }
    } catch (serverError) {
      const errorMsg = serverError instanceof Error ? serverError.message : 'Server error';
      console.error('❌ Server action failed:', errorMsg);
      toast({ 
        variant: "destructive", 
        title: "Failed to Save Course", 
        description: errorMsg 
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Course" : "Course Details"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the details for your course."
            : "Provide the main details for your course. You can add modules and lessons later."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Basic Course Information - Always Visible */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mastering Advanced React" {...field} />
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
                      <FormLabel>Course Description</FormLabel>
                      <FormControl>
                          <RichTextEditor
                              content={field.value}
                              onChange={(content) => field.onChange(content)}
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
              />
            </div>

            {/* Accordion Sections */}
            <Accordion type="multiple" defaultValue={["pricing", "media"]} className="w-full">
              {/* Pricing & Course Details */}
              <AccordionItem value="pricing">
                <AccordionTrigger className="text-lg font-semibold">
                  Pricing & Course Details
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} name="type">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("type") === "paid" && (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (INR)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g., 4999.00"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} name="category">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Test Prep">Test Prep</SelectItem>
                              <SelectItem value="Career Development">
                                Career Development
                              </SelectItem>
                              <SelectItem value="Language Skills">Language Skills</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} name="level">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 8 Weeks, 20 Hours" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., IELTS, Public Speaking, Aptitude"
                            {...field}
                             value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Separate tags with a comma.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {userData?.role === "admin" && (
                    <FormField
                      control={form.control}
                      name="instructorId"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name} value={field.value}>
                              <FormControl>
                                <SelectTrigger disabled={loadingInstructors}>
                                  <SelectValue placeholder="Select an instructor..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {loadingInstructors ? (
                                  <div className="p-4">Loading...</div>
                                ) : (
                                  instructors.map((inst) => (
                                    <SelectItem key={inst.id} value={inst.id}>
                                      {inst.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )
                      }
                    />
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Course Media */}
              <AccordionItem value="media">
                <AccordionTrigger className="text-lg font-semibold">
                  Course Media & Thumbnail
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <FormItem>
                    <FormLabel htmlFor="thumbnail-upload">Course Thumbnail</FormLabel>
                    <div className="mt-2 flex items-center gap-x-3">
                      {thumbnailPreview ? (
                        <div className="relative h-24 w-40 rounded-md overflow-hidden">
                          <Image
                            fill
                            sizes="160px"
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            onClick={handleRemoveThumbnail}
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="h-24 w-40 flex items-center justify-center rounded-md border border-dashed text-muted-foreground">
                          <Upload className="h-8 w-8" />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        ref={thumbnailFileRef}
                        onChange={handleThumbnailChange}
                        className="hidden"
                        id="thumbnail-upload"
                        name="thumbnail"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => thumbnailFileRef.current?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  </FormItem>
                </AccordionContent>
              </AccordionItem>

              {/* Advanced Content */}
              <AccordionItem value="content">
                <AccordionTrigger className="text-lg font-semibold">
                  Advanced Course Content
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="courseStructure"
                    render={({ field }) => (
                          <FormItem>
                          <FormLabel>Course Structure</FormLabel>
                          <FormControl>
                              <RichTextEditor
                              content={field.value}
                              onChange={(content) => form.setValue('courseStructure', content, { shouldDirty: true })}
                              />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="programOutcome"
                    render={({ field }) => (
                          <FormItem>
                          <FormLabel>Program Outcome</FormLabel>
                          <FormControl>
                              <RichTextEditor
                              content={field.value}
                              onChange={(content) => form.setValue('programOutcome', content, { shouldDirty: true })}
                              />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="faqs"
                    render={({ field }) => (
                          <FormItem>
                          <FormLabel>Frequently Asked Questions (FAQs)</FormLabel>
                          <FormControl>
                              <RichTextEditor
                              content={field.value}
                              onChange={(content) => form.setValue('faqs', content, { shouldDirty: true })}
                              />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || (isEditMode && !isSaveable)} className="ml-auto">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : "Save Course"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

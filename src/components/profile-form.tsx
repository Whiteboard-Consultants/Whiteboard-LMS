
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useRouter } from "next/navigation";
import { Checkbox } from "./ui/checkbox";
import type { CourseCategory } from "@/types";

const improvementItems: { id: CourseCategory; label: string }[] = [
    { id: 'Test Prep', label: 'Test Preparation (IELTS, TOEFL, etc.)' },
    { id: 'Communication', label: 'Communication Skills (Public Speaking, etc.)' },
    { id: 'Career Development', label: 'Career Development (Employability, etc.)' },
];

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }).optional().or(z.literal('')),
    education: z.string().min(3, { message: "Please enter your education details." }),
    passingYear: z.coerce.number().min(1980, "Invalid year.").max(new Date().getFullYear() + 5, "Invalid year."),
    improvementAreas: z.array(z.string()).refine(value => value.length > 0, {
        message: "You must select at least one area to improve on.",
    }),
    careerPlan: z.string().min(10, { message: "Please tell us a bit about your career plans." }),
    needsInterviewSupport: z.enum(['yes', 'no'], {
        required_error: "Please select an option.",
    }),
});

interface ProfileFormProps {
    onSave?: () => void;
    isMandatory?: boolean;
}

export function ProfileForm({ onSave, isMandatory = false }: ProfileFormProps) {
  const { toast } = useToast();
  const { user, userData, loading, refreshUserData } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      education: "",
      passingYear: new Date().getFullYear(),
      improvementAreas: [],
      careerPlan: "",
      needsInterviewSupport: "no",
    },
  });

  useEffect(() => {
    if (userData) {
      // Load data from user profile and student_profiles table
      form.reset({
        name: userData.name || "",
        phone: userData.phone || "",
        education: userData.education || "",
        passingYear: userData.passingYear || new Date().getFullYear(),
        improvementAreas: userData.improvementAreas || [],
        careerPlan: userData.careerPlan || "",
        needsInterviewSupport: userData.needsInterviewSupport ? 'yes' : 'no',
      });
    }
  }, [userData, form]);


  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
        return;
    }

    try {
        // First, update the user table with basic info
        const { error: userUpdateError } = await supabase
            .from('users')
            .update({
                name: values.name,
                phone: values.phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (userUpdateError) {
            throw userUpdateError;
        }

        // Then, create or update the student profile
        const profileData = {
            user_id: user.id,
            education: values.education,
            passing_year: values.passingYear,
            improvement_areas: values.improvementAreas,
            career_plan: values.careerPlan,
            needs_interview_support: values.needsInterviewSupport === 'yes',
            is_profile_complete: true,
            updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
            .from('student_profiles')
            .upsert(profileData, { 
                onConflict: 'user_id',
                ignoreDuplicates: false 
            });

        if (profileError) {
            throw profileError;
        }

        toast({
            title: "Success",
            description: "Your profile has been updated.",
        });

        // Refresh user data in the auth context
        await refreshUserData();

        if (onSave) {
            onSave();
        }
        
        // Now redirect
        router.push('/student/dashboard');

    } catch (error: unknown) {
        console.error('Profile update error:', error);
        toast({
            variant: "destructive",
            title: "Error",
            description: (error as Error).message || "Failed to update profile.",
        });
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="px-0">
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              {isMandatory ? "Please complete your profile to continue." : "Keep your personal information up to date."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormItem>
                <FormLabel>Email</FormLabel>
                <Input value={user?.email || ''} disabled />
            </FormItem>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="e.g. 9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current or Last Education</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. B.Tech in Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="passingYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Passing</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="improvementAreas"
              render={() => (
                <FormItem>
                   <div className="mb-4">
                        <FormLabel>Which are the areas you wish to improve on?</FormLabel>
                    </div>
                  {improvementItems.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="improvementAreas"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="careerPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Plan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about your future career aspirations..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="needsInterviewSupport"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Do You Need Interview Preparation Support?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end px-0">
            <Button type="submit" disabled={isSubmitting || loading}>
              {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { saveContactSubmission } from "@/app/contact/actions";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required."),
  lastName: z.string().min(1, "Last Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "A valid phone number is required."),
  preferredIntake: z.string().min(1, "Preferred intake is required."),
  degreeOfInterest: z.string().min(1, "Program of interest is required."),
  state: z.string().min(1, "State is required."),
  enquiryMessage: z.string().optional(),
});

export function UowApplyForm() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      preferredIntake: "",
      degreeOfInterest: "",
      state: "",
      enquiryMessage: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const submissionData = {
        ...values,
        inquiryType: `UOW Admission: ${values.degreeOfInterest}`,
        message: values.enquiryMessage
    };

    const result = await saveContactSubmission(submissionData);

    if (result.success) {
      toast({
        title: "Form Submitted",
        description: "Thank you for your interest! We will get back to you shortly.",
      });
      form.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: result.error,
        });
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Register your interest</CardTitle>
            <CardDescription>
              Complete the form below to begin your application journey with the University of Wollongong in India.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="given-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="family-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Phone Number <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="###-###-####" {...field} autoComplete="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="preferredIntake"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Preferred Intake <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an intake session" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="March">March</SelectItem>
                            <SelectItem value="July">July</SelectItem>
                            <SelectItem value="November">November</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="degreeOfInterest"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Program of Interest <span className="text-destructive">*</span></FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a program" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="GC Computing">Graduate Certificate in Computing</SelectItem>
                                <SelectItem value="MS Computing">Master of Computing (Data Analytics)</SelectItem>
                                <SelectItem value="GC FinTech">Graduate Certificate in Financial Technology</SelectItem>
                                <SelectItem value="MS FinTech">Master of Financial Technology (FinTech)</SelectItem>
                                <SelectItem value="MS FinTech Ext">Master of Financial Technology (FinTech) Extension</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="address-level1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="enquiryMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enquiry Message</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <p className="text-xs text-muted-foreground">
                Whiteboard Consultants and The University of Wollongong, GIFT City, India may send you marketing material from time to time. You can opt-out (unsubscribe) at any time. Your information is collected in line with our <Link href="#" className="underline">privacy policy</Link>.
            </p>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  resume: z.any().refine(file => file?.length == 1, 'Resume is required.'),
});

export default function ResumeEvaluationSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('file', values.resume[0]);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      
      toast({
        title: "Success!",
        description: "Your resume has been uploaded successfully. Our team will get back to you shortly.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return (
        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="container">
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                        Get a Free Resume Evaluation
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        Upload your resume and our team of experts will provide you with a free evaluation to help you identify strengths, weaknesses, and opportunities for improvement.
                    </p>
                </div>
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                    </div>
                    <Skeleton className="h-10" />
                    <Skeleton className="h-12" />
                </div>
            </div>
        </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-background dark:bg-black">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
            Get a Free Resume Evaluation
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Upload your resume and our team of experts will provide you with a free evaluation to help you identify strengths, weaknesses, and opportunities for improvement.
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} autoComplete="name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Resume</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => field.onChange(e.target.files)}
                            className="pt-2"
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Uploading...' : 'Submit for Evaluation'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}

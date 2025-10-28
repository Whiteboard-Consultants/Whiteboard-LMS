
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { submitRating } from '@/app/student/actions';

const formSchema = z.object({
  contentRating: z.number().min(1, 'Please rate the course content.'),
  instructorRating: z.number().min(1, 'Please rate the instructor.'),
  comment: z.string().min(10, 'Please provide a comment of at least 10 characters.'),
});

interface RatingFormProps {
  courseId: string;
  instructorId: string;
}

export function RatingForm({ courseId, instructorId }: RatingFormProps) {
  const [contentHover, setContentHover] = useState(0);
  const [instructorHover, setInstructorHover] = useState(0);
  const { user, userData } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentRating: 0,
      instructorRating: 0,
      comment: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userData) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('userId', user.uid);
    formData.append('userName', userData.name);
    if(userData.avatarUrl) formData.append('userAvatarUrl', userData.avatarUrl);
    formData.append('rating', values.contentRating.toString()); // Keep 'rating' for course rating
    formData.append('instructorRating', values.instructorRating.toString());
    formData.append('instructorId', instructorId);
    formData.append('comment', values.comment);

    const result = await submitRating(formData);

    if (result && result.success) {
      toast({ title: 'Success', description: result.message });
      form.reset();
    } else {
      toast({ variant: "destructive", title: "Error", description: result?.error || "An unknown error occurred." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="contentRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Content Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={ratingValue}
                        onClick={() => field.onChange(ratingValue)}
                        onMouseEnter={() => setContentHover(ratingValue)}
                        onMouseLeave={() => setContentHover(0)}
                        className="p-1 rounded-full transition-colors"
                      >
                        <Star
                          className={cn(
                            'h-8 w-8 transition-colors',
                            ratingValue <= (contentHover || field.value)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instructorRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructor Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={ratingValue}
                        onClick={() => field.onChange(ratingValue)}
                        onMouseEnter={() => setInstructorHover(ratingValue)}
                        onMouseLeave={() => setInstructorHover(0)}
                        className="p-1 rounded-full transition-colors"
                      >
                        <Star
                          className={cn(
                            'h-8 w-8 transition-colors',
                            ratingValue <= (instructorHover || field.value)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience with the course..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

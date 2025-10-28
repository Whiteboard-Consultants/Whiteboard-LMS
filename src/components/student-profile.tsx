
'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageSquare } from 'lucide-react';

import { User } from "@/types";
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/app/actions';
import { Separator } from './ui/separator';

interface StudentProfileProps {
  user: User;
}

const messageSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

export function StudentProfile({ user }: StudentProfileProps) {
  const { userData: sender } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  const { isSubmitting } = form.formState;

  const handleSendMessage = async (values: z.infer<typeof messageSchema>) => {
    if (!sender) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not identify sender.' });
      return;
    }
    const result = await sendNotification({
      senderId: sender.id,
      senderName: sender.name,
      receiverId: user.id,
      message: values.message,
    });

    if (result.success) {
      toast({ title: 'Success', description: 'Your message has been sent.' });
      form.reset();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <div className="text-sm font-medium">Full Name</div>
        <p className="text-sm text-muted-foreground">{user.name}</p>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-medium">Email Address</div>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-medium">Phone Number</div>
        <p className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</p>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-medium">Current or Last Education</div>
        <p className="text-sm text-muted-foreground">{user.education || 'Not provided'}</p>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-medium">Year of Passing</div>
        <p className="text-sm text-muted-foreground">{user.passingYear || 'Not provided'}</p>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-medium">Areas to Improve On</div>
        <div className="flex flex-wrap gap-2">
          {user.improvementAreas && user.improvementAreas.length > 0 ? (
            user.improvementAreas.map(area => (
              <span key={area} className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-md">{area}</span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Not provided</p>
          )}
        </div>
      </div>
       <div className="grid gap-2">
        <div className="text-sm font-medium">Career Plan</div>
        <p className="text-sm text-muted-foreground">{user.careerPlan || 'Not provided'}</p>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-medium">Needs Interview Support</div>
        <p className="text-sm text-muted-foreground">{user.needsInterviewSupport ? 'Yes' : 'No'}</p>
      </div>

      {(sender?.role === 'admin' || sender?.role === 'instructor') && (
        <>
          <Separator />
          <div className="space-y-4 pt-2">
             <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Send a Message</h3>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4">
                    <FormField
                        name="message"
                        control={form.control}
                        render={({field}) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea placeholder={`Send a motivational message or a reminder to ${user.name}...`} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Send
                        </Button>
                    </div>
                </form>
             </Form>
          </div>
        </>
      )}
    </div>
  );
}

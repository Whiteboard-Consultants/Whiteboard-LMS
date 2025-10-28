
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trash2, Loader2, Info, CheckCircle, AlertTriangle, XCircle, Megaphone } from 'lucide-react';
import type { Announcement } from '@/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createAnnouncement, deleteAnnouncement } from './actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  type: z.enum(['Info', 'Success', 'Warning', 'Destructive'], { required_error: 'Type is required.' }),
});

const announcementIcons: Record<Announcement['type'], React.ReactNode> = {
    Info: <Info className="h-5 w-5 text-blue-500" />,
    Success: <CheckCircle className="h-5 w-5 text-green-500" />,
    Warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    Destructive: <XCircle className="h-5 w-5 text-red-500" />,
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', content: '', type: 'Info' },
  });

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // Initial fetch
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching announcements:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load announcements.' });
      } else {
        // Map database types to frontend types
        const dbToFrontendType: Record<string, string> = {
          'info': 'Info',
          'success': 'Success',
          'warning': 'Warning',
          'error': 'Destructive'
        };
        
        // Map Supabase data to match our types
        const mappedData = data?.map(item => ({
          ...item,
          type: dbToFrontendType[item.type] || 'Info',
          createdAt: item.created_at
        })) || [];
        setAnnouncements(mappedData);
      }
      setLoading(false);
    };

    fetchAnnouncements();

    // Set up real-time subscription
    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await createAnnouncement(values);
    if (result.success) {
      toast({ title: 'Success', description: 'Announcement has been published.' });
      form.reset();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteAnnouncement(id);
    if (result.success) {
        toast({ title: "Announcement Deleted" });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }

  return (
    <div>
      <PageHeader title="Announcement Management" description="Create and manage platform-wide announcements." />
      <div className="space-y-8">
        {/* New Announcement Section */}
        <Card className="p-6">
          <CardTitle>New Announcement</CardTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField name="title" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="content" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="type" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} name="type">
                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Info">Info</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Warning">Warning</SelectItem>
                      <SelectItem value="Destructive">Destructive</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publish
              </Button>
            </form>
          </Form>
        </Card>

        {/* Published Announcements Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Published Announcements</h3>
          <div className="space-y-4">
            {loading ? <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : announcements.length > 0 ? announcements.map(ann => (
                <Card key={ann.id}>
                    <CardContent className="p-4 flex items-start gap-4">
                        {announcementIcons[ann.type]}
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{ann.title}</p>
                                <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this announcement.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(ann.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{ann.createdAt ? new Date(ann.createdAt as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        </div>
                    </CardContent>
                </Card>
            )) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg flex flex-col justify-center items-center min-h-[200px]">
                    <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No announcements yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Create one using the form above.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

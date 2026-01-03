'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createMessageThread } from '@/app/api/messages/message-actions';

interface NewThreadFormProps {
  courseId: string;
  enrollmentId: string;
}

export function NewThreadForm({ courseId, enrollmentId }: NewThreadFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a thread title',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createMessageThread(
        courseId,
        enrollmentId,
        title.trim(),
        description.trim() || undefined,
        user.id
      );

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Message thread created successfully',
        });
        router.push(`/student/${courseId}/messaging/${result.data?.id}`);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create thread',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Thread Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Question about Module 3 Problem Set"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          disabled={isLoading}
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {title.length}/200 characters
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide more context about your question or issue..."
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none min-h-32"
          disabled={isLoading}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {description.length}/1000 characters
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !title.trim()} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Thread
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

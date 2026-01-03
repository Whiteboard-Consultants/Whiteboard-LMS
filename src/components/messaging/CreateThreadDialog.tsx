'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createMessageThread } from '@/app/api/messages/message-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateThreadDialogProps {
  courseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onThreadCreated: () => void;
}

export default function CreateThreadDialog({
  courseId,
  isOpen,
  onOpenChange,
  onThreadCreated,
}: CreateThreadDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!title.trim()) {
      setError('Thread title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, we need to get the enrollment for this course
      // This requires getting the current user's enrollment
      const enrollmentResponse = await fetch(
        `/api/enrollments?courseId=${courseId}`,
        { method: 'GET' }
      );

      if (!enrollmentResponse.ok) {
        setError('Could not fetch your enrollment for this course');
        return;
      }

      const enrollmentData = await enrollmentResponse.json();
      const enrollmentId = enrollmentData.enrollment?.id;

      if (!enrollmentId) {
        setError('You are not enrolled in this course');
        return;
      }

      // Create the thread
      const response = await createMessageThread(
        courseId,
        enrollmentId,
        title.trim(),
        description.trim() || undefined,
        user.id
      );

      if (response.success) {
        setTitle('');
        setDescription('');
        setError(null);
        onOpenChange(false);
        onThreadCreated();
      } else {
        setError(response.error || 'Failed to create thread');
      }
    } catch (err) {
      setError('An error occurred while creating the thread');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message Thread</DialogTitle>
          <DialogDescription>
            Ask your instructor about course content or doubts
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thread Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Question about Chapter 3"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your question..."
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Thread'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

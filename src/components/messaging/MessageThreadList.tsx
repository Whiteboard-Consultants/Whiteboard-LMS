'use client';

import { useEffect, useState } from 'react';
import { MessageThread } from '@/types/messaging';
import { getMessageThreads } from '@/app/api/messages/message-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadListProps {
  courseId: string;
  onThreadSelect: (thread: MessageThread) => void;
  refreshTrigger: number;
}

export default function MessageThreadList({
  courseId,
  onThreadSelect,
  refreshTrigger,
}: MessageThreadListProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadThreads = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMessageThreads(courseId);
        if (response.success) {
          setThreads(response.data || []);
        } else {
          setError(response.error || 'Failed to load threads');
        }
      } catch (err) {
        setError('An error occurred while loading threads');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, [courseId, refreshTrigger]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading threads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No threads yet</p>
          <p className="text-sm text-gray-500 mt-1">Create a new thread to message your instructor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-r border-gray-200 overflow-y-auto bg-white">
      <div className="divide-y divide-gray-200">
        {threads.map((thread) => (
          <Button
            key={thread.id}
            variant="ghost"
            className="w-full justify-start rounded-none border-0 p-4 h-auto text-left hover:bg-gray-50"
            onClick={() => onThreadSelect(thread)}
          >
            <div className="w-full">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1 line-clamp-1">
                  {thread.title}
                </h3>
                {thread.is_closed && (
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    Closed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                {thread.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                </span>
                {/* unread count will be added here once notification system is integrated */}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

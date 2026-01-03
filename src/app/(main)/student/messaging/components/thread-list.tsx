'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  getMessageThreads,
  type MessageThread,
} from '@/app/api/messages/message-actions';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ThreadListProps {
  courseId?: string;
  onSelectThread?: (threadId: string) => void;
}

type SortOption = 'recent' | 'unread' | 'oldest';

export function ThreadList({ courseId, onSelectThread }: ThreadListProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      loadThreads();
    }
  }, [courseId, authLoading, user]);

  const loadThreads = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await getMessageThreads(courseId, user.id);
      if (result.success) {
        setThreads(result.data || []);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load threads',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading threads:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedThreads = threads
    .filter((thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'unread':
          // This would require tracking unread status in thread data
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="font-medium">No message threads yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation with your instructor to get help
          </p>
        </div>
        <Button asChild>
          <Link href={courseId ? `/student/${courseId}/messaging/new` : '#'}>
            <Plus className="h-4 w-4 mr-2" />
            New Message Thread
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm"
          />
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="unread">Unread First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button asChild variant="outline" className="gap-2">
        <Link href={courseId ? `/student/${courseId}/messaging/new` : '#'}>
          <Plus className="h-4 w-4" />
          New Thread
        </Link>
      </Button>

      <div className="space-y-2">
        {filteredAndSortedThreads.map((thread) => (
          <div
            key={thread.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSelectThread?.(thread.id)}
          >
            <Link
              href={courseId ? `/student/${courseId}/messaging/${thread.id}` : '#'}
              className="block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{thread.title}</h3>
                  {thread.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {thread.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                  </p>
                </div>
                {thread.is_closed && (
                  <div className="flex-shrink-0 bg-muted px-2 py-1 rounded text-xs font-medium">
                    Closed
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

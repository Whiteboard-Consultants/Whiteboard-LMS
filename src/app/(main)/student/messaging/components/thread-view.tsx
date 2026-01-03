'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getThreadMessages,
  type MessageThread,
  getMessageThreads,
} from '@/app/api/messages/message-actions';
import { MessageItem } from './message-item';
import { MessageCompose } from './message-compose';
import { useAuth } from '@/hooks/use-auth';

interface ThreadViewProps {
  threadId: string;
  courseId: string;
}

interface MessageData {
  id: string;
  body: string;
  created_at: string;
  read_at?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  student_id: string;
  instructor_id: string;
}

export function ThreadView({ threadId, courseId }: ThreadViewProps) {
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThreadAndMessages();
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreadAndMessages = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Load thread details
      const threadResult = await getMessageThreads(courseId, user.id);
      if (threadResult.success) {
        const foundThread = threadResult.data?.find((t) => t.id === threadId);
        if (foundThread) {
          setThread(foundThread);
        }
      }

      // Load messages
      const messagesResult = await getThreadMessages(threadId, user.id);
      if (messagesResult.success) {
        setMessages(messagesResult.data || []);
      } else {
        toast({
          title: 'Error',
          description: messagesResult.error || 'Failed to load messages',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading thread:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Thread not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="font-semibold text-lg">{thread.title}</h2>
        {thread.description && (
          <p className="text-sm text-muted-foreground mt-1">{thread.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {thread.is_closed && (
            <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-medium">
              Closed
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              senderName={
                message.student_id === user?.id
                  ? 'You'
                  : message.sender?.name || 'Instructor'
              }
              senderAvatar={message.sender?.avatar}
              body={message.body}
              timestamp={message.created_at}
              isRead={!!message.read_at}
              isOwnMessage={message.student_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Compose */}
      {!thread.is_closed ? (
        <MessageCompose
          threadId={threadId}
          onMessageSent={loadThreadAndMessages}
        />
      ) : (
        <div className="border-t p-4 text-center text-sm text-muted-foreground">
          This thread is closed. You cannot send new messages.
        </div>
      )}
    </div>
  );
}

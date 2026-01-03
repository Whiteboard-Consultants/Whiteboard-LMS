import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Message, MessageThread } from '@/types/messaging';
import {
  getThreadMessages,
  sendMessage,
  getMessageThreads,
  createMessageThread,
} from '@/app/api/messages/message-actions';

// Hook for managing messages in a thread
export function useThreadMessages(threadId: string, autoRefresh = true) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadMessages = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getThreadMessages(threadId, user.id);
      if (response.success) {
        setMessages(response.data || []);
      } else {
        setError(response.error || 'Failed to load messages');
      }
    } catch (err) {
      setError('An error occurred while loading messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [threadId, user?.id]);

  useEffect(() => {
    loadMessages();

    if (autoRefresh) {
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [loadMessages, autoRefresh]);

  const handleSendMessage = useCallback(
    async (body: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const response = await sendMessage(threadId, body, user.id);
        if (response.success) {
          await loadMessages();
          return { success: true };
        } else {
          return { success: false, error: response.error };
        }
      } catch (err) {
        return {
          success: false,
          error: 'Failed to send message',
        };
      }
    },
    [threadId, loadMessages, user?.id]
  );

  return {
    messages,
    loading,
    error,
    sendMessage: handleSendMessage,
    refresh: loadMessages,
  };
}

// Hook for managing message threads
export function useMessageThreads(courseId: string, autoRefresh = false) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMessageThreads(courseId, user?.id);
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
  }, [courseId, user?.id]);

  useEffect(() => {
    loadThreads();

    if (autoRefresh) {
      const interval = setInterval(loadThreads, 5000);
      return () => clearInterval(interval);
    }
  }, [loadThreads, autoRefresh]);

  const handleCreateThread = useCallback(
    async (enrollmentId: string, title: string, description?: string) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const response = await createMessageThread(
          courseId,
          enrollmentId,
          title,
          description || undefined,
          user.id
        );
        if (response.success) {
          await loadThreads();
          return { success: true, data: response.data };
        } else {
          return { success: false, error: response.error };
        }
      } catch (err) {
        return {
          success: false,
          error: 'Failed to create thread',
        };
      }
    },
    [courseId, loadThreads, user?.id]
  );

  return {
    threads,
    loading,
    error,
    createThread: handleCreateThread,
    refresh: loadThreads,
  };
}

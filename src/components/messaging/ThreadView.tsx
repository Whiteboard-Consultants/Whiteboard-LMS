'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Message, MessageThread } from '@/types/messaging';
import { getThreadMessages, sendMessage } from '@/app/api/messages/message-actions';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ThreadViewProps {
  thread: MessageThread;
  onBack: () => void;
  refreshTrigger: number;
}

export default function ThreadView({ thread, onBack, refreshTrigger }: ThreadViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Load messages on mount and set up polling
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getThreadMessages(thread.id, user.id);
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
    };

    loadMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    setPollInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [thread.id, refreshTrigger]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!messageInput.trim() || sending) return;

    setSending(true);
    try {
      const response = await sendMessage(thread.id, messageInput.trim(), user.id);
      if (response.success) {
        setMessageInput('');
        // Reload messages after sending
        const messagesResponse = await getThreadMessages(thread.id, user.id);
        if (messagesResponse.success) {
          setMessages(messagesResponse.data || []);
        }
      } else {
        setError(response.error || 'Failed to send message');
      }
    } catch (err) {
      setError('An error occurred while sending the message');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{thread.title}</h2>
            <p className="text-sm text-gray-500">{thread.description}</p>
          </div>
          {thread.is_closed && (
            <div className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
              Closed
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words">{message.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === user?.id
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      {!thread.is_closed && (
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 p-4 bg-white"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <Button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
      )}

      {thread.is_closed && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">This thread is closed</p>
        </div>
      )}
    </div>
  );
}

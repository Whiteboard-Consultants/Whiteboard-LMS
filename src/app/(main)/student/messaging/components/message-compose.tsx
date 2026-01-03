'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/app/api/messages/message-actions';
import { useToast } from '@/hooks/use-toast';

interface MessageComposeProps {
  threadId: string;
  onMessageSent?: () => void;
}

export function MessageCompose({ threadId, onMessageSent }: MessageComposeProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message before sending.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendMessage(threadId, message.trim(), user.id);

      if (result.success) {
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        toast({
          title: 'Message sent',
          description: 'Your message has been sent to your instructor.',
        });
        onMessageSent?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    <form onSubmit={handleSend} className="border-t p-4 space-y-3">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        placeholder="Type your message here..."
        className="resize-none min-h-[100px]"
        disabled={isLoading}
      />
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {message.length} characters
      </p>
    </form>
  );
}

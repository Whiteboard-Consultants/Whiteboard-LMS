'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getThreadMessages, sendMessage, closeMessageThread } from '../actions';
import type { MessageThread } from '@/types/messaging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ThreadData {
  thread: MessageThread;
  messages: any[];
}

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userData } = useAuth();
  
  const threadId = params.threadId as string;
  const [data, setData] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadThread();
  }, [threadId, userData]);

  const loadThread = async () => {
    if (!userData?.id) return;
    
    setLoading(true);
    try {
      // This would require fetching from database
      // For now, redirect to main messages page
      router.push('/instructor/messages');
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.push('/instructor/messages')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Messages
      </Button>
      
      {/* This page uses client-side routing from the main page */}
      <Card>
        <CardContent className="pt-6 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Please select a thread from the messages list</p>
        </CardContent>
      </Card>
    </div>
  );
}

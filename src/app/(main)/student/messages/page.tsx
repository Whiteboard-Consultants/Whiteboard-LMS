'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import { MessageSquare, Send, Loader2, ArrowLeft, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  getStudentMessageThreads,
  getThreadMessages,
  sendStudentMessage,
  getCourseInfo,
  getInstructorInfo,
} from './actions';

interface Thread {
  id: string;
  course_id: string;
  enrollment_id: string;
  title: string;
  description?: string;
  instructor_id: string;
  student_id: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface ThreadWithCourse extends Thread {
  courseTitle?: string;
  instructorName?: string;
}

export default function StudentMessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [threads, setThreads] = useState<ThreadWithCourse[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadWithCourse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchThreads = async () => {
      try {
        setLoading(true);
        const result = await getStudentMessageThreads(user.id);

        console.log('[FRONTEND] Threads result:', result);

        if (!result.success) {
          console.error('Error fetching threads:', result.error);
          setThreads([]);
          return;
        }

        console.log('[FRONTEND] Setting threads:', result.data);
        setThreads(result.data as ThreadWithCourse[]);
      } catch (error) {
        console.error('Error in fetchThreads:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load message threads',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [user, authLoading, router, toast]);

  const handleThreadSelect = async (thread: ThreadWithCourse) => {
    setSelectedThread(thread);
    setMessages([]);
    setMessageText('');

    try {
      setLoadingMessages(true);
      const result = await getThreadMessages(thread.id, user?.id);

      if (result.success) {
        setMessages(result.data || []);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load messages',
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedThread || !messageText.trim() || !user) return;

    try {
      setSendingMessage(true);
      const result = await sendStudentMessage(selectedThread.id, messageText, user.id);

      if (result.success) {
        setMessageText('');
        // Reload messages
        const messagesResult = await getThreadMessages(selectedThread.id, user.id);
        if (messagesResult.success) {
          setMessages(messagesResult.data || []);
        }
        toast({
          title: 'Message sent!',
          description: 'Your message has been sent to the instructor.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to send message',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.instructorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByStatus = {
    open: filteredThreads.filter((t) => !t.is_closed),
    closed: filteredThreads.filter((t) => t.is_closed),
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-1/2 bg-muted animate-pulse rounded" />
        <div className="h-96 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title="My Messages"
        description="View and respond to messages from your instructors"
      />

      {threads.length === 0 && !loading ? (
        <Card>
          <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't received any messages from instructors yet.
            </p>
            <Button asChild variant="outline">
              <Link href="/student/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Thread List - Sidebar */}
          <Card className="lg:col-span-1 flex flex-col bg-gradient-to-b from-blue-50 dark:from-slate-800/50 to-background border-blue-200 dark:border-slate-700">
            <CardHeader className="border-b border-blue-200 dark:border-slate-600 pb-4 bg-blue-50/50 dark:bg-slate-800/30">
              <CardTitle className="text-base text-blue-900 dark:text-blue-100">Conversations</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b">
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Thread List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1 p-3">
                    {/* Open Threads */}
                    {groupedByStatus.open.length > 0 && (
                      <>
                        <div className="px-2 py-3">
                          <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                            Open Threads
                          </h4>
                        </div>
                        {groupedByStatus.open.map((thread) => (
                          <button
                            key={thread.id}
                            onClick={() => handleThreadSelect(thread)}
                            className={cn(
                              'w-full text-left p-3 rounded-lg transition-all duration-200 border',
                              selectedThread?.id === thread.id
                                ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 shadow-sm'
                                : 'border-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                            )}
                          >
                            <div className="space-y-2">
                              <p className="font-semibold text-sm leading-tight line-clamp-2">{thread.title}</p>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground truncate">{thread.courseTitle}</p>
                                <p className="text-xs text-muted-foreground truncate">with {thread.instructorName}</p>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(thread.updated_at), { addSuffix: true })}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Closed Threads */}
                    {groupedByStatus.closed.length > 0 && (
                      <>
                        <div className="px-2 py-3 mt-4">
                          <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            Closed Threads
                          </h4>
                        </div>
                        {groupedByStatus.closed.map((thread) => (
                          <button
                            key={thread.id}
                            onClick={() => handleThreadSelect(thread)}
                            className={cn(
                              'w-full text-left p-3 rounded-lg transition-all duration-200 border opacity-70 hover:opacity-100',
                              selectedThread?.id === thread.id
                                ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 shadow-sm'
                                : 'border-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            )}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{thread.title}</p>
                                <Badge variant="secondary" className="flex-shrink-0 text-xs">
                                  Closed
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground truncate">{thread.courseTitle}</p>
                                <p className="text-xs text-muted-foreground truncate">with {thread.instructorName}</p>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(thread.updated_at), { addSuffix: true })}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {filteredThreads.length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-xs text-muted-foreground">No threads match your search</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="lg:col-span-3 flex flex-col bg-gradient-to-br from-purple-50 dark:from-slate-800/50 to-background border-purple-200 dark:border-slate-700">
            {selectedThread ? (
              <>
                {/* Header */}
                <CardHeader className="border-b border-purple-200 dark:border-slate-600 bg-gradient-to-r from-purple-100/50 dark:from-slate-700/50 to-transparent">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl">{selectedThread.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedThread.courseTitle}
                        </p>
                      </div>
                      <Badge variant={!selectedThread.is_closed ? 'default' : 'secondary'}>
                        {!selectedThread.is_closed ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    
                    {selectedThread.description && (
                      <p className="text-sm text-muted-foreground bg-white dark:bg-slate-950 p-3 rounded-lg border">
                        {selectedThread.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Instructor:</span>
                      <span>{selectedThread.instructorName}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-muted/30 to-background">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isStudentMessage = message.sender_id === user?.id;
                        return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300',
                            isStudentMessage ? 'flex-row-reverse' : 'flex-row'
                          )}
                        >
                          {/* Avatar */}
                          <div className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                            isStudentMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-100'
                          )}>
                            {isStudentMessage ? 'You' : 'Inst'}
                          </div>

                          {/* Message Bubble */}
                          <div className={cn(
                            'flex flex-col max-w-xs lg:max-w-md',
                            isStudentMessage ? 'items-end' : 'items-start'
                          )}>
                            <div
                              className={cn(
                                'px-4 py-3 rounded-2xl shadow-sm',
                                isStudentMessage
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-white dark:bg-slate-800 text-foreground border rounded-bl-sm'
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 px-1">
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                      })
                    )}
                  </div>

                  {/* Reply Input */}
                  {!selectedThread.is_closed ? (
                    <div className="border-t bg-muted/30 p-4 space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="resize-none border-0 bg-white dark:bg-slate-900"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setMessageText('')}
                          disabled={sendingMessage || !messageText.trim()}
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendingMessage}
                          className="gap-2"
                        >
                          {sendingMessage && <Loader2 className="h-4 w-4 animate-spin" />}
                          <Send className="h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t bg-amber-50 dark:bg-amber-950/20 p-4">
                      <p className="text-sm text-amber-900 dark:text-amber-200">
                        🔒 This thread is closed. No new messages can be sent.
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground mb-2">No conversation selected</p>
                  <p className="text-sm text-muted-foreground">Choose a message from the left to start</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

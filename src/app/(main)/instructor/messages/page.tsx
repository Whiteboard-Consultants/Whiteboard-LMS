'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getMessageThreads, getThreadMessages, getUnreadNotifications, markNotificationAsRead } from './actions';
import type { MessageThread } from '@/types/messaging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Search, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function InstructorMessagesPage() {
  const router = useRouter();
  const { userData } = useAuth();
  
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<MessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userData?.id) return;
    loadThreads();
  }, [userData?.id]);

  const loadThreads = async () => {
    if (!userData?.id) return;
    
    setLoading(true);
    try {
      const result = await getMessageThreads(undefined, userData.id);
      if (result.success && result.data) {
        // Filter to only show threads where user is instructor
        const instructorThreads = result.data.filter((t: MessageThread) => t.instructor_id === userData.id);
        // Sort by most recent first
        instructorThreads.sort((a: MessageThread, b: MessageThread) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setThreads(instructorThreads);
        setFilteredThreads(instructorThreads);
        
        // Select first thread by default
        if (instructorThreads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(instructorThreads[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter threads based on search
    const filtered = threads.filter(thread => 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredThreads(filtered);
  }, [searchQuery, threads]);

  const handleThreadSelect = async (threadId: string) => {
    setSelectedThreadId(threadId);
    router.push(`/instructor/messages/${threadId}`);
  };

  const openThread = threads.find(t => !t.is_closed);
  const closedCount = threads.filter(t => t.is_closed).length;
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Student Messages</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and respond to messages from your enrolled students
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-50 dark:from-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{threads.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{openThread ? 1 : 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 dark:from-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{closedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Thread List */}
        <Card className="w-full md:w-80 flex flex-col bg-gradient-to-b from-blue-50 dark:from-slate-800/50 to-background border-blue-200 dark:border-slate-700">
          <CardHeader className="border-b border-blue-200 dark:border-slate-600 pb-4 bg-blue-50/50 dark:bg-slate-800/30">
            <CardTitle className="text-base text-blue-900 dark:text-blue-100">Student Threads</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No threads match your search' : 'No messages yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => handleThreadSelect(thread.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all duration-200 border',
                    selectedThreadId === thread.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow-sm'
                      : 'border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2 flex-1">{thread.title}</h3>
                      {thread.is_closed && (
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">Closed</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {thread.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(thread.updated_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          </CardContent>
        </Card>

        {/* Thread View */}
        <Card className="flex-1 min-w-0 bg-gradient-to-br from-purple-50 dark:from-slate-800/50 to-background border-purple-200 dark:border-slate-700">
          {selectedThreadId ? (
            <ThreadView threadId={selectedThreadId} instructorId={userData?.id} onThreadUpdated={loadThreads} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">No conversation selected</p>
                <p className="text-sm text-muted-foreground">Choose a thread from the left to start</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Thread View Component
function ThreadView({ threadId, instructorId, onThreadUpdated }: { threadId: string; instructorId?: string; onThreadUpdated: () => void }) {
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadThread = async () => {
    if (!instructorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get thread details
      const threadsResult = await getMessageThreads(undefined, instructorId);
      if (threadsResult.success && threadsResult.data) {
        const currentThread = threadsResult.data.find((t: MessageThread) => t.id === threadId);
        setThread(currentThread || null);
      }

      // Get messages
      const messagesResult = await getThreadMessages(threadId, instructorId);
      if (messagesResult.success && messagesResult.data) {
        setMessages(messagesResult.data);
      }
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!instructorId || !threadId) return;
    loadThread();
  }, [threadId, instructorId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !instructorId) return;

    setSending(true);
    try {
      const { sendMessage } = await import('./actions');
      const result = await sendMessage(threadId, replyText, instructorId);
      if (result.success) {
        setReplyText('');
        await loadThread();
        onThreadUpdated();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCloseThread = async () => {
    if (!window.confirm('Are you sure you want to close this thread? Students can still read it but won\'t be able to reply.')) {
      return;
    }

    try {
      const { closeMessageThread } = await import('./actions');
      const result = await closeMessageThread(threadId);
      if (result.success) {
        await loadThread();
        onThreadUpdated();
      }
    } catch (error) {
      console.error('Error closing thread:', error);
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!thread) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Thread not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Thread Header */}
      <CardHeader className="border-b border-purple-200 dark:border-slate-600 bg-gradient-to-r from-purple-100/50 dark:from-slate-700/50 to-transparent pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{thread.title}</CardTitle>
            <CardDescription className="mt-1">{thread.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!thread.is_closed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseThread}
              >
                Close Thread
              </Button>
            )}
            {thread.is_closed && (
              <Badge variant="secondary">Closed</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-indigo-50 dark:from-slate-800/30 to-background">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground text-sm">No messages yet</p>
            </div>
          </div>
        ) : (
          messages.map((message: any) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300',
                message.sender_id === instructorId ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                message.sender_id === instructorId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-100'
              )}>
                {message.sender_id === instructorId ? 'You' : 'Stud'}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                'flex flex-col max-w-xs lg:max-w-md',
                message.sender_id === instructorId ? 'items-end' : 'items-start'
              )}>
                <div
                  className={cn(
                    'px-4 py-3 rounded-2xl shadow-sm',
                    message.sender_id === instructorId
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-foreground border rounded-bl-sm'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Reply Box */}
      {!thread.is_closed ? (
        <div className="border-t border-purple-200 dark:border-slate-600 p-6 bg-gradient-to-r from-blue-50/50 dark:from-slate-700/30 to-transparent">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Send a reply</p>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:focus:ring-offset-0 resize-none"
              rows={3}
              disabled={sending}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReplyText('')}
                disabled={sending}
              >
                Clear
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!replyText.trim() || sending}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="border-t border-amber-200 dark:border-amber-900/50 p-6 bg-gradient-to-r from-amber-50/50 dark:from-amber-900/10 to-transparent text-center">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            This thread is closed. You cannot reply to closed threads.
          </p>
        </div>
      )}
    </Card>
  );
}

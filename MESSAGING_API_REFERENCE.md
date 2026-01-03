// Quick Reference Guide for Messaging API

import {
  createMessageThread,
  getMessageThreads,
  closeMessageThread,
  sendMessage,
  getThreadMessages,
  searchMessages,
  addMessageAttachment,
  getMessageAttachments,
  getUnreadNotifications,
  markNotificationAsRead,
  setTypingIndicator,
  clearTypingIndicator,
  getTypingIndicators,
} from '@/app/api/messages/message-actions';

// ============================================================================
// THREAD OPERATIONS
// ============================================================================

// Student: Create a new thread
// Automatically:
// - Verifies student is enrolled
// - Sets instructor from course
// - Creates notification for instructor
async function startNewThread() {
  const result = await createMessageThread(
    courseId,           // UUID of the course
    enrollmentId,       // UUID of student's enrollment
    'Title of Issue',   // Thread subject
    'Optional description or problem summary'
  );

  if (result.success) {
    const threadId = result.data?.id;
    // Redirect to thread view
  }
}

// Get all threads (filtered by current user)
// Returns:
// - Student sees: only their threads
// - Instructor sees: all threads for their courses
async function loadThreads() {
  const result = await getMessageThreads(courseId);
  
  if (result.success) {
    const threads = result.data;
    threads.forEach(thread => {
      console.log(thread.title, thread.created_at, thread.is_closed);
    });
  }
}

// Instructor: Close a thread
async function resolveThread(threadId: string) {
  const result = await closeMessageThread(threadId);
  
  if (result.success) {
    console.log('Thread closed');
    // Update UI
  }
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

// Send a message (student or instructor)
// Automatically:
// - Creates notification for recipient
// - Clears typing indicator
async function replyInThread(threadId: string, message: string) {
  const result = await sendMessage(threadId, message);
  
  if (result.success) {
    const newMessage = result.data;
    console.log('Message sent:', newMessage.id);
    
    // Clear input field
    // Add message to UI
  }
}

// Get all messages in a thread
// Automatically:
// - Marks unread messages as read
// - Records read_at timestamp
async function loadThreadMessages(threadId: string) {
  const result = await getThreadMessages(threadId);
  
  if (result.success) {
    const messages = result.data;
    messages.forEach(msg => {
      console.log(msg.sender_id, msg.body, msg.is_read);
    });
  }
}

// Search within a thread
async function findInThread(threadId: string, searchTerm: string) {
  const result = await searchMessages(threadId, searchTerm);
  
  if (result.success) {
    const matches = result.data;
    console.log(`Found ${matches.length} messages matching "${searchTerm}"`);
  }
}

// ============================================================================
// FILE ATTACHMENTS
// ============================================================================

// Add attachment to a message
// Params:
// - messageId: UUID of the message
// - fileUrl: URL from Supabase Storage (upload separately)
// - fileName: Display name
// - fileType: MIME type (e.g., "application/pdf")
// - fileSize: Bytes
async function attachFile(messageId: string, file: File) {
  // First upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('message-attachments')
    .upload(`${threadId}/${messageId}/${file.name}`, file);
  
  if (!error) {
    // Then create attachment record
    const result = await addMessageAttachment(
      messageId,
      data.path,
      file.name,
      file.type,
      file.size
    );
  }
}

// Get attachments from a message
async function loadAttachments(messageId: string) {
  const result = await getMessageAttachments(messageId);
  
  if (result.success) {
    const files = result.data;
    files.forEach(file => {
      console.log(file.file_name, file.file_size);
    });
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

// Get unread notifications
// Returns:
// - new_thread: Student created thread
// - new_message: Someone sent you a message
// - thread_closed: Instructor closed thread
async function checkNotifications() {
  const result = await getUnreadNotifications();
  
  if (result.success) {
    const notifications = result.data;
    console.log(`${notifications.length} unread notifications`);
    
    notifications.forEach(notif => {
      // notif.notification_type: 'new_thread' | 'new_message' | 'thread_closed'
      // notif.thread_id: link to thread
      // notif.message_id: link to specific message
    });
  }
}

// Mark notification as read
async function readNotification(notificationId: string) {
  const result = await markNotificationAsRead(notificationId);
  
  if (result.success) {
    // Notification no longer unread
  }
}

// Example: Auto-load notifications on mount
// useEffect(() => {
//   const interval = setInterval(async () => {
//     const result = await getUnreadNotifications();
//     setUnreadCount(result.data?.length || 0);
//   }, 5000); // Poll every 5 seconds
//
//   return () => clearInterval(interval);
// }, []);

// ============================================================================
// TYPING INDICATORS
// ============================================================================

// User starts typing (call while typing in input)
// NOTE: Don't spam this - call every 1-2 seconds is fine
async function onUserStartsTyping(threadId: string) {
  // Call this in onChange of input field
  // But debounce it to not spam database
  const debounced = debounce(() => {
    setTypingIndicator(threadId);
  }, 1000);
}

// User stops typing (call on blur or after a delay)
async function onUserStopsTyping(threadId: string) {
  const result = await clearTypingIndicator(threadId);
}

// Get who's typing in a thread
// The function auto-deletes stale indicators (older than 5 seconds)
// So stale data is automatically cleaned up
async function pollTypingStatus(threadId: string) {
  const result = await getTypingIndicators(threadId);
  
  if (result.success) {
    const typingUserIds = result.data; // Array of user IDs
    console.log('Currently typing:', typingUserIds);
    
    // Display: "John is typing..."
  }
}

// Example: Poll typing every 1 second
// useEffect(() => {
//   const interval = setInterval(() => {
//     pollTypingStatus(threadId);
//   }, 1000);
//
//   return () => clearInterval(interval);
// }, [threadId]);

// ============================================================================
// UI STATE MANAGEMENT EXAMPLE
// ============================================================================

interface ThreadState {
  threads: MessageThread[];
  selectedThread: MessageThread | null;
  messages: Message[];
  typingUsers: string[];
  unreadNotifications: number;
  loading: boolean;
}

// Hook for managing thread operations
function useMessageThread(threadId: string) {
  const [state, setState] = useState<ThreadState>({
    threads: [],
    selectedThread: null,
    messages: [],
    typingUsers: [],
    unreadNotifications: 0,
    loading: false,
  });

  // Load messages when thread opens
  useEffect(() => {
    if (!threadId) return;
    
    setState(prev => ({ ...prev, loading: true }));
    getThreadMessages(threadId).then(result => {
      if (result.success) {
        setState(prev => ({
          ...prev,
          messages: result.data || [],
          loading: false,
        }));
      }
    });
  }, [threadId]);

  // Poll typing indicators
  useEffect(() => {
    if (!threadId) return;
    
    const interval = setInterval(async () => {
      const result = await getTypingIndicators(threadId);
      if (result.success) {
        setState(prev => ({
          ...prev,
          typingUsers: result.data || [],
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [threadId]);

  // Send message handler
  const handleSendMessage = async (body: string) => {
    await clearTypingIndicator(threadId);
    const result = await sendMessage(threadId, body);
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, result.data!],
      }));
    }
  };

  return {
    ...state,
    sendMessage: handleSendMessage,
  };
}

// ============================================================================
// ERROR HANDLING EXAMPLE
// ============================================================================

async function sendMessageWithErrorHandling(
  threadId: string,
  message: string
) {
  try {
    const result = await sendMessage(threadId, message);
    
    if (!result.success) {
      // Handle specific errors
      if (result.error?.includes('not authenticated')) {
        // Redirect to login
      } else if (result.error?.includes('Unauthorized')) {
        // Show: "You don't have access to this thread"
      } else {
        // Generic error
        toast.error(`Failed to send: ${result.error}`);
      }
      return;
    }
    
    // Success
    toast.success('Message sent');
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Something went wrong');
  }
}

// ============================================================================
// INTEGRATION WITH COURSE PAGE EXAMPLE
// ============================================================================

// In student course page:
// <Button onClick={() => router.push(`/student/${courseId}/messaging`)}>
//   Message Instructor
// </Button>

// Show notification badge if unread:
// const result = await getUnreadNotifications();
// const unreadCount = result.data?.filter(n => n.thread_id === currentThread).length || 0;
// <Badge variant="destructive">{unreadCount}</Badge>

// ============================================================================
// BEST PRACTICES
// ============================================================================

// 1. Debounce typing indicator
const debouncedTyping = debounce(
  (threadId) => setTypingIndicator(threadId),
  1000
);

// 2. Auto-clear typing when user stops
// Use onBlur or inactivity timer (3 seconds)
const typingTimeout = useRef<NodeJS.Timeout>();

const handleInputChange = (value: string) => {
  setMessage(value);
  
  clearTimeout(typingTimeout.current);
  debouncedTyping(threadId);
  
  typingTimeout.current = setTimeout(() => {
    clearTypingIndicator(threadId);
  }, 3000);
};

// 3. Poll notifications and typing
// Not real-time but acceptable per requirements
// Polling intervals:
// - Typing: 1 second (responsive)
// - Notifications: 5 seconds (less frequent)
// - Messages: load on demand + manual refresh

// 4. Handle read receipts
// Auto-mark as read when messages are loaded
// Show "Seen at X:XX PM" for read messages
// Don't show for unread (current user messages)

// 5. Graceful error handling
// User not authenticated → redirect to login
// User not enrolled → show "Unauthorized"
// Thread closed → show "This conversation is closed"
// Database error → "Something went wrong, try again"

// Types for the Messaging System

export type NotificationType = 'new_thread' | 'new_message' | 'thread_closed';

export interface MessageThread {
  id: string;
  course_id: string;
  enrollment_id: string;
  student_id: string;
  instructor_id: string;
  title: string;
  description?: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export interface MessageNotification {
  id: string;
  user_id: string;
  thread_id: string;
  message_id?: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface TypingIndicator {
  id: string;
  thread_id: string;
  user_id: string;
  created_at: string;
}

// Extended types with related data

export interface ThreadWithDetails extends MessageThread {
  studentName?: string;
  studentEmail?: string;
  courseName?: string;
  messageCount?: number;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface MessageWithDetails extends Message {
  senderName?: string;
  senderAvatar?: string;
  attachments?: MessageAttachment[];
  recipientName?: string;
  recipientAvatar?: string;
}

export interface ThreadWithMessages extends MessageThread {
  messages: MessageWithDetails[];
  studentName?: string;
  instructorName?: string;
}

// Action response types

export interface ActionResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// UI Component Props Types

export interface MessageThreadListProps {
  courseId?: string;
  threads: ThreadWithDetails[];
  loading?: boolean;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  selectedThreadId?: string;
}

export interface MessageThreadViewProps {
  threadId: string;
  thread: ThreadWithDetails;
  messages: MessageWithDetails[];
  currentUserId: string;
  onSendMessage: (message: string) => Promise<void>;
  onUploadAttachment: (file: File) => Promise<string>;
  typingUsers: string[];
  loading?: boolean;
}

export interface ComposeMessageProps {
  threadId: string;
  onSend: (message: string, attachments: File[]) => Promise<void>;
  onTyping: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface NotificationCenterProps {
  notifications: MessageNotification[];
  onNotificationClick: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  unreadCount: number;
}

// Filter/Sort types

export type ThreadSortBy = 'recent' | 'oldest' | 'unread' | 'alphabetical';
export type ThreadFilter = 'all' | 'open' | 'closed' | 'unread';

export interface ThreadFilterOptions {
  courseId?: string;
  filter: ThreadFilter;
  sortBy: ThreadSortBy;
  searchQuery?: string;
}

// Pagination for large message lists

export interface MessagePaginationParams {
  threadId: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedMessages {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

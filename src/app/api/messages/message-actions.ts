'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// MESSAGE THREAD ACTIONS
// ============================================================================

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

export async function createMessageThread(
  courseId: string,
  enrollmentId: string,
  title: string,
  description?: string,
  userId?: string
) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: null };
    }

    // Get enrollment to verify student and find instructor
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .select('user_id, instructor_id, course_id')
      .eq('id', enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      return { success: false, error: 'Enrollment not found', data: null };
    }

    // Verify user is the enrolled student
    if (enrollment.user_id !== userId) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    // Get instructor from course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return { success: false, error: 'Course not found', data: null };
    }

    // Create thread
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('message_threads')
      .insert({
        course_id: courseId,
        enrollment_id: enrollmentId,
        student_id: userId,
        instructor_id: course.instructor_id,
        title,
        description,
      })
      .select()
      .single();

    if (threadError) {
      console.error('Error creating thread:', threadError);
      return { success: false, error: threadError.message, data: null };
    }

    // Create notification for instructor
    await supabaseAdmin
      .from('message_notifications')
      .insert({
        user_id: course.instructor_id,
        thread_id: thread.id,
        notification_type: 'new_thread',
      });

    return { success: true, data: thread, error: null };
  } catch (error) {
    console.error('Unexpected error creating thread:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function getMessageThreads(courseId?: string, userId?: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: null };
    }

    let query = supabaseAdmin
      .from('message_threads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: threads, error } = await query;

    if (error) {
      console.error('Error fetching threads:', error);
      return { success: false, error: error.message, data: null };
    }

    // Filter based on user role
    const filteredThreads = threads?.filter(thread => {
      return thread.student_id === userId || thread.instructor_id === userId;
    }) || [];

    return { success: true, data: filteredThreads, error: null };
  } catch (error) {
    console.error('Unexpected error fetching threads:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function closeMessageThread(threadId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    // Verify user is the instructor
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('message_threads')
      .select('instructor_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread || thread.instructor_id !== user.id) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    const { data: updated, error } = await supabaseAdmin
      .from('message_threads')
      .update({ is_closed: true })
      .eq('id', threadId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: updated, error: null };
  } catch (error) {
    console.error('Unexpected error closing thread:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

// ============================================================================
// MESSAGE ACTIONS
// ============================================================================

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

export async function sendMessage(threadId: string, body: string, userId?: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: null };
    }

    // Verify thread exists and user is part of it
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('message_threads')
      .select('student_id, instructor_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return { success: false, error: 'Thread not found', data: null };
    }

    if (thread.student_id !== userId && thread.instructor_id !== userId) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    // Create message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: userId,
        body,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      return { success: false, error: messageError.message, data: null };
    }

    // Create notification for recipient
    const recipientId = userId === thread.student_id ? thread.instructor_id : thread.student_id;
    await supabaseAdmin
      .from('message_notifications')
      .insert({
        user_id: recipientId,
        thread_id: threadId,
        message_id: message.id,
        notification_type: 'new_message',
      });

    // Clear typing indicator
    await supabaseAdmin
      .from('typing_indicators')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    return { success: true, data: message, error: null };
  } catch (error) {
    console.error('Unexpected error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function getThreadMessages(threadId: string, userId?: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: null };
    }

    // Verify user is part of thread
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('message_threads')
      .select('student_id, instructor_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return { success: false, error: 'Thread not found', data: null };
    }

    if (thread.student_id !== userId && thread.instructor_id !== userId) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    // Get messages
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    // Mark unread messages as read
    const unreadMessageIds = messages
      ?.filter(m => !m.is_read && m.sender_id !== userId)
      .map(m => m.id) || [];

    if (unreadMessageIds.length > 0) {
      await supabaseAdmin
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadMessageIds);
    }

    return { success: true, data: messages || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching messages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function searchMessages(threadId: string, query: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    // Verify user is part of thread
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('message_threads')
      .select('student_id, instructor_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return { success: false, error: 'Thread not found', data: null };
    }

    if (thread.student_id !== user.id && thread.instructor_id !== user.id) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    // Search messages using ilike (case-insensitive LIKE)
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .ilike('body', `%${query}%`)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: messages || [], error: null };
  } catch (error) {
    console.error('Unexpected error searching messages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

// ============================================================================
// ATTACHMENT ACTIONS
// ============================================================================

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

export async function addMessageAttachment(
  messageId: string,
  fileUrl: string,
  fileName: string,
  fileType?: string,
  fileSize?: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    // Verify message belongs to user
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message || message.sender_id !== user.id) {
      return { success: false, error: 'Unauthorized', data: null };
    }

    // Add attachment
    const { data: attachment, error } = await supabaseAdmin
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: attachment, error: null };
  } catch (error) {
    console.error('Unexpected error adding attachment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function getMessageAttachments(messageId: string) {
  try {
    const { data: attachments, error } = await supabaseAdmin
      .from('message_attachments')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: attachments || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching attachments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

// ============================================================================
// NOTIFICATION ACTIONS
// ============================================================================

export interface MessageNotification {
  id: string;
  user_id: string;
  thread_id: string;
  message_id?: string;
  notification_type: 'new_thread' | 'new_message' | 'thread_closed';
  is_read: boolean;
  created_at: string;
}

export async function getUnreadNotifications() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('message_notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: notifications || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { data: notification, error: updateError } = await supabaseAdmin
      .from('message_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message, data: null };
    }

    return { success: true, data: notification, error: null };
  } catch (error) {
    console.error('Unexpected error marking notification as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

// ============================================================================
// TYPING INDICATOR ACTIONS
// ============================================================================

export async function setTypingIndicator(threadId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    // Check if indicator already exists
    const { data: existing } = await supabaseAdmin
      .from('typing_indicators')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      await supabaseAdmin
        .from('typing_indicators')
        .insert({
          thread_id: threadId,
          user_id: user.id,
        });
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error setting typing indicator:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function clearTypingIndicator(threadId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    await supabaseAdmin
      .from('typing_indicators')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', user.id);

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error clearing typing indicator:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getTypingIndicators(threadId: string) {
  try {
    // Delete stale indicators (older than 5 seconds)
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    await supabaseAdmin
      .from('typing_indicators')
      .delete()
      .lt('created_at', fiveSecondsAgo);

    // Get active indicators
    const { data: indicators, error } = await supabaseAdmin
      .from('typing_indicators')
      .select('user_id')
      .eq('thread_id', threadId);

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return {
      success: true,
      data: indicators?.map(ind => ind.user_id) || [],
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error fetching typing indicators:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

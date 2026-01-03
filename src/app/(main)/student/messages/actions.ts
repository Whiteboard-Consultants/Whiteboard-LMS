'use server';

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getStudentMessageThreads(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID required', data: [] };
  }

  if (!supabaseAdmin) {
    return { success: false, error: 'Admin client not available', data: [] };
  }

  try {
    console.log('[SERVER ACTION] getStudentMessageThreads called for user:', userId);
    
    // Fetch all message threads where user is a student
    const { data: threads, error } = await supabaseAdmin
      .from('message_threads')
      .select('*')
      .eq('student_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[SERVER ACTION] Error fetching message threads:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('[SERVER ACTION] Successfully fetched', threads?.length || 0, 'message threads:', threads);

    // Enrich each thread with course and instructor info
    if (threads && threads.length > 0) {
      const enrichedThreads = await Promise.all(
        threads.map(async (thread) => {
          const courseResult = await getCourseInfo(thread.course_id);
          const instructorResult = await getInstructorInfo(thread.instructor_id);
          
          return {
            ...thread,
            courseTitle: courseResult.data?.title || 'Unknown Course',
            instructorName: instructorResult.data?.name || 'Unknown Instructor',
          };
        })
      );
      
      console.log('[SERVER ACTION] Enriched threads:', enrichedThreads);
      return { success: true, error: null, data: enrichedThreads || [] };
    }

    return { success: true, error: null, data: threads || [] };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getStudentMessageThreads:', error);
    return { success: false, error: String(error), data: [] };
  }
}

export async function getThreadMessages(threadId: string, userId?: string) {
  if (!threadId) {
    return { success: false, error: 'Thread ID required', data: [] };
  }

  if (!supabaseAdmin) {
    return { success: false, error: 'Admin client not available', data: [] };
  }

  try {
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[SERVER ACTION] Error fetching messages:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, error: null, data: messages || [] };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getThreadMessages:', error);
    return { success: false, error: String(error), data: [] };
  }
}

export async function sendStudentMessage(threadId: string, body: string, userId: string) {
  if (!threadId || !body || !userId) {
    return { success: false, error: 'Missing required fields' };
  }

  if (!supabaseAdmin) {
    return { success: false, error: 'Admin client not available' };
  }

  try {
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: userId,
        body: body.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('[SERVER ACTION] Error sending message:', error);
      return { success: false, error: error.message };
    }

    // Update thread updated_at
    await supabaseAdmin
      .from('message_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    return { success: true, error: null, data: message };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in sendStudentMessage:', error);
    return { success: false, error: String(error) };
  }
}

export async function getCourseInfo(courseId: string) {
  if (!courseId) {
    return { success: false, error: 'Course ID required', data: null };
  }

  if (!supabaseAdmin) {
    return { success: false, error: 'Admin client not available', data: null };
  }

  try {
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, instructor_id')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('[SERVER ACTION] Error fetching course:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, error: null, data: course };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getCourseInfo:', error);
    return { success: false, error: String(error), data: null };
  }
}

export async function getInstructorInfo(instructorId: string) {
  if (!instructorId) {
    return { success: false, error: 'Instructor ID required', data: null };
  }

  if (!supabaseAdmin) {
    return { success: false, error: 'Admin client not available', data: null };
  }

  try {
    const { data: instructor, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', instructorId)
      .single();

    if (error) {
      console.error('[SERVER ACTION] Error fetching instructor:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, error: null, data: instructor };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getInstructorInfo:', error);
    return { success: false, error: String(error), data: null };
  }
}

-- Enable RLS on all messaging tables
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MESSAGE_THREADS RLS Policies
-- ============================================================================

-- Students can view their own threads
CREATE POLICY "Students can view their own threads" ON public.message_threads
  FOR SELECT
  USING (
    student_id = auth.uid()
    OR instructor_id = auth.uid()
  );

-- Students can create threads for their enrolled courses
CREATE POLICY "Students can create threads" ON public.message_threads
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE id = enrollment_id AND user_id = auth.uid()
    )
  );

-- Instructors can update threads for their courses (close them)
CREATE POLICY "Instructors can update their course threads" ON public.message_threads
  FOR UPDATE
  USING (
    instructor_id = auth.uid()
  );

-- Service role has full access
CREATE POLICY "Service role can manage threads" ON public.message_threads
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- MESSAGES RLS Policies
-- ============================================================================

-- Users can view messages in threads they're part of
CREATE POLICY "Users can view messages in their threads" ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.student_id = auth.uid() OR mt.instructor_id = auth.uid())
    )
  );

-- Users can insert messages in threads they're part of
CREATE POLICY "Users can send messages in their threads" ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = thread_id
      AND (mt.student_id = auth.uid() OR mt.instructor_id = auth.uid())
    )
  );

-- Users can update their own messages (mark as read, edit)
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- Service role has full access
CREATE POLICY "Service role can manage messages" ON public.messages
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- MESSAGE_ATTACHMENTS RLS Policies
-- ============================================================================

-- Users can view attachments in messages they can see
CREATE POLICY "Users can view attachments in their messages" ON public.message_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
      AND EXISTS (
        SELECT 1 FROM public.message_threads mt
        WHERE mt.id = m.thread_id
        AND (mt.student_id = auth.uid() OR mt.instructor_id = auth.uid())
      )
    )
  );

-- Users can insert attachments for their own messages
CREATE POLICY "Users can add attachments to their messages" ON public.message_attachments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
      AND m.sender_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role can manage attachments" ON public.message_attachments
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- MESSAGE_NOTIFICATIONS RLS Policies
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications" ON public.message_notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert notifications
CREATE POLICY "Service role can create notifications" ON public.message_notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications" ON public.message_notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Service role has full access
CREATE POLICY "Service role can manage notifications" ON public.message_notifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- TYPING_INDICATORS RLS Policies
-- ============================================================================

-- Users can view typing indicators in threads they're part of
CREATE POLICY "Users can view typing indicators in their threads" ON public.typing_indicators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = thread_id
      AND (mt.student_id = auth.uid() OR mt.instructor_id = auth.uid())
    )
  );

-- Users can insert typing indicators for threads they're in
CREATE POLICY "Users can set typing indicators" ON public.typing_indicators
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = thread_id
      AND (mt.student_id = auth.uid() OR mt.instructor_id = auth.uid())
    )
  );

-- Users can delete their own typing indicators
CREATE POLICY "Users can remove their typing indicators" ON public.typing_indicators
  FOR DELETE
  USING (user_id = auth.uid());

-- Service role has full access
CREATE POLICY "Service role can manage typing indicators" ON public.typing_indicators
  FOR ALL
  USING (auth.role() = 'service_role');

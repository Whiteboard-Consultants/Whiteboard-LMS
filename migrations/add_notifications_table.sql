-- Migration: Add notifications table
-- Purpose: Track instructor feedback notifications for students
-- Created: 2026-01-09

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feedback_posted', 'grade_available')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = TRUE, updated_at = NOW()
  WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id_input UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.notifications
    WHERE user_id = user_id_input AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

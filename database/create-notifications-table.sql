-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notifications table for instructor-to-student messaging
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_id ON notifications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_is_read ON notifications(receiver_id, is_read);

-- Enable RLS (Row-Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications (receiver or sender)
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- RLS Policy: Allow all inserts (will be called with admin client mostly)
-- The auth context is not available when using service role key
CREATE POLICY "Anyone can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policy: Only receivers can mark notifications as read
CREATE POLICY "Receivers can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- RLS Policy: Receivers can delete their notifications
CREATE POLICY "Receivers can delete their notifications" ON notifications
  FOR DELETE USING (auth.uid() = receiver_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

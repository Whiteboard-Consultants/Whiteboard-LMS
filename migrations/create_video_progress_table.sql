-- Create video_progress table for tracking student video watching
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  watch_time_seconds INT DEFAULT 0,
  total_duration_seconds INT NOT NULL,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_video_progress_enrollment_id ON video_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_lesson_id ON video_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);

-- Enable RLS
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own video progress" ON video_progress;
CREATE POLICY "Users can view their own video progress"
  ON video_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own video progress" ON video_progress;
CREATE POLICY "Users can insert their own video progress"
  ON video_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own video progress" ON video_progress;
CREATE POLICY "Users can update their own video progress"
  ON video_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_video_progress_timestamp ON video_progress;
CREATE OR REPLACE FUNCTION update_video_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_progress_timestamp
  BEFORE UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_video_progress_timestamp();

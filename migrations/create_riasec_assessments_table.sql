-- Create RIASEC Assessments table
CREATE TABLE IF NOT EXISTS riasec_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  
  -- RIASEC scores (0-100)
  realistic_score INTEGER DEFAULT 0,
  investigative_score INTEGER DEFAULT 0,
  artistic_score INTEGER DEFAULT 0,
  social_score INTEGER DEFAULT 0,
  enterprising_score INTEGER DEFAULT 0,
  conventional_score INTEGER DEFAULT 0,
  
  -- Primary profile (top score)
  primary_profile TEXT,
  secondary_profile TEXT,
  tertiary_profile TEXT,
  
  -- Raw responses (JSON)
  responses JSONB,
  
  -- Email tracking
  email_sent_to_student BOOLEAN DEFAULT FALSE,
  email_sent_to_admin BOOLEAN DEFAULT FALSE,
  student_email_sent_at TIMESTAMP WITH TIME ZONE,
  admin_email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_riasec_user_id ON riasec_assessments(user_id);
CREATE INDEX idx_riasec_created_at ON riasec_assessments(created_at DESC);
CREATE INDEX idx_riasec_primary_profile ON riasec_assessments(primary_profile);

-- Enable RLS (Row Level Security)
ALTER TABLE riasec_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own assessments
CREATE POLICY "Users can view own assessments"
  ON riasec_assessments
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own assessments
CREATE POLICY "Users can insert own assessments"
  ON riasec_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own assessments
CREATE POLICY "Users can update own assessments"
  ON riasec_assessments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- NOTE: For admin access to all assessments, add this policy after your profiles table exists:
-- CREATE POLICY "Admins can view all assessments"
--   ON riasec_assessments
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles
--       WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
--     )
--   );

-- For now, use Supabase service role for admin access (via API with SUPABASE_SERVICE_ROLE_KEY)

COMMENT ON TABLE riasec_assessments IS 'Stores RIASEC career assessment results for students';
COMMENT ON COLUMN riasec_assessments.responses IS 'JSON containing raw question responses: {questionId: answer, ...}';

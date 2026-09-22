-- Global Career Camp 2026 landing form responses
CREATE TABLE IF NOT EXISTS gcc_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  department_stream VARCHAR(200) NOT NULL,
  current_semester_year VARCHAR(100) NOT NULL,
  preferred_destinations TEXT[] NOT NULL DEFAULT '{}',
  preferred_study_areas TEXT[] NOT NULL DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  source_url VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_gcc_form_responses_email
  ON gcc_form_responses(email);
CREATE INDEX IF NOT EXISTS idx_gcc_form_responses_created_at
  ON gcc_form_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gcc_form_responses_status
  ON gcc_form_responses(status);

ALTER TABLE gcc_form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert gcc responses"
ON gcc_form_responses FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Service role can update gcc responses"
ON gcc_form_responses FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE OR REPLACE FUNCTION update_gcc_form_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_gcc_form_responses_updated_at ON gcc_form_responses;
CREATE TRIGGER trigger_update_gcc_form_responses_updated_at
BEFORE UPDATE ON gcc_form_responses
FOR EACH ROW
EXECUTE FUNCTION update_gcc_form_responses_updated_at();

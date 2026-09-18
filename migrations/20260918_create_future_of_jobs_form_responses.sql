-- Create table for Future of Jobs campus session landing form responses
CREATE TABLE IF NOT EXISTS future_of_jobs_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  year_of_study VARCHAR(50) NOT NULL,
  bridge_plan VARCHAR(100) NOT NULL,
  program_choice VARCHAR(200),
  response_data JSONB DEFAULT '{}',
  source_url VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_future_of_jobs_form_responses_email
  ON future_of_jobs_form_responses(email);
CREATE INDEX IF NOT EXISTS idx_future_of_jobs_form_responses_created_at
  ON future_of_jobs_form_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_future_of_jobs_form_responses_status
  ON future_of_jobs_form_responses(status);

ALTER TABLE future_of_jobs_form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert future of jobs responses"
ON future_of_jobs_form_responses FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Service role can update future of jobs responses"
ON future_of_jobs_form_responses FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE OR REPLACE FUNCTION update_future_of_jobs_form_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_future_of_jobs_form_responses_updated_at
BEFORE UPDATE ON future_of_jobs_form_responses
FOR EACH ROW
EXECUTE FUNCTION update_future_of_jobs_form_responses_updated_at();

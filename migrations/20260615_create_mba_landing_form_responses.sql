-- Create table for Online MBA landing page form responses
CREATE TABLE IF NOT EXISTS mba_landing_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  career_stage VARCHAR(100) NOT NULL,
  mba_reason VARCHAR(100) NOT NULL,
  budget VARCHAR(100) NOT NULL,
  program_timeline VARCHAR(100) NOT NULL,
  biggest_challenge VARCHAR(250) NOT NULL,
  callback_date DATE NOT NULL,
  callback_time VARCHAR(20) NOT NULL,
  response_data JSONB DEFAULT '{}',
  source_url VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_mba_landing_form_responses_email ON mba_landing_form_responses(email);
CREATE INDEX IF NOT EXISTS idx_mba_landing_form_responses_created_at ON mba_landing_form_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mba_landing_form_responses_status ON mba_landing_form_responses(status);

ALTER TABLE mba_landing_form_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert mba landing responses" ON mba_landing_form_responses;
CREATE POLICY "Service role can insert mba landing responses"
ON mba_landing_form_responses FOR INSERT
WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Service role can update mba landing responses" ON mba_landing_form_responses;
CREATE POLICY "Service role can update mba landing responses"
ON mba_landing_form_responses FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE OR REPLACE FUNCTION update_mba_landing_form_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mba_landing_form_responses_updated_at ON mba_landing_form_responses;
CREATE TRIGGER trigger_update_mba_landing_form_responses_updated_at
BEFORE UPDATE ON mba_landing_form_responses
FOR EACH ROW
EXECUTE FUNCTION update_mba_landing_form_responses_updated_at();

-- Create table for landing page form responses
CREATE TABLE IF NOT EXISTS landing_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  career_stage VARCHAR(100),
  current_struggle TEXT,
  experience_level VARCHAR(100),
  job_target VARCHAR(255),
  ats_awareness VARCHAR(100),
  linkedin_alignment VARCHAR(100),
  timeline VARCHAR(100),
  decision_maker VARCHAR(100),
  outcome_expectation TEXT,
  response_data JSONB DEFAULT '{}',
  source_url VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new' -- new, contacted, enrolled, opted_out
);

-- Create indexes for better query performance
CREATE INDEX idx_landing_form_responses_email ON landing_form_responses(email);
CREATE INDEX idx_landing_form_responses_course_id ON landing_form_responses(course_id);
CREATE INDEX idx_landing_form_responses_created_at ON landing_form_responses(created_at DESC);
CREATE INDEX idx_landing_form_responses_status ON landing_form_responses(status);

-- Enable RLS on the table
ALTER TABLE landing_form_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for instructors to view their course responses
CREATE POLICY "Instructors can view form responses for their courses"
ON landing_form_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = landing_form_responses.course_id
    AND c.instructor_id = auth.uid()
  )
);

-- Create policy for service role to insert (for API)
CREATE POLICY "Service role can insert responses"
ON landing_form_responses FOR INSERT
WITH CHECK (TRUE);

-- Create policy for service role to update status
CREATE POLICY "Service role can update response status"
ON landing_form_responses FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

-- Create a trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_landing_form_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_landing_form_responses_updated_at ON landing_form_responses;
CREATE TRIGGER trigger_update_landing_form_responses_updated_at
BEFORE UPDATE ON landing_form_responses
FOR EACH ROW
EXECUTE FUNCTION update_landing_form_responses_updated_at();

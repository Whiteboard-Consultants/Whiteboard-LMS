-- Create resume submissions table
CREATE TABLE resume_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_resume_submissions_email ON resume_submissions(email);
CREATE INDEX idx_resume_submissions_submitted_at ON resume_submissions(submitted_at);
CREATE INDEX idx_resume_submissions_status ON resume_submissions(status);

-- Enable RLS
ALTER TABLE resume_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public to insert resume submissions" ON resume_submissions
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admins to view all resume submissions" ON resume_submissions
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to update resume submissions" ON resume_submissions
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_resume_submissions_updated_at 
  BEFORE UPDATE ON resume_submissions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
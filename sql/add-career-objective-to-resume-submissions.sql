-- Add career objective to resume evaluation submissions
ALTER TABLE resume_submissions
  ADD COLUMN IF NOT EXISTS career_objective TEXT;

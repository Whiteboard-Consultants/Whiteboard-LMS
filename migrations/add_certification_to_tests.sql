-- Add certification support to tests table
-- Migration: November 25, 2025

-- Add certification columns to tests table
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS has_certification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_minimum_score INTEGER DEFAULT 70 CHECK (certificate_minimum_score >= 0 AND certificate_minimum_score <= 100);

-- Create index for querying tests with certification
CREATE INDEX IF NOT EXISTS idx_tests_has_certification ON tests(has_certification);
CREATE INDEX IF NOT EXISTS idx_tests_certificate_minimum_score ON tests(certificate_minimum_score);

-- Update comment
COMMENT ON COLUMN tests.has_certification IS 'Whether this test provides a certificate upon passing';
COMMENT ON COLUMN tests.certificate_minimum_score IS 'Minimum score required to be eligible for certificate (0-100)';

-- Create commission_rates table for admin-configurable instructor commissions
CREATE TABLE IF NOT EXISTS public.commission_rates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  
  -- Configuration level
  level TEXT NOT NULL CHECK (level IN ('platform', 'instructor', 'course')),
  
  -- Optional references (depending on level)
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  
  -- Commission percentage (e.g., 20 for 20%)
  commission_percentage NUMERIC(5, 2) NOT NULL CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create partial unique indexes to ensure only one rate per level
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_platform_rate 
  ON public.commission_rates(level) 
  WHERE level = 'platform';

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_instructor_rate 
  ON public.commission_rates(level, instructor_id) 
  WHERE level = 'instructor';

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_course_rate 
  ON public.commission_rates(level, course_id) 
  WHERE level = 'course';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_commission_rates_instructor_id ON public.commission_rates(instructor_id);
CREATE INDEX IF NOT EXISTS idx_commission_rates_course_id ON public.commission_rates(course_id);
CREATE INDEX IF NOT EXISTS idx_commission_rates_level ON public.commission_rates(level);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_commission_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS commission_rates_updated_at_trigger ON public.commission_rates;
CREATE TRIGGER commission_rates_updated_at_trigger
BEFORE UPDATE ON public.commission_rates
FOR EACH ROW
EXECUTE FUNCTION update_commission_rates_updated_at();

-- Insert default platform-wide commission rate of 20%
INSERT INTO public.commission_rates (level, commission_percentage, description, created_by)
VALUES ('platform', 20.00, 'Default platform-wide commission rate for all instructors', NULL)
ON CONFLICT (level) WHERE level = 'platform' DO NOTHING;

-- Enable RLS
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commission_rates
-- Only admins can view commission rates
CREATE POLICY "Admins can view commission rates"
  ON public.commission_rates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert commission rates
CREATE POLICY "Admins can create commission rates"
  ON public.commission_rates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update commission rates
CREATE POLICY "Admins can update commission rates"
  ON public.commission_rates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete commission rates
CREATE POLICY "Admins can delete commission rates"
  ON public.commission_rates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

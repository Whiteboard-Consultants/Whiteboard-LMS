-- Update enrollments table to track pricing at enrollment time
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS enrolled_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS enrolled_original_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing enrollments with pricing information from courses
UPDATE public.enrollments e
SET 
  enrolled_price = COALESCE(c.price, 0),
  enrolled_original_price = COALESCE(c.original_price, c.price, 0),
  enrolled_at = NOW()
FROM public.courses c
WHERE e.course_id = c.id
  AND (e.enrolled_price IS NULL OR e.enrolled_original_price IS NULL);

-- Create index for price lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_price ON public.enrollments(enrolled_price);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON public.enrollments(enrolled_at);

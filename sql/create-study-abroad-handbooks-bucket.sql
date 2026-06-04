-- Study Abroad handbooks storage bucket (private)
-- PDFs are sent by email after form submit; not publicly downloadable.
--
-- Run in Supabase SQL Editor, OR use: npx tsx scripts/create-study-abroad-handbooks-bucket.ts

-- ---------------------------------------------------------------------------
-- 1. Create bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'study-abroad-handbooks',
  'study-abroad-handbooks',
  false,
  15728640, -- 15 MB per file
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. Storage policies (admin upload via dashboard / future admin UI)
-- Service role (API) bypasses RLS and can read files for email attachments.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can upload study abroad handbooks" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read study abroad handbooks" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update study abroad handbooks" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete study abroad handbooks" ON storage.objects;

CREATE POLICY "Admins can upload study abroad handbooks"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-abroad-handbooks'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can read study abroad handbooks"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'study-abroad-handbooks'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update study abroad handbooks"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'study-abroad-handbooks'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete study abroad handbooks"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'study-abroad-handbooks'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Verify
-- ---------------------------------------------------------------------------
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'study-abroad-handbooks';

-- Expected folder layout when uploading PDFs (via Dashboard or script):
--   ireland/study-in-ireland-handbook.pdf
--   uk/study-in-uk-handbook.pdf
--   germany/study-in-germany-handbook.pdf
--   usa/study-in-usa-handbook.pdf
--   canada/study-in-canada-handbook.pdf
--   australia/study-in-australia-handbook.pdf
--   dubai/study-in-dubai-handbook.pdf
--   new-zealand/study-in-new-zealand-handbook.pdf

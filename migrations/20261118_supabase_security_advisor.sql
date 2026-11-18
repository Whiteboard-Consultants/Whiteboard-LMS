-- Security Advisor warnings, applied to the live database on 2026-11-18.
-- The website's server key bypasses these rules, so forms and uploads keep working.
-- The public FAQ "was this helpful?" button still uses the open insert rule.

-- Pin the lookup path on trigger functions so a caller cannot shadow them.
ALTER FUNCTION public.set_instructor_id() SET search_path = public;
ALTER FUNCTION public.update_landing_form_responses_updated_at() SET search_path = public;
ALTER FUNCTION public.update_mba_landing_form_responses_updated_at() SET search_path = public;
ALTER FUNCTION public.update_future_of_jobs_form_responses_updated_at() SET search_path = public;
ALTER FUNCTION public.update_gcc_form_responses_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Move privileged functions out of the schema the public website key can call.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role, supabase_auth_admin;

ALTER FUNCTION public.handle_new_user() SET SCHEMA private;
ALTER FUNCTION public.is_admin() SET SCHEMA private;
ALTER FUNCTION public.track_faq_changes() SET SCHEMA private;
ALTER FUNCTION public.update_faq_stats() SET SCHEMA private;
ALTER FUNCTION public.get_unread_notification_count(uuid) SET SCHEMA private;
ALTER FUNCTION public.mark_notification_read(uuid) SET SCHEMA private;

REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.handle_new_user() TO supabase_auth_admin;

REVOKE ALL ON FUNCTION private.get_unread_notification_count(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.mark_notification_read(uuid) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION private.track_faq_changes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.track_faq_changes() TO authenticated, service_role;

REVOKE ALL ON FUNCTION private.update_faq_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.update_faq_stats() TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO anon, authenticated, service_role;

-- These "service role" rules actually allowed anyone. The server key does not need them.
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service role can insert future of jobs responses" ON public.future_of_jobs_form_responses;
DROP POLICY IF EXISTS "Service role can update future of jobs responses" ON public.future_of_jobs_form_responses;
DROP POLICY IF EXISTS "Service role can insert gcc responses" ON public.gcc_form_responses;
DROP POLICY IF EXISTS "Service role can update gcc responses" ON public.gcc_form_responses;
DROP POLICY IF EXISTS "Service role can insert responses" ON public.landing_form_responses;
DROP POLICY IF EXISTS "Service role can update response status" ON public.landing_form_responses;
DROP POLICY IF EXISTS "Service role can insert mba landing responses" ON public.mba_landing_form_responses;
DROP POLICY IF EXISTS "Service role can update mba landing responses" ON public.mba_landing_form_responses;
DROP POLICY IF EXISTS "Allow public to insert resume submissions" ON public.resume_submissions;

-- Resume files stay reachable by their existing links. Strangers can no longer list, upload, or delete them.
DROP POLICY IF EXISTS "Allow admin read access i5g8va_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume uploads i5g8va_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete access i5g8va_0" ON storage.objects;

-- Course images stay reachable by their existing links. Strangers can no longer list every file name.
DROP POLICY IF EXISTS "Public read access for course assets" ON storage.objects;

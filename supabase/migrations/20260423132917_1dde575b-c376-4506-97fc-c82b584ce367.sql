-- Sponsors should not see admin_notes. Replace the broad "Users can view own sponsorships"
-- policy with a column-restricted view, and keep base-table SELECT admin-only.
DROP POLICY IF EXISTS "Users can view own sponsorships" ON public.course_sponsorships;

-- Create a view that excludes admin_notes
CREATE OR REPLACE VIEW public.my_course_sponsorships
WITH (security_invoker = true) AS
SELECT
  id, course_id, sponsor_user_id, sponsor_name, sponsor_logo_url,
  message, status, created_at, updated_at
FROM public.course_sponsorships
WHERE sponsor_user_id = auth.uid();

GRANT SELECT ON public.my_course_sponsorships TO authenticated;
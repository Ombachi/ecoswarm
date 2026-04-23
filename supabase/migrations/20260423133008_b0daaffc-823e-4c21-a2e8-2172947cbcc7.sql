DROP POLICY IF EXISTS "Users can view own sponsorships" ON public.course_sponsorships;
DROP POLICY IF EXISTS "Anyone can view approved sponsorships" ON public.course_sponsorships;

CREATE POLICY "Users can view own sponsorships"
ON public.course_sponsorships FOR SELECT TO authenticated
USING (auth.uid() = sponsor_user_id);

CREATE POLICY "Anyone can view approved sponsorships"
ON public.course_sponsorships FOR SELECT TO authenticated, anon
USING (status = 'approved');

REVOKE SELECT (admin_notes) ON public.course_sponsorships FROM authenticated;
REVOKE SELECT (admin_notes) ON public.course_sponsorships FROM anon;
GRANT SELECT (id, course_id, sponsor_user_id, sponsor_name, sponsor_logo_url,
  message, status, created_at, updated_at)
ON public.course_sponsorships TO authenticated, anon;
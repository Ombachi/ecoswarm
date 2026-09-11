CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false)
AS
SELECT
  user_id,
  name,
  location,
  county,
  bio,
  avatar_url,
  top_concern,
  courses_completed
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMENT ON VIEW public.public_profiles IS 'Public-safe view of profiles. Excludes PII: email, phone, age, sex.';
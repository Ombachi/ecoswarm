
-- The leaderboard view MUST be security definer because it reads from profiles table
-- which has RLS restricting to own profile. The view only exposes safe public fields.
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard AS
SELECT
  p.id,
  p.user_id,
  p.name,
  p.eco_points,
  p.streak,
  p.avatar_url,
  COALESCE(ur.role::text, 'ecowarrior') AS role,
  RANK() OVER (
    PARTITION BY COALESCE(ur.role::text, 'ecowarrior')
    ORDER BY COALESCE(p.eco_points, 0) DESC
  ) AS rank
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id;

GRANT SELECT ON public.leaderboard TO anon, authenticated;

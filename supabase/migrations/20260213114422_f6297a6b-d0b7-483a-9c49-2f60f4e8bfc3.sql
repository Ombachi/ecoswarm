
-- Recreate leaderboard view with security_invoker to resolve linter warning
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = true)
AS
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

-- Grant access so anon/authenticated can query
GRANT SELECT ON public.leaderboard TO anon, authenticated;

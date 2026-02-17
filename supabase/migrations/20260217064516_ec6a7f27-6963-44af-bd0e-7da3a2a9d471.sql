-- Fix leaderboard view to use public_profiles instead of profiles directly
-- This prevents the security_invoker issue and only exposes non-sensitive fields
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = false)
AS SELECT
  p.user_id as id,
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
FROM public.public_profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id;
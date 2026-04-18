
-- Revoke direct API access to the materialized view.
REVOKE SELECT ON public.leaderboard_mv FROM anon, authenticated;

-- Expose it via a normal view that respects RLS / invoker rights.
CREATE OR REPLACE VIEW public.leaderboard_fast
WITH (security_invoker = true)
AS SELECT * FROM public.leaderboard_mv;

GRANT SELECT ON public.leaderboard_fast TO anon, authenticated;

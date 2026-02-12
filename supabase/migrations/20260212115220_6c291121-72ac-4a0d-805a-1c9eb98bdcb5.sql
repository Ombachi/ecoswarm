
-- Fix 1: Restrict products SELECT to authenticated users only (hides contact_phone from unauthenticated scrapers)
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Authenticated users can view products"
ON public.products
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: Recreate leaderboard view without location field
DROP VIEW IF EXISTS public.leaderboard;
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = false)
AS SELECT
  id,
  user_id,
  name,
  eco_points,
  streak,
  RANK() OVER (ORDER BY eco_points DESC NULLS LAST) as rank
FROM public.profiles;

-- Grant access to authenticated users only for leaderboard
REVOKE ALL ON public.leaderboard FROM anon;
GRANT SELECT ON public.leaderboard TO authenticated;

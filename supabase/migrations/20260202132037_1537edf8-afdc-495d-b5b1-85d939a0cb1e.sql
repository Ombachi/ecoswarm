-- Drop the existing leaderboard view and recreate with explicit security
DROP VIEW IF EXISTS public.leaderboard;

-- Create leaderboard view that only exposes public fields
-- This view is safe because it only shows non-sensitive data
CREATE VIEW public.leaderboard
WITH (security_invoker = false)
AS
SELECT 
    id,
    user_id,
    name,
    eco_points,
    location,
    streak,
    RANK() OVER (ORDER BY eco_points DESC NULLS LAST) as rank
FROM public.profiles
WHERE eco_points > 0
ORDER BY eco_points DESC NULLS LAST;

-- Grant SELECT to authenticated and anon roles so everyone can see the leaderboard
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.leaderboard TO anon;
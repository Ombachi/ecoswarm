-- Drop and recreate the leaderboard view with security_invoker
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  name,
  eco_points,
  location,
  streak,
  RANK() OVER (ORDER BY eco_points DESC) as rank
FROM public.profiles
WHERE eco_points > 0
ORDER BY eco_points DESC
LIMIT 100;
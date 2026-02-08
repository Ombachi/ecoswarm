-- Fix 1: Protect sensitive PII in profiles table
-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view public profile info" ON public.profiles;

-- Create a new policy that only allows users to see their own profile data
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create a secure view for public profile pages (like PublicImpactScreen)
-- This view exposes ONLY non-sensitive fields
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
  eco_points,
  streak,
  top_concern,
  letters_sent,
  swarms_joined,
  posts_created,
  courses_completed
FROM public.profiles;

-- Grant SELECT access to the view for all users (including anon)
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add comment explaining the security approach
COMMENT ON VIEW public.public_profiles IS 'Public-safe view of profiles table. Excludes sensitive PII: email, phone, age, sex. Use this view for public-facing pages like shared impact screens.';
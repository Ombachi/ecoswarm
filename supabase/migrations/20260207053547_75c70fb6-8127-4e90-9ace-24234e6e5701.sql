-- Allow public read access to profiles for public impact pages
-- Drop existing SELECT policy and create new one that allows public viewing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Note: INSERT and UPDATE policies remain unchanged - users can only modify their own profile
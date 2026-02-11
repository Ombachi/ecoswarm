
-- Create a public_swarms view that excludes sensitive contact info
CREATE OR REPLACE VIEW public.public_swarms
WITH (security_invoker = false)
AS SELECT 
  id, name, description, goal, category, 
  created_by, participants, current_signatures, target_signatures,
  org_name, social_links, image_url,
  created_at, updated_at
FROM public.swarms;

-- Grant access to the public view
GRANT SELECT ON public.public_swarms TO anon;
GRANT SELECT ON public.public_swarms TO authenticated;

-- Restrict base swarms table SELECT to only the creator
DROP POLICY IF EXISTS "Anyone can view swarms" ON public.swarms;
CREATE POLICY "Creators can view their own swarms"
ON public.swarms
FOR SELECT
USING (auth.uid() = created_by);

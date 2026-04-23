-- Drop overly broad realtime.messages SELECT policy.
-- The public.messages table already has a sender/receiver-scoped SELECT policy,
-- which Realtime postgres_changes will honor. No separate "subscribe" policy is needed.
DROP POLICY IF EXISTS "Authenticated can subscribe" ON realtime.messages;

-- Drop the broad "Authenticated users can view completions" policy on course_completions.
-- Users keep access to their own completions; admins keep access to all.
DROP POLICY IF EXISTS "Authenticated users can view completions" ON public.course_completions;

-- Drop the broad "Authenticated users can view memberships" policy on swarm_memberships.
-- Replace with a scoped policy: users see their own memberships; swarm creators see
-- memberships for their swarms (needed for participant lists on owned campaigns).
DROP POLICY IF EXISTS "Authenticated users can view memberships" ON public.swarm_memberships;

CREATE POLICY "Users can view their own memberships"
ON public.swarm_memberships
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Swarm creators can view their swarm memberships"
ON public.swarm_memberships
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.swarms s
    WHERE s.id = swarm_memberships.swarm_id
      AND s.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can view all memberships"
ON public.swarm_memberships
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
-- Fix 1: Privilege escalation - prevent users from self-assigning admin role
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

CREATE POLICY "Users can insert their own non-admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('ecowarrior'::app_role, 'ecodeveloper'::app_role)
);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Notifications - require user_id matches auth.uid() OR allow admins
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 3: course_completions - remove anonymous read access
DROP POLICY IF EXISTS "Anyone can view completions for verification" ON public.course_completions;

-- Allow authenticated users to view completions (for badge/leaderboard verification)
CREATE POLICY "Authenticated users can view completions"
ON public.course_completions
FOR SELECT
TO authenticated
USING (true);

-- Fix 4: swarm_memberships - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view memberships" ON public.swarm_memberships;

CREATE POLICY "Authenticated users can view memberships"
ON public.swarm_memberships
FOR SELECT
TO authenticated
USING (true);
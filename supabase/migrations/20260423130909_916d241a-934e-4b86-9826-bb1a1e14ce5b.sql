-- Fix 1: Remove the overly-broad SELECT policy on messages introduced previously.
-- The existing "Users can view their messages" policy already correctly scopes
-- access to sender/receiver. Realtime postgres_changes will continue to honor
-- that scoped policy, so a separate "subscribe" policy is unnecessary and unsafe.
DROP POLICY IF EXISTS "Authenticated can subscribe" ON public.messages;

-- Fix 2: Restrict notification_fanout_queue INSERT to admins only.
-- Previously any authenticated user could enqueue a broadcast to all users.
DROP POLICY IF EXISTS "Authenticated can enqueue fanout" ON public.notification_fanout_queue;

CREATE POLICY "Admins can enqueue fanout"
ON public.notification_fanout_queue
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
-- Allow poll creators (including non-admin moderators) to review all responses for their own polls
CREATE POLICY "Poll creators can view responses"
ON public.poll_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.polls p
    WHERE p.id = poll_responses.poll_id
      AND p.created_by = auth.uid()
  )
);
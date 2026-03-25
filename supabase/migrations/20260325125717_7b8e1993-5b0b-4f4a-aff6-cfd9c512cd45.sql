-- Add unique constraint on advocacy_signers to prevent double-signing
ALTER TABLE public.advocacy_signers ADD CONSTRAINT advocacy_signers_unique UNIQUE (advocacy_id, user_id);

-- Allow all authenticated users to view advocacy campaigns (not just creator and 'sent')
CREATE POLICY "All authenticated can view collecting advocacy"
ON public.business_advocacy
FOR SELECT
TO authenticated
USING (status = 'collecting');

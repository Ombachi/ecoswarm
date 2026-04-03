
DROP POLICY "Service role can insert commissions" ON public.platform_commissions;

-- Only allow insert via service role (edge functions use service role key)
-- No authenticated user should insert commissions directly
CREATE POLICY "No direct insert by users"
  ON public.platform_commissions FOR INSERT
  TO authenticated
  WITH CHECK (false);

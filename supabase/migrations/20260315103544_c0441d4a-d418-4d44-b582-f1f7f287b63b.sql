
-- Allow admins to view all disputes
CREATE POLICY "Admins can view all disputes"
ON public.transaction_disputes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update disputes (resolve them)
CREATE POLICY "Admins can update disputes"
ON public.transaction_disputes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all payouts
CREATE POLICY "Admins can view all payouts"
ON public.seller_payouts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update payouts (approve/reject)
CREATE POLICY "Admins can update payouts"
ON public.seller_payouts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all seller ratings
CREATE POLICY "Admins can view all ratings"
ON public.seller_ratings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

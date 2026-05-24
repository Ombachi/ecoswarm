
-- 1) Remove sensitive tables from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.transactions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.product_interactions;

-- 2) user_roles: prevent self-assigning ecodeveloper/admin
DROP POLICY IF EXISTS "Users can insert their own non-admin role" ON public.user_roles;
CREATE POLICY "Users can self-assign ecowarrior only"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'ecowarrior'::app_role);

-- 3) profiles: tighten policy role from public to authenticated
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 4) subscriptions: tighten role to authenticated
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

CREATE POLICY "Admins can update subscriptions"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create subscriptions"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 5) recipients: standardize all policies to authenticated
DROP POLICY IF EXISTS "Admins can create recipients" ON public.recipients;
DROP POLICY IF EXISTS "Admins can delete recipients" ON public.recipients;
DROP POLICY IF EXISTS "Admins can update recipients" ON public.recipients;

CREATE POLICY "Admins can create recipients"
  ON public.recipients FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete recipients"
  ON public.recipients FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update recipients"
  ON public.recipients FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));


-- EcoMerch products table for admin-managed branded merchandise
CREATE TABLE public.merch_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  category text NOT NULL DEFAULT 'Gear',
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.merch_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active merch" ON public.merch_products
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admins can manage merch" ON public.merch_products
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Merch orders
CREATE TABLE public.merch_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merch_id uuid NOT NULL REFERENCES public.merch_products(id),
  quantity integer NOT NULL DEFAULT 1,
  total_price numeric NOT NULL DEFAULT 0,
  points_used integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  shipping_address text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create orders" ON public.merch_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON public.merch_orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage orders" ON public.merch_orders
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Business advocacy letters for EcoDevelopers
CREATE TABLE public.business_advocacy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  problem_statement text NOT NULL,
  the_ask text NOT NULL,
  impact_report text,
  target_recipient_id uuid REFERENCES public.recipients(id),
  status text NOT NULL DEFAULT 'draft',
  min_signers integer NOT NULL DEFAULT 5,
  cooldown_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_advocacy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can manage own advocacy" ON public.business_advocacy
  FOR ALL TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Authenticated can view sent advocacy" ON public.business_advocacy
  FOR SELECT TO authenticated
  USING (status = 'sent');

CREATE POLICY "Admins can view all advocacy" ON public.business_advocacy
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Co-signers for business advocacy
CREATE TABLE public.advocacy_signers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advocacy_id uuid NOT NULL REFERENCES public.business_advocacy(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(advocacy_id, user_id)
);

ALTER TABLE public.advocacy_signers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can sign advocacy" ON public.advocacy_signers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view signers" ON public.advocacy_signers
  FOR SELECT TO authenticated USING (true);


-- 1. Full-text search GIN index on posts.content
CREATE INDEX IF NOT EXISTS idx_posts_content_fts ON public.posts USING GIN (to_tsvector('english', content));

-- 2. Platform commissions table
CREATE TABLE public.platform_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  sale_amount numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 0.10,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all commissions"
  ON public.platform_commissions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sellers can view own commissions"
  ON public.platform_commissions FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Service role can insert commissions"
  ON public.platform_commissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Platform analytics table
CREATE TABLE public.platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  page text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all analytics"
  ON public.platform_analytics FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can log events"
  ON public.platform_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_platform_analytics_event ON public.platform_analytics (event_type, created_at DESC);
CREATE INDEX idx_platform_analytics_user ON public.platform_analytics (user_id, created_at DESC);

-- 4. Enable realtime on posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

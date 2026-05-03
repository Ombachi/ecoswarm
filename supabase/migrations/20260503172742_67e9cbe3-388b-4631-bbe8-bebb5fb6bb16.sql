
-- Enable scheduling + HTTP extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Dedup table
CREATE TABLE IF NOT EXISTS public.climate_news_seen (
  source_url text PRIMARY KEY,
  source text NOT NULL,
  post_id uuid,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.climate_news_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view climate news seen"
  ON public.climate_news_seen FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage climate news seen"
  ON public.climate_news_seen FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_climate_news_seen_created ON public.climate_news_seen(created_at DESC);

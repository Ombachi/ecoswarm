
-- Create product_interactions table for tracking views/clicks
CREATE TABLE public.product_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click')),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for fast analytics queries
CREATE INDEX idx_product_interactions_product ON public.product_interactions(product_id);
CREATE INDEX idx_product_interactions_user ON public.product_interactions(user_id);
CREATE INDEX idx_product_interactions_type ON public.product_interactions(interaction_type);
CREATE INDEX idx_product_interactions_created ON public.product_interactions(created_at);

-- Enable RLS
ALTER TABLE public.product_interactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can log an interaction
CREATE POLICY "Authenticated users can log interactions"
  ON public.product_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Product owners can view interactions on their products
CREATE POLICY "Product owners can view interactions"
  ON public.product_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_interactions.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Users can view their own interactions
CREATE POLICY "Users can view their own interactions"
  ON public.product_interactions FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_interactions;

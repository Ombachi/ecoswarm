
-- Transactions table for EcoPoints purchases
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  points_used INTEGER NOT NULL DEFAULT 0,
  cash_paid NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  payment_method TEXT DEFAULT 'ecopoints',
  mpesa_receipt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Buyers can view their purchases
CREATE POLICY "Buyers can view their transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

-- Sellers can view sales to them
CREATE POLICY "Sellers can view their sales"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Authenticated users can create transactions
CREATE POLICY "Users can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

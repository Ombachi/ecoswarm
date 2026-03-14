-- Seller ratings table
CREATE TABLE public.seller_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, buyer_id)
);

ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" ON public.seller_ratings FOR SELECT USING (true);
CREATE POLICY "Buyers can create ratings" ON public.seller_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);

-- Transaction disputes table
CREATE TABLE public.transaction_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.transaction_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view their disputes" ON public.transaction_disputes FOR SELECT TO authenticated
  USING (raised_by = auth.uid() OR EXISTS (
    SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));
CREATE POLICY "Parties can create disputes" ON public.transaction_disputes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = raised_by AND EXISTS (
    SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  ));

-- Seller payouts table
CREATE TABLE public.seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  mpesa_phone TEXT,
  mpesa_receipt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their payouts" ON public.seller_payouts FOR SELECT TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can request payouts" ON public.seller_payouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

-- Add payment verification fields to transactions
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS mpesa_checkout_id TEXT;
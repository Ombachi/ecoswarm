
-- Add response tracking columns to business_advocacy
ALTER TABLE public.business_advocacy 
ADD COLUMN IF NOT EXISTS response_status text DEFAULT 'no_response',
ADD COLUMN IF NOT EXISTS response_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS days_since_sent integer DEFAULT 0;

-- Create advocacy_responses table for evidence tracking
CREATE TABLE public.advocacy_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advocacy_id uuid NOT NULL REFERENCES public.business_advocacy(id) ON DELETE CASCADE,
  response_status text NOT NULL DEFAULT 'no_response',
  evidence_url text,
  summary text NOT NULL,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.advocacy_responses ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view responses (public accountability)
CREATE POLICY "Anyone can view advocacy responses"
ON public.advocacy_responses FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage responses
CREATE POLICY "Admins can manage advocacy responses"
ON public.advocacy_responses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update business_advocacy response fields
CREATE POLICY "Admins can update advocacy status"
ON public.business_advocacy FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

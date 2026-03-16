-- CO2 Savings Matrix table
CREATE TABLE IF NOT EXISTS public.co2_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text UNIQUE NOT NULL,
  co2_kg_per_action numeric NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.co2_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view CO2 matrix" ON public.co2_matrix FOR SELECT USING (true);
CREATE POLICY "Admins can manage CO2 matrix" ON public.co2_matrix FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to award CO2 savings based on matrix
CREATE OR REPLACE FUNCTION public.award_co2(p_user_id uuid, p_action_type text, p_multiplier numeric DEFAULT 1)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_co2 numeric;
  v_total numeric;
BEGIN
  SELECT co2_kg_per_action INTO v_co2 FROM public.co2_matrix WHERE action_type = p_action_type;
  IF v_co2 IS NULL THEN RETURN 0; END IF;
  v_total := v_co2 * p_multiplier;
  UPDATE public.profiles SET co2_saved = COALESCE(co2_saved, 0) + v_total WHERE user_id = p_user_id;
  RETURN v_total;
END;
$$
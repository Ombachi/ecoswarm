
-- A/B testing experiments table
CREATE TABLE public.ab_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL DEFAULT '[{"name":"control","weight":50},{"name":"variant_a","weight":50}]'::jsonb,
  target_pages TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage experiments" ON public.ab_experiments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view active experiments" ON public.ab_experiments FOR SELECT TO authenticated
  USING (is_active = true);

-- A/B assignments table
CREATE TABLE public.ab_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  variant TEXT NOT NULL,
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, user_id)
);

ALTER TABLE public.ab_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all assignments" ON public.ab_assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own assignments" ON public.ab_assignments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can be assigned" ON public.ab_assignments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversion" ON public.ab_assignments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_ab_assignments_experiment ON public.ab_assignments(experiment_id);
CREATE INDEX idx_ab_assignments_user ON public.ab_assignments(user_id);

CREATE TRIGGER update_ab_experiments_updated_at
  BEFORE UPDATE ON public.ab_experiments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

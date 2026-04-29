CREATE TABLE public.climate_reminder_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_date text NOT NULL,
  event_year integer NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_date, event_year)
);

CREATE INDEX idx_climate_reminder_log_user ON public.climate_reminder_log (user_id);
CREATE INDEX idx_climate_reminder_log_event ON public.climate_reminder_log (event_date, event_year);

ALTER TABLE public.climate_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage climate reminder log"
  ON public.climate_reminder_log
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
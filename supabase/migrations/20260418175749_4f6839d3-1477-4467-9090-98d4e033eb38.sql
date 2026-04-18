
DROP TRIGGER IF EXISTS notify_rank_change_trigger ON public.profiles;

CREATE TABLE IF NOT EXISTS public.rank_check_queue (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  old_points INTEGER NOT NULL,
  new_points INTEGER NOT NULL,
  enqueued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rank_check_queue_pending
  ON public.rank_check_queue (enqueued_at)
  WHERE processed_at IS NULL;

ALTER TABLE public.rank_check_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage rank queue" ON public.rank_check_queue;
CREATE POLICY "Admins can manage rank queue"
  ON public.rank_check_queue FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.enqueue_rank_check()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF COALESCE(NEW.eco_points, 0) > COALESCE(OLD.eco_points, 0)
     AND (COALESCE(NEW.eco_points, 0) / 50) > (COALESCE(OLD.eco_points, 0) / 50) THEN
    INSERT INTO public.rank_check_queue (user_id, old_points, new_points)
    VALUES (NEW.user_id, COALESCE(OLD.eco_points, 0), COALESCE(NEW.eco_points, 0));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enqueue_rank_check_trigger ON public.profiles;
CREATE TRIGGER enqueue_rank_check_trigger
AFTER UPDATE OF eco_points ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enqueue_rank_check();

CREATE TABLE IF NOT EXISTS public.notification_fanout_queue (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  exclude_user_id UUID,
  reference_id TEXT,
  enqueued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  recipients_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_fanout_queue_pending
  ON public.notification_fanout_queue (enqueued_at)
  WHERE processed_at IS NULL;

ALTER TABLE public.notification_fanout_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage fanout queue" ON public.notification_fanout_queue;
CREATE POLICY "Admins can manage fanout queue"
  ON public.notification_fanout_queue FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated can enqueue fanout" ON public.notification_fanout_queue;
CREATE POLICY "Authenticated can enqueue fanout"
  ON public.notification_fanout_queue FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Materialized leaderboard. Dedupe roles per user with priority admin > ecodeveloper > ecowarrior.
DROP MATERIALIZED VIEW IF EXISTS public.leaderboard_mv;

CREATE MATERIALIZED VIEW public.leaderboard_mv AS
WITH ranked_roles AS (
  SELECT
    user_id,
    role::text AS role,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY CASE role::text
        WHEN 'admin' THEN 1
        WHEN 'ecodeveloper' THEN 2
        WHEN 'ecowarrior' THEN 3
        ELSE 4 END
    ) AS rn
  FROM public.user_roles
),
user_role AS (
  SELECT user_id, role FROM ranked_roles WHERE rn = 1
)
SELECT
  p.user_id,
  p.user_id AS id,
  p.name,
  p.avatar_url,
  COALESCE(p.eco_points, 0) AS eco_points,
  COALESCE(p.streak, 0) AS streak,
  COALESCE(ur.role, 'ecowarrior') AS role,
  ROW_NUMBER() OVER (
    PARTITION BY COALESCE(ur.role, 'ecowarrior')
    ORDER BY COALESCE(p.eco_points, 0) DESC, p.created_at ASC
  ) AS rank
FROM public.profiles p
LEFT JOIN user_role ur ON ur.user_id = p.user_id;

CREATE UNIQUE INDEX idx_leaderboard_mv_user ON public.leaderboard_mv (user_id);
CREATE INDEX idx_leaderboard_mv_role_rank ON public.leaderboard_mv (role, rank);

GRANT SELECT ON public.leaderboard_mv TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_leaderboard_mv()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_mv;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_profiles_eco_points ON public.profiles (eco_points DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

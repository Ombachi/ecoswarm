-- 1. Drop legacy triggers/functions
DROP TRIGGER IF EXISTS trg_ecodeveloper_comment_points ON public.comments;
DROP TRIGGER IF EXISTS trg_update_comment_count ON public.comments;
DROP TRIGGER IF EXISTS enqueue_rank_check_trigger ON public.profiles;
DROP TRIGGER IF EXISTS trg_notify_rank_change ON public.profiles;
DROP TRIGGER IF EXISTS update_streak_on_challenge ON public.user_challenges;
DROP TRIGGER IF EXISTS update_letter_templates_updated_at ON public.letter_templates;
DROP TRIGGER IF EXISTS update_recipients_updated_at ON public.recipients;

DROP FUNCTION IF EXISTS public.award_ecodeveloper_comment_points() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_count() CASCADE;
DROP FUNCTION IF EXISTS public.enqueue_rank_check() CASCADE;
DROP FUNCTION IF EXISTS public.notify_rank_change() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_streak() CASCADE;
DROP FUNCTION IF EXISTS public.refresh_leaderboard_mv() CASCADE;
DROP FUNCTION IF EXISTS public.toggle_post_like(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_likes(uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.join_swarm(uuid, integer) CASCADE;

DROP MATERIALIZED VIEW IF EXISTS public.leaderboard_mv CASCADE;

-- 2. Drop legacy tables
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.swarm_memberships CASCADE;
DROP TABLE IF EXISTS public.swarms CASCADE;
DROP TABLE IF EXISTS public.advocacy_signers CASCADE;
DROP TABLE IF EXISTS public.advocacy_responses CASCADE;
DROP TABLE IF EXISTS public.business_advocacy CASCADE;
DROP TABLE IF EXISTS public.letter_templates CASCADE;
DROP TABLE IF EXISTS public.recipients CASCADE;
DROP TABLE IF EXISTS public.user_challenges CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.climate_news_seen CASCADE;
DROP TABLE IF EXISTS public.climate_reminder_log CASCADE;
DROP TABLE IF EXISTS public.rank_check_queue CASCADE;
DROP TABLE IF EXISTS public.notification_fanout_queue CASCADE;

-- 3. Collapse roles to ecowarrior
DELETE FROM public.user_roles
WHERE role = 'ecodeveloper'
  AND EXISTS (
    SELECT 1 FROM public.user_roles u2
    WHERE u2.user_id = user_roles.user_id AND u2.role = 'ecowarrior'
  );
UPDATE public.user_roles SET role = 'ecowarrior' WHERE role = 'ecodeveloper';

-- 4. Remove gamification counters from profiles
DROP VIEW IF EXISTS public.leaderboard CASCADE;
DROP VIEW IF EXISTS public.public_profiles CASCADE;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS eco_points,
  DROP COLUMN IF EXISTS streak,
  DROP COLUMN IF EXISTS letters_sent,
  DROP COLUMN IF EXISTS swarms_joined,
  DROP COLUMN IF EXISTS posts_created,
  DROP COLUMN IF EXISTS trees_planted;

-- 5. Coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric NOT NULL DEFAULT 0,
  max_redemptions integer,
  times_used integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coupons_discount_type_check CHECK (discount_type IN ('percent','fixed')),
  CONSTRAINT coupons_discount_value_check CHECK (discount_value >= 0)
);
GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view active coupons"
  ON public.coupons FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  product_id uuid,
  discount_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own redemptions"
  ON public.coupon_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX idx_coupon_redemptions_user ON public.coupon_redemptions(user_id);

CREATE OR REPLACE FUNCTION public.validate_coupon(p_code text, p_amount numeric)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons;
  v_discount numeric;
BEGIN
  SELECT * INTO c FROM public.coupons
  WHERE lower(code) = lower(btrim(p_code)) AND is_active = true;

  IF c.id IS NULL THEN
    RETURN json_build_object('valid', false, 'reason', 'Coupon not found');
  END IF;
  IF c.starts_at > now() THEN
    RETURN json_build_object('valid', false, 'reason', 'Coupon is not active yet');
  END IF;
  IF c.ends_at IS NOT NULL AND c.ends_at < now() THEN
    RETURN json_build_object('valid', false, 'reason', 'Coupon has expired');
  END IF;
  IF c.max_redemptions IS NOT NULL AND c.times_used >= c.max_redemptions THEN
    RETURN json_build_object('valid', false, 'reason', 'Coupon fully redeemed');
  END IF;

  IF c.discount_type = 'percent' THEN
    v_discount := round(p_amount * (c.discount_value / 100.0), 2);
  ELSE
    v_discount := c.discount_value;
  END IF;
  v_discount := least(v_discount, p_amount);

  RETURN json_build_object(
    'valid', true,
    'coupon_id', c.id,
    'code', c.code,
    'discount_type', c.discount_type,
    'discount_value', c.discount_value,
    'discount_amount', v_discount,
    'final_amount', p_amount - v_discount
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO authenticated;
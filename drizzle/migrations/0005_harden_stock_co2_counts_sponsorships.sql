CREATE OR REPLACE FUNCTION public.decrement_merch_stock(p_merch_id uuid, p_quantity integer)
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_current_stock integer;
BEGIN
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 100 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  SELECT stock INTO v_current_stock FROM public.merch_products WHERE id = p_merch_id FOR UPDATE;
  IF v_current_stock IS NULL THEN RAISE EXCEPTION 'Product not found'; END IF;
  IF v_current_stock < p_quantity THEN RETURN false; END IF;
  UPDATE public.merch_products SET stock = stock - p_quantity WHERE id = p_merch_id;
  RETURN true;
END; $function$;
REVOKE EXECUTE ON FUNCTION public.decrement_merch_stock(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_merch_stock(uuid, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.set_merch_order_price()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_price numeric; v_active boolean;
BEGIN
  IF public.has_role(auth.uid(), 'admin') AND TG_OP = 'UPDATE' THEN RETURN NEW; END IF;
  IF NEW.quantity IS NULL OR NEW.quantity < 1 OR NEW.quantity > 100 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  SELECT price, is_active INTO v_price, v_active FROM public.merch_products WHERE id = NEW.merch_id;
  IF v_price IS NULL OR NOT v_active THEN RAISE EXCEPTION 'Product unavailable'; END IF;
  NEW.total_price := v_price * NEW.quantity;
  NEW.points_used := 0;
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    IF NOT public.decrement_merch_stock(NEW.merch_id, NEW.quantity) THEN RAISE EXCEPTION 'Out of stock'; END IF;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.award_co2(p_user_id uuid, p_action_type text, p_multiplier numeric DEFAULT 1)
 RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_co2 numeric; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NOT NULL THEN
    -- Client callers: only themselves, only for verified course completions, multiplier fixed at 1
    IF p_user_id IS DISTINCT FROM v_uid THEN RAISE EXCEPTION 'Not allowed'; END IF;
    IF p_action_type <> 'course_completed' THEN RAISE EXCEPTION 'Not allowed'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.course_completions WHERE user_id = v_uid) THEN RETURN 0; END IF;
    p_multiplier := 1;
  ELSE
    p_multiplier := least(greatest(coalesce(p_multiplier, 1), 0), 10);
  END IF;
  SELECT co2_kg_per_action INTO v_co2 FROM public.co2_matrix WHERE action_type = p_action_type;
  IF v_co2 IS NULL THEN RETURN 0; END IF;
  UPDATE public.profiles SET co2_saved = COALESCE(co2_saved, 0) + v_co2 * p_multiplier WHERE user_id = p_user_id;
  RETURN v_co2 * p_multiplier;
END; $function$;
REVOKE EXECUTE ON FUNCTION public.award_co2(uuid, text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_co2(uuid, text, numeric) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.count_recent_actions(text, uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_recent_actions(text, uuid, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.enforce_sponsorship_status()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF TG_OP = 'INSERT' THEN NEW.status := 'pending'; NEW.admin_notes := NULL;
    ELSE NEW.status := OLD.status; NEW.admin_notes := OLD.admin_notes; END IF;
  END IF;
  RETURN NEW;
END; $function$;
DROP TRIGGER IF EXISTS enforce_sponsorship_status ON public.course_sponsorships;
CREATE TRIGGER enforce_sponsorship_status BEFORE INSERT OR UPDATE ON public.course_sponsorships
FOR EACH ROW EXECUTE FUNCTION public.enforce_sponsorship_status();
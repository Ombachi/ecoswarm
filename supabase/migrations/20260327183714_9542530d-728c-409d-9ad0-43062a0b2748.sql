
-- Atomic merch stock decrement function
CREATE OR REPLACE FUNCTION public.decrement_merch_stock(p_merch_id uuid, p_quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stock integer;
BEGIN
  -- Lock the row and check stock
  SELECT stock INTO v_current_stock
  FROM public.merch_products
  WHERE id = p_merch_id
  FOR UPDATE;

  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF v_current_stock < p_quantity THEN
    RETURN false;
  END IF;

  UPDATE public.merch_products
  SET stock = stock - p_quantity
  WHERE id = p_merch_id;

  RETURN true;
END;
$$;

-- Rate limiting helper: count recent actions by user
CREATE OR REPLACE FUNCTION public.count_recent_actions(
  p_table_name text,
  p_user_id uuid,
  p_window_minutes integer DEFAULT 60
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM public.%I WHERE user_id = $1 AND created_at > now() - interval ''%s minutes''',
    p_table_name, p_window_minutes
  ) INTO v_count USING p_user_id;
  RETURN v_count;
END;
$$;

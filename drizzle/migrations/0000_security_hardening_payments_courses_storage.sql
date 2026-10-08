-- Ratings: only the buyer, seller (and admins via existing policy) can read
DROP POLICY IF EXISTS "Authenticated users can view ratings" ON public.seller_ratings;
CREATE POLICY "Buyers and sellers can view their ratings" ON public.seller_ratings
  FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Subscriptions: only server/admin may create
DROP POLICY IF EXISTS "Users can create subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can create subscriptions" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Merch orders: price is always computed from the catalog
CREATE OR REPLACE FUNCTION public.set_merch_order_price()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_price numeric; v_active boolean;
BEGIN
  IF public.has_role(auth.uid(), 'admin') AND TG_OP = 'UPDATE' THEN RETURN NEW; END IF;
  IF NEW.quantity IS NULL OR NEW.quantity < 1 OR NEW.quantity > 100 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;
  SELECT price, is_active INTO v_price, v_active FROM public.merch_products WHERE id = NEW.merch_id;
  IF v_price IS NULL OR NOT v_active THEN RAISE EXCEPTION 'Product unavailable'; END IF;
  NEW.total_price := v_price * NEW.quantity;
  NEW.points_used := 0;
  IF TG_OP = 'INSERT' THEN NEW.status := 'pending'; END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS merch_order_price ON public.merch_orders;
CREATE TRIGGER merch_order_price BEFORE INSERT OR UPDATE ON public.merch_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_merch_order_price();

-- Course completions: recorded only by server-graded quiz
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.course_completions;
CREATE OR REPLACE FUNCTION public.submit_course_quiz(p_course_id uuid, p_answers jsonb)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_total int; v_correct int; v_passed boolean;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT count(*), count(*) FILTER (WHERE (p_answers ->> q.id::text)::int = q.correct_index)
    INTO v_total, v_correct
  FROM public.course_questions q WHERE q.course_id = p_course_id;
  IF v_total = 0 THEN RAISE EXCEPTION 'Course has no quiz'; END IF;
  v_passed := v_correct >= ceil(v_total * 0.7);
  IF v_passed AND NOT EXISTS (SELECT 1 FROM public.course_completions WHERE user_id = v_uid AND module_id = p_course_id::text) THEN
    INSERT INTO public.course_completions (user_id, module_id) VALUES (v_uid, p_course_id::text);
  END IF;
  RETURN json_build_object('passed', v_passed, 'correct', v_correct, 'total', v_total);
END; $$;
REVOKE ALL ON FUNCTION public.submit_course_quiz(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_course_quiz(uuid, jsonb) TO authenticated;

-- Storage: per-user upload folders; public buckets serve files by URL without list policies
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;
CREATE POLICY "Users can upload own post media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-media' AND (storage.foldername(name))[1] = (select auth.uid()::text));
DROP POLICY IF EXISTS "Anyone can view course media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view sponsor logos" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
-- seller_ratings: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.seller_ratings;
CREATE POLICY "Authenticated users can view ratings"
ON public.seller_ratings FOR SELECT TO authenticated USING (true);

-- post_likes: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Public can view post likes" ON public.post_likes;
DROP POLICY IF EXISTS "post_likes_select_all" ON public.post_likes;

-- Find and drop any existing permissive public policy
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='post_likes' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.post_likes', pol.policyname);
  END LOOP;
END$$;

CREATE POLICY "Authenticated users can view post likes"
ON public.post_likes FOR SELECT TO authenticated USING (true);
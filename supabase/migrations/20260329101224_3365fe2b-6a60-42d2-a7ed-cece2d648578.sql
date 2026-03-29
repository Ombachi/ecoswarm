
-- 1. Full-text search index on products
CREATE INDEX IF NOT EXISTS idx_products_fts ON public.products
  USING gin (to_tsvector('english', product_name || ' ' || description || ' ' || org_name || ' ' || category));

-- 2. Atomic comment count function
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments = COALESCE(comments, 0) + 1 WHERE id::text = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments = GREATEST(COALESCE(comments, 0) - 1, 0) WHERE id::text = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for atomic comment counts
DROP TRIGGER IF EXISTS trg_update_comment_count ON public.comments;
CREATE TRIGGER trg_update_comment_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

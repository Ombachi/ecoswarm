
DO $$
DECLARE tbl record;
BEGIN
  FOR tbl IN SELECT c.relname AS table_name FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname='public'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.table_name);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.table_name);
  END LOOP;
END $$;

-- Public-readable tables (have permissive SELECT policies)
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.post_likes TO anon;
GRANT SELECT ON public.comments TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.merch_products TO anon;
GRANT SELECT ON public.course_sponsorships TO anon;
GRANT SELECT ON public.polls TO anon;
GRANT SELECT ON public.co2_matrix TO anon;
GRANT SELECT ON public.challenges TO anon;
GRANT SELECT ON public.org_profiles TO anon;

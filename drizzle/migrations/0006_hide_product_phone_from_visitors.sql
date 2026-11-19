DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Visitors can browse products" ON public.products FOR SELECT TO anon USING (product_name IS NOT NULL);
CREATE POLICY "Signed-in users can view products" ON public.products FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (id, user_id, org_name, product_name, category, description, media_url, media_type, badges, price, location, created_at, updated_at, media_urls) ON public.products TO anon;
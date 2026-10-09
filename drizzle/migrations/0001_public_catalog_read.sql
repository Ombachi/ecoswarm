CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.products TO anon;
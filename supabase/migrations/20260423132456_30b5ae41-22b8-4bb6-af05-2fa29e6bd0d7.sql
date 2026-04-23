-- 1) Course media: admin-only writes
DROP POLICY IF EXISTS "Admins can upload course media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update course media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course media" ON storage.objects;

CREATE POLICY "Admins can upload course media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update course media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete course media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-media' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Sponsor logos: user-scoped
DROP POLICY IF EXISTS "Authenticated users can upload sponsor logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own sponsor logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own sponsor logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own sponsor logos" ON storage.objects;

CREATE POLICY "Users can upload own sponsor logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sponsor-logos' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own sponsor logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'sponsor-logos' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own sponsor logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'sponsor-logos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 3) Recipients: admin-only on table; safe view for everyone
DROP POLICY IF EXISTS "Authenticated users can view active recipients" ON public.recipients;
DROP POLICY IF EXISTS "Admins can view all recipients" ON public.recipients;

CREATE POLICY "Admins can view all recipients"
ON public.recipients FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.public_recipients
WITH (security_invoker = true) AS
SELECT id, name, title, organization, sort_order, is_active, created_at, updated_at
FROM public.recipients
WHERE is_active = true;

GRANT SELECT ON public.public_recipients TO authenticated, anon;

-- 4) Realtime channel subscriptions: admin-only direct subscribe
DROP POLICY IF EXISTS "Admins can subscribe to realtime" ON realtime.messages;
CREATE POLICY "Admins can subscribe to realtime"
ON realtime.messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
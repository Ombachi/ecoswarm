ALTER VIEW public.public_recipients SET (security_invoker = false);
GRANT SELECT ON public.public_recipients TO authenticated, anon;
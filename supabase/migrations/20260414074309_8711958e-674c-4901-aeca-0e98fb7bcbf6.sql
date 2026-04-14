-- Allow anyone (including unauthenticated) to view course completions for certificate verification
CREATE POLICY "Anyone can view completions for verification"
ON public.course_completions
FOR SELECT
TO anon
USING (true);

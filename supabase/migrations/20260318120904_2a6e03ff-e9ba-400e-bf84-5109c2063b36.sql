
-- Course sponsorship requests table
CREATE TABLE public.course_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sponsor_user_id UUID NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, sponsor_user_id)
);

ALTER TABLE public.course_sponsorships ENABLE ROW LEVEL SECURITY;

-- EcoDevelopers can request sponsorships
CREATE POLICY "EcoDevelopers can request sponsorship"
  ON public.course_sponsorships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sponsor_user_id);

-- Users can view their own requests
CREATE POLICY "Users can view own sponsorships"
  ON public.course_sponsorships FOR SELECT TO authenticated
  USING (auth.uid() = sponsor_user_id);

-- Admins can manage all sponsorships
CREATE POLICY "Admins can manage sponsorships"
  ON public.course_sponsorships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Everyone can view approved sponsorships (to display logos)
CREATE POLICY "Anyone can view approved sponsorships"
  ON public.course_sponsorships FOR SELECT TO authenticated
  USING (status = 'approved');

-- Add a storage bucket for sponsor logos
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-logos', 'sponsor-logos', true);

CREATE POLICY "Authenticated users can upload sponsor logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sponsor-logos');

CREATE POLICY "Anyone can view sponsor logos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'sponsor-logos');

-- Also add a storage bucket for course media (videos, files)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-media', 'course-media', true);

CREATE POLICY "Admins can upload course media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-media');

CREATE POLICY "Anyone can view course media"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'course-media');

-- Allow admins to view all course completions
CREATE POLICY "Admins can view all completions"
  ON public.course_completions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

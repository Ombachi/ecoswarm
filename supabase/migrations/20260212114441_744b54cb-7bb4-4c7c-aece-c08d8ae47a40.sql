
-- Create org_profiles table for EcoDeveloper-specific data
CREATE TABLE public.org_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL DEFAULT 'Other',
  website_url TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_linkedin TEXT,
  description_of_work TEXT,
  certifications_url TEXT,
  main_products_services TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.org_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own org profile"
ON public.org_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own org profile"
ON public.org_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own org profile"
ON public.org_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Anyone can view org profiles (for public product pages)
CREATE POLICY "Anyone can view org profiles"
ON public.org_profiles FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_org_profiles_updated_at
BEFORE UPDATE ON public.org_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for eco-certifications
INSERT INTO storage.buckets (id, name, public) VALUES ('eco-certifications', 'eco-certifications', false);

-- Storage policies for eco-certifications
CREATE POLICY "Users can upload their own certifications"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'eco-certifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own certifications"
ON storage.objects FOR SELECT
USING (bucket_id = 'eco-certifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own certifications"
ON storage.objects FOR UPDATE
USING (bucket_id = 'eco-certifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own certifications"
ON storage.objects FOR DELETE
USING (bucket_id = 'eco-certifications' AND auth.uid()::text = (storage.foldername(name))[1]);

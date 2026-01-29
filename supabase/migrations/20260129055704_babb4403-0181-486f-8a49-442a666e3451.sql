-- Add bio and avatar_url to profiles for user profile updates
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS courses_completed integer DEFAULT 0;

-- Create posts table for Agora Square
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  content text NOT NULL,
  media_url text,
  media_type text,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  is_liked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "Users can create their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- Create course_completions table for Capacity Hub
CREATE TABLE IF NOT EXISTS public.course_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id text NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
ON public.course_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
ON public.course_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create user_badges table for badge tracking
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id text NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
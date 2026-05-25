ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_new_content boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_profiles_notify_new_content
  ON public.profiles (notify_new_content) WHERE notify_new_content = true;
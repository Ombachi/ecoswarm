
-- Add new columns to swarms table for org/company details
ALTER TABLE public.swarms ADD COLUMN IF NOT EXISTS org_name text;
ALTER TABLE public.swarms ADD COLUMN IF NOT EXISTS social_links text;
ALTER TABLE public.swarms ADD COLUMN IF NOT EXISTS phone text;

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'swarm', 'post', 'course'
  title text NOT NULL,
  message text NOT NULL,
  reference_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Index for quick user notification lookups
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);

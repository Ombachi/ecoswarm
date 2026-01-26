-- Create comments table for Agora posts
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all comments
CREATE POLICY "Anyone can view comments"
ON public.comments
FOR SELECT
USING (true);

-- Users can create their own comments
CREATE POLICY "Users can create comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create leaderboard view for easy querying
CREATE VIEW public.leaderboard AS
SELECT 
  id,
  user_id,
  name,
  eco_points,
  location,
  streak,
  RANK() OVER (ORDER BY eco_points DESC) as rank
FROM public.profiles
WHERE eco_points > 0
ORDER BY eco_points DESC
LIMIT 100;
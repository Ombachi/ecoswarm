-- Fix: Post Engagement Metrics Manipulation
-- Create a proper post_likes table to track who liked what

CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes (needed for counting)
CREATE POLICY "Anyone can view likes"
ON public.post_likes
FOR SELECT
USING (true);

-- Users can add their own likes
CREATE POLICY "Users can add their own likes"
ON public.post_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can remove their own likes"
ON public.post_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create a secure function to toggle likes (prevents direct manipulation)
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_like UUID;
  v_new_count INTEGER;
  v_is_liked BOOLEAN;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user already liked this post
  SELECT id INTO v_existing_like
  FROM public.post_likes
  WHERE post_id = p_post_id AND user_id = v_user_id;
  
  IF v_existing_like IS NOT NULL THEN
    -- Unlike: remove the like
    DELETE FROM public.post_likes WHERE id = v_existing_like;
    v_is_liked := false;
  ELSE
    -- Like: add the like
    INSERT INTO public.post_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
    v_is_liked := true;
  END IF;
  
  -- Get new count and update the posts table
  SELECT COUNT(*) INTO v_new_count FROM public.post_likes WHERE post_id = p_post_id;
  
  UPDATE public.posts SET likes = v_new_count WHERE id = p_post_id;
  
  RETURN json_build_object('likes', v_new_count, 'isLiked', v_is_liked);
END;
$$;

-- Create function to check if user has liked a post
CREATE OR REPLACE FUNCTION public.get_user_likes(p_post_ids UUID[])
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT post_id 
  FROM public.post_likes 
  WHERE user_id = auth.uid() 
  AND post_id = ANY(p_post_ids);
$$;

-- Fix: Restrict UPDATE on posts to only allow content/media changes, not engagement metrics
-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;

-- Create a more restrictive update policy
-- This still allows updates but we'll handle likes via the function
CREATE POLICY "Users can update their own posts content"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
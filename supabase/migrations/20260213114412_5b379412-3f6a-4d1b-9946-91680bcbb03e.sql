
-- Drop and recreate leaderboard view with role information
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard AS
SELECT
  p.id,
  p.user_id,
  p.name,
  p.eco_points,
  p.streak,
  p.avatar_url,
  COALESCE(ur.role::text, 'ecowarrior') AS role,
  RANK() OVER (
    PARTITION BY COALESCE(ur.role::text, 'ecowarrior')
    ORDER BY COALESCE(p.eco_points, 0) DESC
  ) AS rank
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id;

-- Function to award EcoDeveloper points when they comment on posts
CREATE OR REPLACE FUNCTION public.award_ecodeveloper_comment_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_dev BOOLEAN;
  v_post_author UUID;
BEGIN
  -- Check if the commenter is an ecodeveloper
  SELECT public.has_role(NEW.user_id, 'ecodeveloper') INTO v_is_dev;
  
  IF NOT v_is_dev THEN
    RETURN NEW;
  END IF;

  -- Get the post author to ensure dev is replying to someone else's post
  SELECT user_id INTO v_post_author FROM public.posts WHERE id::text = NEW.post_id;
  
  IF v_post_author IS NOT NULL AND v_post_author != NEW.user_id THEN
    -- Award 5 points for responding to a user's post
    UPDATE public.profiles
    SET eco_points = COALESCE(eco_points, 0) + 5
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for ecodeveloper comment points
DROP TRIGGER IF EXISTS trg_ecodeveloper_comment_points ON public.comments;
CREATE TRIGGER trg_ecodeveloper_comment_points
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.award_ecodeveloper_comment_points();

-- Function to notify users of rank changes
CREATE OR REPLACE FUNCTION public.notify_rank_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_old_rank BIGINT;
  v_new_rank BIGINT;
  v_role TEXT;
BEGIN
  -- Get user's role
  SELECT COALESCE(ur.role::text, 'ecowarrior') INTO v_role
  FROM public.user_roles ur WHERE ur.user_id = NEW.user_id;
  
  IF v_role IS NULL THEN v_role := 'ecowarrior'; END IF;

  -- Calculate new rank within cohort
  SELECT COUNT(*) + 1 INTO v_new_rank
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE COALESCE(ur.role::text, 'ecowarrior') = v_role
    AND COALESCE(p.eco_points, 0) > COALESCE(NEW.eco_points, 0);

  -- Calculate old rank within cohort
  SELECT COUNT(*) + 1 INTO v_old_rank
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE COALESCE(ur.role::text, 'ecowarrior') = v_role
    AND COALESCE(p.eco_points, 0) > COALESCE(OLD.eco_points, 0);

  -- Only notify if rank improved
  IF v_new_rank < v_old_rank THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'rank',
      '🏆 You climbed the ranks!',
      'You moved up to #' || v_new_rank || ' in the ' ||
      CASE WHEN v_role = 'ecodeveloper' THEN 'EcoDeveloper' ELSE 'EcoWarrior' END ||
      ' rankings!'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for rank change notifications
DROP TRIGGER IF EXISTS trg_notify_rank_change ON public.profiles;
CREATE TRIGGER trg_notify_rank_change
AFTER UPDATE OF eco_points ON public.profiles
FOR EACH ROW
WHEN (OLD.eco_points IS DISTINCT FROM NEW.eco_points)
EXECUTE FUNCTION public.notify_rank_change();

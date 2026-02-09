
-- Create a secure RPC function to join a swarm
-- This handles membership insert + swarm count update atomically
-- Bypasses the RLS restriction that only creators can update swarms
CREATE OR REPLACE FUNCTION public.join_swarm(p_swarm_id uuid, p_votes integer DEFAULT 1)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_existing UUID;
  v_influence INTEGER;
  v_new_participants INTEGER;
  v_new_signatures INTEGER;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if already a member
  SELECT id INTO v_existing
  FROM public.swarm_memberships
  WHERE swarm_id = p_swarm_id AND user_id = v_user_id;
  
  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'Already a member of this swarm';
  END IF;
  
  -- Calculate quadratic voting influence
  v_influence := p_votes * p_votes;
  
  -- Insert membership
  INSERT INTO public.swarm_memberships (swarm_id, user_id, votes)
  VALUES (p_swarm_id, v_user_id, p_votes);
  
  -- Update swarm counts
  UPDATE public.swarms
  SET participants = participants + 1,
      current_signatures = current_signatures + v_influence
  WHERE id = p_swarm_id
  RETURNING participants, current_signatures INTO v_new_participants, v_new_signatures;
  
  RETURN json_build_object(
    'participants', v_new_participants,
    'current_signatures', v_new_signatures
  );
END;
$$;

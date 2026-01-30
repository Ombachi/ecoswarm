-- Create swarms table for persistent swarm storage
CREATE TABLE public.swarms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  goal TEXT NOT NULL,
  category TEXT NOT NULL,
  target_signatures INTEGER NOT NULL DEFAULT 1000,
  current_signatures INTEGER NOT NULL DEFAULT 0,
  participants INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swarm_memberships table to track who joined which swarm
CREATE TABLE public.swarm_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swarm_id UUID NOT NULL REFERENCES public.swarms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  votes INTEGER NOT NULL DEFAULT 1,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(swarm_id, user_id)
);

-- Create challenges table for live challenges
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  type TEXT NOT NULL DEFAULT 'daily',
  action_type TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table to track completed challenges
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.swarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarm_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Swarms policies - anyone can view, authenticated users can create
CREATE POLICY "Anyone can view swarms" ON public.swarms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create swarms" ON public.swarms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
CREATE POLICY "Creators can update their swarms" ON public.swarms FOR UPDATE USING (auth.uid() = created_by);

-- Swarm memberships policies
CREATE POLICY "Anyone can view memberships" ON public.swarm_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join swarms" ON public.swarm_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave swarms" ON public.swarm_memberships FOR DELETE USING (auth.uid() = user_id);

-- Challenges policies - anyone can view active challenges
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (is_active = true);

-- User challenges policies
CREATE POLICY "Users can view their completions" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can complete challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add last_active_at column to profiles for streak tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Insert default challenges
INSERT INTO public.challenges (title, description, points, type, action_type) VALUES
  ('Share Your Story', 'Post about an environmental issue affecting you', 20, 'daily', 'post'),
  ('Join a Swarm', 'Become part of a campaign that matters to you', 30, 'daily', 'swarm'),
  ('Send an EcoLetter', 'Make your voice heard by a decision-maker', 50, 'weekly', 'letter'),
  ('Complete a Module', 'Learn something new in the Capacity Hub', 40, 'weekly', 'module'),
  ('Like 5 Posts', 'Engage with the community in Agora Square', 15, 'daily', 'engage');

-- Create function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_active TIMESTAMP WITH TIME ZONE;
  days_diff INTEGER;
BEGIN
  SELECT last_active_at INTO last_active FROM public.profiles WHERE user_id = NEW.user_id;
  
  IF last_active IS NOT NULL THEN
    days_diff := EXTRACT(DAY FROM (now() - last_active));
    
    IF days_diff = 1 THEN
      -- Consecutive day, increment streak
      UPDATE public.profiles SET streak = streak + 1, last_active_at = now() WHERE user_id = NEW.user_id;
    ELSIF days_diff > 1 THEN
      -- Streak broken, reset to 1
      UPDATE public.profiles SET streak = 1, last_active_at = now() WHERE user_id = NEW.user_id;
    ELSE
      -- Same day, just update last_active_at
      UPDATE public.profiles SET last_active_at = now() WHERE user_id = NEW.user_id;
    END IF;
  ELSE
    UPDATE public.profiles SET streak = 1, last_active_at = now() WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for streak update when user completes a challenge
CREATE TRIGGER update_streak_on_challenge
  AFTER INSERT ON public.user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_streak();

-- Insert initial swarms (using a placeholder UUID for created_by that will be updated)
INSERT INTO public.swarms (name, description, goal, category, target_signatures, current_signatures, participants, created_by) VALUES
  ('Nairobi River Clean-Up', 'Join thousands of Gen Z activists working to restore Nairobi River to its former glory. Weekly clean-ups, advocacy, and community engagement.', 'Collect 10,000 signatures to petition for river restoration funding', 'Water', 10000, 7834, 2341, '00000000-0000-0000-0000-000000000000'),
  ('Clean Air Nairobi', 'Fighting for breathable air in our city. Advocating for electric public transport, industrial regulations, and green spaces.', 'Push for electric matatu pilot program in CBD', 'Air Quality', 15000, 11234, 4567, '00000000-0000-0000-0000-000000000000'),
  ('Plant a Million Trees', 'Reforesting Kenya one tree at a time. Partner with local nurseries and communities to restore degraded lands.', 'Plant 1 million trees across Kenya by 2025', 'Reforestation', 50000, 34567, 8901, '00000000-0000-0000-0000-000000000000'),
  ('Plastic-Free Kenya', 'Eliminating single-use plastics from our communities. Education, alternatives, and policy advocacy.', 'Ban plastic packaging in 100 supermarkets', 'Waste', 20000, 8765, 3210, '00000000-0000-0000-0000-000000000000');
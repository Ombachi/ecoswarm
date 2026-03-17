
-- Create polls table for admin broadcast polls/campaigns
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  poll_type TEXT NOT NULL DEFAULT 'poll', -- 'poll', 'feedback', 'campaign'
  options JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{label: string, votes: number}]
  is_active BOOLEAN NOT NULL DEFAULT true,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active polls" ON public.polls FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage polls" ON public.polls FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Poll responses
CREATE TABLE public.poll_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_option INTEGER NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit responses" ON public.poll_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own responses" ON public.poll_responses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all responses" ON public.poll_responses FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

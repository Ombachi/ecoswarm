
-- Add new fields to swarms table
ALTER TABLE public.swarms 
  ADD COLUMN IF NOT EXISTS goal_type text DEFAULT 'Conservation Effort',
  ADD COLUMN IF NOT EXISTS target_number integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS end_date timestamp with time zone DEFAULT (now() + interval '30 days'),
  ADD COLUMN IF NOT EXISTS invite_method text DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS location text;

-- Create messages table for EcoMarket chat
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Users can view their own messages (sent or received)
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

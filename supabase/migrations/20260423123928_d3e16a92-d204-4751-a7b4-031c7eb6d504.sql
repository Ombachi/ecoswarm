-- Enable RLS on realtime.messages and restrict subscriptions to authenticated users
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies first
DROP POLICY IF EXISTS "Authenticated can subscribe" ON realtime.messages;

-- Only authenticated users can subscribe to realtime channels
-- Per-row access for actual data is still enforced by RLS on the underlying tables (postgres_changes)
CREATE POLICY "Authenticated can subscribe"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
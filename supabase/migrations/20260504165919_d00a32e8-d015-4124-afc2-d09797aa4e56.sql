-- Restrict realtime.messages to authenticated users only.
-- Application-level filtering still occurs via table RLS on the source rows.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated can receive broadcasts" ON realtime.messages;
CREATE POLICY "authenticated can receive broadcasts"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (true);
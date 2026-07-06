-- ============================================================
-- Remote Commands Queue — for the /solar-mining-cluster admin panel
-- Run this in the Supabase SQL Editor (same project as supabase_schema.sql)
--
-- The admin panel INSERTs rows here when you click a control button.
-- The ESP32-S3 should poll this table every ~15-30s for rows with
-- status='pending', apply the command, then UPDATE status to 'done'
-- (or 'failed') so the queue doesn't reprocess it.
-- ============================================================

CREATE TABLE IF NOT EXISTS commands (
    id        BIGSERIAL     PRIMARY KEY,
    ts        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    type      TEXT          NOT NULL,   -- r1_on | r1_off | r2_on | r2_off | avalon_mode | avalon_reboot | force_sync | auto_enable | auto_disable
    payload   JSONB         DEFAULT '{}'::jsonb,  -- e.g. {"mode":"low"} for avalon_mode
    status    TEXT          NOT NULL DEFAULT 'pending', -- pending | done | failed
    processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_commands_status ON commands (status, ts);

ALTER TABLE commands ENABLE ROW LEVEL SECURITY;

-- Public can INSERT commands (the web admin panel uses the anon key).
-- NOTE: The admin panel is protected client-side by a password gate,
-- but the anon key technically allows anyone to insert commands if they
-- know your Supabase URL/key. For stronger protection later, consider:
--   1) Moving command inserts behind a Supabase Edge Function with its
--      own secret check, or
--   2) Adding a "admin_token" column checked via a Postgres function.
CREATE POLICY "cmd_ins" ON commands FOR INSERT WITH CHECK (true);

-- Public can also SELECT (so the admin panel can show queued state) —
-- restrict this if you don't want command history to be publicly visible.
CREATE POLICY "cmd_sel" ON commands FOR SELECT USING (true);

-- The ESP32 needs to update status after processing. Since the ESP32 uses
-- the same anon key, allow UPDATE too (Restrict further with a service
-- role key server-side if you want tighter security).
CREATE POLICY "cmd_upd" ON commands FOR UPDATE USING (true) WITH CHECK (true);

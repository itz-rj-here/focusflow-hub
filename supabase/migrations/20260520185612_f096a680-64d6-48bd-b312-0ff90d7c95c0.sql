
-- 1. user_stats: one row per user with XP/coins/streak
CREATE TABLE public.user_stats (
  user_id uuid PRIMARY KEY,
  xp bigint NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  coins integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  streak_freezes integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own stats"
  ON public.user_stats FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "view friends stats"
  ON public.user_stats FOR SELECT TO authenticated
  USING (public.are_friends(auth.uid(), user_id));

CREATE POLICY "update own stats"
  ON public.user_stats FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "insert own stats"
  ON public.user_stats FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 2. xp_ledger: append-only log of every award (for idempotency + audit)
CREATE TABLE public.xp_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_key text NOT NULL,           -- e.g. 'focus_session', 'todo_complete', 'daily_streak'
  dedupe_key text,                    -- e.g. 'daily_streak:2026-05-20' to prevent dupes
  xp_delta integer NOT NULL DEFAULT 0,
  coins_delta integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dedupe_key)
);

CREATE INDEX idx_xp_ledger_user_created ON public.xp_ledger (user_id, created_at DESC);

ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own ledger"
  ON public.xp_ledger FOR SELECT TO authenticated
  USING (user_id = auth.uid());
-- Inserts happen only via server functions using the service role; no insert policy needed.

-- 3. Backfill existing users
INSERT INTO public.user_stats (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 4. Auto-create user_stats when a new profile is created
CREATE OR REPLACE FUNCTION public.create_user_stats_for_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_init_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_stats_for_profile();

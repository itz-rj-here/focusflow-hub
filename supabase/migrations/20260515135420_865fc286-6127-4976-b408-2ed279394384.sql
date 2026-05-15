ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS allow_friend_requests boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_focus_minutes integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS focus_sound text NOT NULL DEFAULT 'silent';
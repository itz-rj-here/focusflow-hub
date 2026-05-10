-- Add pause support to study_sessions
-- This enables users to pause and resume their focus sessions

ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS is_paused boolean not null default false,
ADD COLUMN IF NOT EXISTS paused_at timestamptz,
ADD COLUMN IF NOT EXISTS total_paused_seconds integer not null default 0;

-- Create index for faster queries on is_paused
CREATE INDEX IF NOT EXISTS idx_sessions_is_paused ON public.study_sessions(is_paused);
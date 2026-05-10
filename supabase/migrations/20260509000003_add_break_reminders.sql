-- Add break reminder settings to profiles
-- This enables users to get reminders to take breaks during focus sessions

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS break_reminder_enabled boolean not null default true,
ADD COLUMN IF NOT EXISTS break_reminder_interval_minutes integer not null default 25;
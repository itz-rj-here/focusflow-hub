-- Add notes field to study_sessions
-- This enables users to add reflections/notes after a focus session

ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS notes text;
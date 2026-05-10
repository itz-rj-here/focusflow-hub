-- Add description field to subjects
-- This enables users to add a description to their subjects

ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS description text;
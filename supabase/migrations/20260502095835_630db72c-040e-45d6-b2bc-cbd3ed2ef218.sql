-- Subjects table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color_code text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subjects_user ON public.subjects(user_id);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner all subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add subject_id to todos (optional)
ALTER TABLE public.todos ADD COLUMN subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL;
CREATE INDEX idx_todos_subject ON public.todos(subject_id);

-- Backfill: create a "General" subject for every existing profile
INSERT INTO public.subjects (user_id, name, color_code)
SELECT p.id, 'General', '#6366f1' FROM public.profiles p
ON CONFLICT DO NOTHING;

-- Add subject_id to study_sessions
ALTER TABLE public.study_sessions ADD COLUMN subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL;

-- Backfill existing sessions to user's General subject
UPDATE public.study_sessions s
SET subject_id = (SELECT id FROM public.subjects sub WHERE sub.user_id = s.user_id AND sub.name = 'General' LIMIT 1)
WHERE subject_id IS NULL;

-- Now make subject_id mandatory
ALTER TABLE public.study_sessions ALTER COLUMN subject_id SET NOT NULL;
CREATE INDEX idx_sessions_subject ON public.study_sessions(subject_id);

-- Update handle_new_user to also create the General subject
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'user'
  );
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]+', '_', 'g');
  if length(base_username) = 0 then base_username := 'user'; end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, avatar_url, visibility)
  values (
    new.id,
    final_username,
    new.raw_user_meta_data->>'avatar_url',
    'public'
  );

  insert into public.subjects (user_id, name, color_code)
  values (new.id, 'General', '#6366f1');

  return new;
end;
$function$;

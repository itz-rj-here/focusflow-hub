-- Todos: priority + due_date
ALTER TABLE public.todos
  ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS due_date date;
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(priority);

-- Study sessions: notes + pause support
ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS is_paused boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS total_paused_seconds integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_sessions_is_paused ON public.study_sessions(is_paused);

-- Subjects: description
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS description text;

-- Profiles: break reminder settings
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS break_reminder_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS break_reminder_interval_minutes integer NOT NULL DEFAULT 25;

-- Performance indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ended_at ON public.study_sessions(ended_at);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_invites_invitee ON public.room_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON public.room_participants(room_id);
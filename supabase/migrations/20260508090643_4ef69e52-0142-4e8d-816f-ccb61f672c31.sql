
-- Groups
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_members (
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_blocks (
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_blocked(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = _a AND blocked_id = _b) OR (blocker_id = _b AND blocked_id = _a)
  );
$$;

-- Groups policies
CREATE POLICY "view groups" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "create group" ON public.groups FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner update group" ON public.groups FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "owner delete group" ON public.groups FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- group_members policies
CREATE POLICY "view group members" ON public.group_members FOR SELECT TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));
CREATE POLICY "join group" ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "leave group" ON public.group_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.owner_id = auth.uid()));

-- Auto-add owner as member
CREATE OR REPLACE FUNCTION public.add_group_owner_as_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role) VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END; $$;
CREATE TRIGGER groups_add_owner_member AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.add_group_owner_as_member();

-- group_messages policies
CREATE POLICY "view group messages" ON public.group_messages FOR SELECT TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));
CREATE POLICY "send group message" ON public.group_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_group_member(group_id, auth.uid()));
CREATE POLICY "delete own group message" ON public.group_messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- direct_messages policies
CREATE POLICY "view own dms" ON public.direct_messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "send dm to friend" ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.are_friends(auth.uid(), recipient_id)
    AND NOT public.is_blocked(auth.uid(), recipient_id)
  );
CREATE POLICY "update own dm read" ON public.direct_messages FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- user_blocks policies
CREATE POLICY "view own blocks" ON public.user_blocks FOR SELECT TO authenticated USING (blocker_id = auth.uid());
CREATE POLICY "block user" ON public.user_blocks FOR INSERT TO authenticated WITH CHECK (blocker_id = auth.uid());
CREATE POLICY "unblock user" ON public.user_blocks FOR DELETE TO authenticated USING (blocker_id = auth.uid());

-- Indexes
CREATE INDEX idx_group_messages_group ON public.group_messages(group_id, created_at);
CREATE INDEX idx_dm_pair ON public.direct_messages(sender_id, recipient_id, created_at);
CREATE INDEX idx_dm_recipient ON public.direct_messages(recipient_id, created_at);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);

-- Realtime
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.group_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- Study Groups
CREATE TABLE public.study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_groups_created_by ON public.study_groups(created_by);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Anyone can view groups (for joining)
CREATE POLICY "view study groups" ON public.study_groups
  FOR SELECT TO authenticated
  USING (true);

-- Only members can insert
CREATE POLICY "members insert groups" ON public.study_groups
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Only admins can update/delete
CREATE POLICY "admins update groups" ON public.study_groups
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- Group Members
CREATE TABLE public.group_members (
  group_id uuid REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user ON public.group_members(user_id);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- View own group memberships
CREATE POLICY "view own group memberships" ON public.group_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Group members can join (via join function)
CREATE POLICY "members insert to groups" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Members can leave
CREATE POLICY "members delete from groups" ON public.group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Admins can update roles
CREATE POLICY "admins update group members" ON public.group_members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- Function to join a group via invite code
CREATE OR REPLACE FUNCTION public.join_group_by_code(p_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  SELECT sg.id INTO v_group_id
  FROM public.study_groups sg
  WHERE sg.invite_code = p_invite_code;
  
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = v_group_id AND gm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;
  
  -- Add member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'member');
  
  RETURN v_group_id;
END;
$$;

-- Function to get user's groups
CREATE OR REPLACE FUNCTION public.get_user_groups()
RETURNS TABLE (
  group_id uuid,
  name text,
  description text,
  invite_code text,
  role text,
  joined_at timestamptz,
  member_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sg.id AS group_id,
    sg.name,
    sg.description,
    sg.invite_code,
    gm.role,
    gm.joined_at,
    (
      SELECT count(*)::bigint 
      FROM public.group_members gm2 
      WHERE gm2.group_id = sg.id
    ) AS member_count
  FROM public.study_groups sg
  JOIN public.group_members gm ON gm.group_id = sg.id
  WHERE gm.user_id = auth.uid()
  ORDER BY gm.joined_at DESC;
END;
$$;

-- Function to get group leaderboard
CREATE OR REPLACE FUNCTION public.get_group_leaderboard(p_group_id uuid, p_range text)
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  total_seconds bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  cutoff timestamptz;
BEGIN
  IF p_range = 'day' THEN
    cutoff := date_trunc('day', now());
  ELSIF p_range = 'week' THEN
    cutoff := date_trunc('week', now());
  ELSE
    cutoff := 'epoch'::timestamptz;
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.username,
    p.avatar_url,
    coalesce(sum(s.duration_seconds), 0)::bigint as total_seconds
  FROM public.profiles p
  JOIN public.group_members gm ON gm.user_id = p.id
  LEFT JOIN public.study_sessions s 
    ON s.user_id = p.id 
    AND s.saved = true 
    AND s.ended_at >= cutoff
  WHERE gm.group_id = p_group_id
  GROUP BY p.id, p.username, p.avatar_url
  ORDER BY total_seconds DESC, p.username ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_groups() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_leaderboard(uuid, text) TO authenticated;
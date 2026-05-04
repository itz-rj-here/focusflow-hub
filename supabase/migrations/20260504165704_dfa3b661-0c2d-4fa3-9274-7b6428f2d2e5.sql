-- Fix 1: room_participants insert policy bug (i.room_id = i.room_id always true)
DROP POLICY IF EXISTS "join room i'm invited to" ON public.room_participants;
CREATE POLICY "join room i'm invited to" ON public.room_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.study_rooms r WHERE r.id = room_participants.room_id AND r.owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.room_invites i WHERE i.room_id = room_participants.room_id AND i.invitee_id = auth.uid() AND i.status = 'accepted')
    )
  );

-- Fix 2: friendships - only addressee can accept/change status
DROP POLICY IF EXISTS "update own friendship" ON public.friendships;
CREATE POLICY "addressee update friendship" ON public.friendships
  FOR UPDATE TO authenticated
  USING (addressee_id = auth.uid())
  WITH CHECK (addressee_id = auth.uid());

-- Fix 3: room_invites - only invitee can update status (inviter can DELETE to cancel)
DROP POLICY IF EXISTS "respond to invite" ON public.room_invites;
CREATE POLICY "respond to invite" ON public.room_invites
  FOR UPDATE TO authenticated
  USING (invitee_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid() AND status IN ('accepted','declined'));

-- Fix 4: is_room_member should only count accepted invites
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_rooms r WHERE r.id = _room_id AND r.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.room_participants p WHERE p.room_id = _room_id AND p.user_id = _user_id AND p.left_at IS NULL
  );
$$;

-- Fix 5: profiles invite_code exposure - revoke column-level access; add RPC for owner
REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (id, username, avatar_url, visibility, created_at) ON public.profiles TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_my_invite_code()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT invite_code FROM public.profiles WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_invite_code() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_invite_code() TO authenticated;

-- Fix 6: generate_invite_code missing search_path
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql SET search_path = public
AS $$
declare
  code text;
  done boolean := false;
begin
  while not done loop
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    done := not exists (select 1 from public.profiles where invite_code = code);
  end loop;
  return code;
end; $$;

-- Fix 7: revoke SECURITY DEFINER function execute from anon
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_friends_leaderboard(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.are_friends(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.generate_invite_code() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friends_leaderboard(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) TO authenticated;
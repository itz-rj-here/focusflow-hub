
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

DROP POLICY IF EXISTS "send dm to friend" ON public.direct_messages;
DROP POLICY IF EXISTS "view group members" ON public.group_members;
DROP POLICY IF EXISTS "send group message" ON public.group_messages;
DROP POLICY IF EXISTS "view group messages" ON public.group_messages;
DROP POLICY IF EXISTS "inviter create invite" ON public.room_invites;
DROP POLICY IF EXISTS "join room i'm invited to" ON public.room_participants;
DROP POLICY IF EXISTS "view participants in my rooms" ON public.room_participants;
DROP POLICY IF EXISTS "view rooms i belong to" ON public.study_rooms;
DROP POLICY IF EXISTS "view friends stats" ON public.user_stats;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_group_created ON public.groups;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Move all SECURITY DEFINER functions in public to private
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname AS func_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I(%s) SET SCHEMA private;', r.func_name, r.args);
  END LOOP;
END $$;

-- Lock down execute privileges
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname AS func_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'private'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION private.%I(%s) FROM PUBLIC, anon;', r.func_name, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION private.%I(%s) TO authenticated, service_role;', r.func_name, r.args);
  END LOOP;
END $$;

-- Recreate triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

CREATE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION private.add_group_owner_as_member();

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.create_user_stats_for_profile();

-- Recreate RLS policies
CREATE POLICY "send dm to friend" ON public.direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid()
              AND private.are_friends(auth.uid(), recipient_id)
              AND NOT private.is_blocked(auth.uid(), recipient_id));

CREATE POLICY "view group members" ON public.group_members
  FOR SELECT TO authenticated
  USING (private.is_group_member(group_id, auth.uid()));

CREATE POLICY "send group message" ON public.group_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND private.is_group_member(group_id, auth.uid()));

CREATE POLICY "view group messages" ON public.group_messages
  FOR SELECT TO authenticated
  USING (private.is_group_member(group_id, auth.uid()));

CREATE POLICY "inviter create invite" ON public.room_invites
  FOR INSERT TO authenticated
  WITH CHECK (inviter_id = auth.uid()
              AND EXISTS (SELECT 1 FROM public.study_rooms r WHERE r.id = room_invites.room_id AND r.owner_id = auth.uid())
              AND private.are_friends(auth.uid(), invitee_id));

CREATE POLICY "join room i'm invited to" ON public.room_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
              AND (EXISTS (SELECT 1 FROM public.study_rooms r WHERE r.id = room_participants.room_id AND r.owner_id = auth.uid())
                   OR EXISTS (SELECT 1 FROM public.room_invites i WHERE i.room_id = room_participants.room_id AND i.invitee_id = auth.uid() AND i.status = 'accepted')));

CREATE POLICY "view participants in my rooms" ON public.room_participants
  FOR SELECT TO authenticated
  USING (private.is_room_member(room_id, auth.uid()));

CREATE POLICY "view rooms i belong to" ON public.study_rooms
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR private.is_room_member(id, auth.uid()));

CREATE POLICY "view friends stats" ON public.user_stats
  FOR SELECT TO authenticated
  USING (private.are_friends(auth.uid(), user_id));

-- Public SECURITY INVOKER wrappers for client-callable RPCs
CREATE OR REPLACE FUNCTION public.award_xp(
  _action_key text, _xp integer, _coins integer,
  _dedupe_key text DEFAULT NULL, _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS TABLE(new_xp bigint, new_level integer, new_coins integer, leveled_up boolean, awarded boolean)
LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM private.award_xp(_action_key, _xp, _coins, _dedupe_key, _metadata);
$$;

CREATE OR REPLACE FUNCTION public.tick_daily_streak()
RETURNS TABLE(current_streak integer, longest_streak integer, streak_freezes integer, advanced boolean)
LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM private.tick_daily_streak();
$$;

CREATE OR REPLACE FUNCTION public.get_my_invite_code()
RETURNS text LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT private.get_my_invite_code();
$$;

CREATE OR REPLACE FUNCTION public.find_user_by_invite_code(_code text)
RETURNS TABLE(id uuid, username text, avatar_url text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM private.find_user_by_invite_code(_code);
$$;

CREATE OR REPLACE FUNCTION public.get_leaderboard(range_kind text)
RETURNS TABLE(user_id uuid, username text, avatar_url text, total_seconds bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM private.get_leaderboard(range_kind);
$$;

CREATE OR REPLACE FUNCTION public.get_friends_leaderboard(range_kind text)
RETURNS TABLE(user_id uuid, username text, avatar_url text, total_seconds bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT * FROM private.get_friends_leaderboard(range_kind);
$$;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname AS func_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('award_xp','tick_daily_streak','get_my_invite_code',
                        'find_user_by_invite_code','get_leaderboard','get_friends_leaderboard')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon;', r.func_name, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated;', r.func_name, r.args);
  END LOOP;
END $$;

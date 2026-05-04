CREATE OR REPLACE FUNCTION public.find_user_by_invite_code(_code text)
RETURNS TABLE(id uuid, username text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, username, avatar_url FROM public.profiles
  WHERE invite_code = upper(_code) AND id <> auth.uid()
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.find_user_by_invite_code(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.find_user_by_invite_code(text) TO authenticated;
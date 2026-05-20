
-- Level curve: xp_for_level(n) = 100 * n * (n+1) / 2  (cumulative)
-- Inverse: given total XP, find max level n where 100*n*(n+1)/2 <= xp
CREATE OR REPLACE FUNCTION public.level_from_xp(_xp bigint)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(1, FLOOR((-1 + SQRT(1 + 8 * (_xp::numeric / 100))) / 2)::int + 1);
$$;

-- award_xp: idempotent (via dedupe_key) award of XP + coins, updates user_stats
CREATE OR REPLACE FUNCTION public.award_xp(
  _action_key text,
  _xp integer,
  _coins integer,
  _dedupe_key text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(new_xp bigint, new_level integer, new_coins integer, leveled_up boolean, awarded boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _old_level integer;
  _new_level integer;
  _stats public.user_stats;
BEGIN
  IF _user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure stats row exists
  INSERT INTO public.user_stats (user_id) VALUES (_user)
  ON CONFLICT (user_id) DO NOTHING;

  -- Try to insert ledger entry; if dedupe key conflicts, skip the award
  BEGIN
    INSERT INTO public.xp_ledger (user_id, action_key, dedupe_key, xp_delta, coins_delta, metadata)
    VALUES (_user, _action_key, _dedupe_key, GREATEST(_xp, 0), GREATEST(_coins, 0), COALESCE(_metadata, '{}'::jsonb));
  EXCEPTION WHEN unique_violation THEN
    SELECT s.xp, s.level, s.coins INTO _stats.xp, _stats.level, _stats.coins
    FROM public.user_stats s WHERE s.user_id = _user;
    RETURN QUERY SELECT _stats.xp, _stats.level, _stats.coins, false, false;
    RETURN;
  END;

  SELECT level INTO _old_level FROM public.user_stats WHERE user_id = _user;

  UPDATE public.user_stats
  SET xp = xp + GREATEST(_xp, 0),
      coins = coins + GREATEST(_coins, 0),
      updated_at = now()
  WHERE user_id = _user
  RETURNING * INTO _stats;

  _new_level := public.level_from_xp(_stats.xp);

  IF _new_level <> _stats.level THEN
    UPDATE public.user_stats SET level = _new_level WHERE user_id = _user
    RETURNING * INTO _stats;
  END IF;

  RETURN QUERY SELECT _stats.xp, _stats.level, _stats.coins, (_new_level > _old_level), true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_xp(text, integer, integer, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_xp(text, integer, integer, text, jsonb) TO authenticated;

-- tick_daily_streak: advances streak on first activity of day, with freeze logic
CREATE OR REPLACE FUNCTION public.tick_daily_streak()
RETURNS TABLE(current_streak integer, longest_streak integer, streak_freezes integer, advanced boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _today date := (now() AT TIME ZONE 'UTC')::date;
  _stats public.user_stats;
  _gap integer;
  _new_streak integer;
  _freezes integer;
  _used_freeze boolean := false;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  INSERT INTO public.user_stats (user_id) VALUES (_user)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO _stats FROM public.user_stats WHERE user_id = _user;

  -- Already counted today
  IF _stats.last_active_date = _today THEN
    RETURN QUERY SELECT _stats.current_streak, _stats.longest_streak, _stats.streak_freezes, false;
    RETURN;
  END IF;

  IF _stats.last_active_date IS NULL THEN
    _new_streak := 1;
    _freezes := _stats.streak_freezes;
  ELSE
    _gap := _today - _stats.last_active_date;
    IF _gap = 1 THEN
      _new_streak := _stats.current_streak + 1;
      _freezes := _stats.streak_freezes;
    ELSIF _gap = 2 AND _stats.streak_freezes > 0 THEN
      -- Auto-consume one freeze for a single missed day
      _new_streak := _stats.current_streak + 1;
      _freezes := _stats.streak_freezes - 1;
      _used_freeze := true;
    ELSE
      _new_streak := 1;
      _freezes := _stats.streak_freezes;
    END IF;
  END IF;

  UPDATE public.user_stats
  SET current_streak = _new_streak,
      longest_streak = GREATEST(longest_streak, _new_streak),
      last_active_date = _today,
      streak_freezes = _freezes,
      updated_at = now()
  WHERE user_id = _user
  RETURNING * INTO _stats;

  -- Daily streak bonus (idempotent via dedupe_key)
  PERFORM public.award_xp(
    'daily_streak',
    20,
    5,
    'daily_streak:' || _today::text,
    jsonb_build_object('streak', _new_streak, 'used_freeze', _used_freeze)
  );

  RETURN QUERY SELECT _stats.current_streak, _stats.longest_streak, _stats.streak_freezes, true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tick_daily_streak() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tick_daily_streak() TO authenticated;


CREATE OR REPLACE FUNCTION public.level_from_xp(_xp bigint)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT GREATEST(1, FLOOR((-1 + SQRT(1 + 8 * (_xp::numeric / 100))) / 2)::int + 1);
$$;

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone authenticated can see public profiles, plus their own
create policy "view public profiles or own"
on public.profiles for select
to authenticated
using (visibility = 'public' or id = auth.uid());

create policy "users update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid());

create policy "users insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Todos
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index todos_user_id_idx on public.todos(user_id);
alter table public.todos enable row level security;

create policy "owner all todos" on public.todos
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Study sessions
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  todo_id uuid references public.todos(id) on delete set null,
  task_title text not null,
  duration_seconds integer not null default 0,
  saved boolean not null default false,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index study_sessions_user_idx on public.study_sessions(user_id);
create index study_sessions_started_idx on public.study_sessions(started_at);
alter table public.study_sessions enable row level security;

create policy "owner all sessions" on public.study_sessions
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Leaderboard function (security definer): aggregates only public profiles
create or replace function public.get_leaderboard(range_kind text)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  total_seconds bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  cutoff timestamptz;
begin
  if range_kind = 'day' then
    cutoff := date_trunc('day', now());
  elsif range_kind = 'week' then
    cutoff := date_trunc('week', now());
  else
    cutoff := 'epoch'::timestamptz;
  end if;

  return query
  select
    p.id as user_id,
    p.username,
    p.avatar_url,
    coalesce(sum(s.duration_seconds), 0)::bigint as total_seconds
  from public.profiles p
  left join public.study_sessions s
    on s.user_id = p.id
    and s.saved = true
    and s.ended_at >= cutoff
  where p.visibility = 'public'
  group by p.id, p.username, p.avatar_url
  order by total_seconds desc, p.username asc
  limit 100;
end;
$$;

grant execute on function public.get_leaderboard(text) to anon, authenticated;

-- 1. Profiles invite code
alter table public.profiles add column if not exists invite_code text unique;

create or replace function public.generate_invite_code()
returns text language plpgsql as $$
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

update public.profiles set invite_code = public.generate_invite_code() where invite_code is null;

alter table public.profiles alter column invite_code set not null;
alter table public.profiles alter column invite_code set default public.generate_invite_code();

-- 2. Friendships
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null,
  addressee_id uuid not null,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint friendships_distinct check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index idx_friendships_addressee on public.friendships(addressee_id);
create index idx_friendships_requester on public.friendships(requester_id);

alter table public.friendships enable row level security;

create policy "view own friendships" on public.friendships
  for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "create friend request" on public.friendships
  for insert to authenticated
  with check (requester_id = auth.uid());

create policy "update own friendship" on public.friendships
  for update to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "delete own friendship" on public.friendships
  for delete to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- 3. are_friends helper
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a))
  );
$$;

-- 4. Study rooms
create table public.study_rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  subject_id uuid,
  name text not null,
  status text not null default 'active' check (status in ('active','ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index idx_study_rooms_owner on public.study_rooms(owner_id);

alter table public.study_rooms enable row level security;

-- 5. Room invites
create table public.room_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.study_rooms(id) on delete cascade,
  invitee_id uuid not null,
  inviter_id uuid not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (room_id, invitee_id)
);

create index idx_room_invites_invitee on public.room_invites(invitee_id);

alter table public.room_invites enable row level security;

-- 6. Room participants
create table public.room_participants (
  room_id uuid not null references public.study_rooms(id) on delete cascade,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  duration_seconds integer not null default 0,
  primary key (room_id, user_id)
);

create index idx_room_participants_user on public.room_participants(user_id);

alter table public.room_participants enable row level security;

-- helper: is_room_member
create or replace function public.is_room_member(_room_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.study_rooms r where r.id = _room_id and r.owner_id = _user_id
  ) or exists (
    select 1 from public.room_participants p where p.room_id = _room_id and p.user_id = _user_id
  ) or exists (
    select 1 from public.room_invites i where i.room_id = _room_id and i.invitee_id = _user_id
  );
$$;

-- study_rooms policies
create policy "view rooms i belong to" on public.study_rooms
  for select to authenticated
  using (owner_id = auth.uid() or public.is_room_member(id, auth.uid()));

create policy "owner create room" on public.study_rooms
  for insert to authenticated with check (owner_id = auth.uid());

create policy "owner update room" on public.study_rooms
  for update to authenticated using (owner_id = auth.uid());

create policy "owner delete room" on public.study_rooms
  for delete to authenticated using (owner_id = auth.uid());

-- room_invites policies
create policy "view my invites" on public.room_invites
  for select to authenticated
  using (invitee_id = auth.uid() or inviter_id = auth.uid());

create policy "inviter create invite" on public.room_invites
  for insert to authenticated
  with check (
    inviter_id = auth.uid()
    and exists (select 1 from public.study_rooms r where r.id = room_id and r.owner_id = auth.uid())
    and public.are_friends(auth.uid(), invitee_id)
  );

create policy "respond to invite" on public.room_invites
  for update to authenticated
  using (invitee_id = auth.uid() or inviter_id = auth.uid());

create policy "delete invite" on public.room_invites
  for delete to authenticated
  using (inviter_id = auth.uid() or invitee_id = auth.uid());

-- room_participants policies
create policy "view participants in my rooms" on public.room_participants
  for select to authenticated
  using (public.is_room_member(room_id, auth.uid()));

create policy "join room i'm invited to" on public.room_participants
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (
      exists (select 1 from public.study_rooms r where r.id = room_id and r.owner_id = auth.uid())
      or exists (select 1 from public.room_invites i where i.room_id = room_id and i.invitee_id = auth.uid())
    )
  );

create policy "update own participation" on public.room_participants
  for update to authenticated using (user_id = auth.uid());

create policy "leave room" on public.room_participants
  for delete to authenticated using (user_id = auth.uid());

-- 7. Friends leaderboard function
create or replace function public.get_friends_leaderboard(range_kind text)
returns table(user_id uuid, username text, avatar_url text, total_seconds bigint)
language plpgsql stable security definer set search_path = public as $$
declare
  cutoff timestamptz;
  me uuid := auth.uid();
begin
  if me is null then return; end if;
  if range_kind = 'day' then cutoff := date_trunc('day', now());
  elsif range_kind = 'week' then cutoff := date_trunc('week', now());
  else cutoff := 'epoch'::timestamptz;
  end if;

  return query
  with friend_ids as (
    select case when requester_id = me then addressee_id else requester_id end as fid
    from public.friendships where status = 'accepted' and (requester_id = me or addressee_id = me)
    union select me
  )
  select p.id, p.username, p.avatar_url,
    coalesce(sum(s.duration_seconds), 0)::bigint
  from public.profiles p
  join friend_ids f on f.fid = p.id
  left join public.study_sessions s on s.user_id = p.id and s.saved = true and s.ended_at >= cutoff
  group by p.id, p.username, p.avatar_url
  order by 4 desc, p.username asc;
end; $$;

-- 8. Update handle_new_user to include invite_code (default handles it, but explicit)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'user');
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]+', '_', 'g');
  if length(base_username) = 0 then base_username := 'user'; end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, avatar_url, visibility, invite_code)
  values (new.id, final_username, new.raw_user_meta_data->>'avatar_url', 'public', public.generate_invite_code());

  insert into public.subjects (user_id, name, color_code)
  values (new.id, 'General', '#6366f1');
  return new;
end; $$;

-- 9. Realtime
alter publication supabase_realtime add table public.study_rooms;
alter publication supabase_realtime add table public.room_participants;
alter publication supabase_realtime add table public.room_invites;
alter publication supabase_realtime add table public.friendships;

alter table public.study_rooms replica identity full;
alter table public.room_participants replica identity full;
alter table public.room_invites replica identity full;
alter table public.friendships replica identity full;
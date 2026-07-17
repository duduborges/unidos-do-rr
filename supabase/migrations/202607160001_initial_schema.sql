create extension if not exists pgcrypto;

create table public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) >= 2),
  nickname text,
  shirt_number integer not null check (shirt_number between 0 and 99),
  position text not null check (position in ('goleiro', 'fixo', 'ala', 'meia', 'pivo')),
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index players_active_shirt_number_idx
on public.players (shirt_number)
where is_active;

create table public.opponents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  crest_url text,
  is_rival boolean not null default false,
  is_primary_rival boolean not null default false,
  rival_title text,
  rival_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_primary_rival or is_rival)
);

create unique index opponents_one_active_primary_rival_idx
on public.opponents (is_primary_rival)
where is_active and is_primary_rival;

create table public.fields (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text not null,
  maps_url text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index fields_one_active_primary_idx
on public.fields (is_primary)
where is_active and is_primary;

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  opponent_id uuid not null references public.opponents(id),
  field_id uuid not null references public.fields(id),
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  is_home boolean not null default true,
  started_at timestamptz,
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_valid_lifecycle check (
    (status = 'scheduled' and started_at is null and ended_at is null)
    or (status = 'live' and started_at is not null and ended_at is null)
    or (
      status = 'finished'
      and started_at is not null
      and ended_at is not null
      and ended_at >= started_at
    )
  )
);

create unique index matches_one_live_idx
on public.matches (status)
where status = 'live';

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type text not null default 'goal' check (event_type = 'goal'),
  beneficiary text not null check (beneficiary in ('unidos', 'opponent')),
  is_own_goal boolean not null default false,
  scorer_player_id uuid references public.players(id),
  assist_player_id uuid references public.players(id),
  minute_snapshot integer not null check (minute_snapshot >= 0),
  occurred_at timestamptz not null default now(),
  client_event_id uuid not null unique,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (assist_player_id is null or assist_player_id <> scorer_player_id),
  check (beneficiary <> 'unidos' or is_own_goal or scorer_player_id is not null),
  check (not is_own_goal or (scorer_player_id is null and assist_player_id is null))
);

create table public.stat_adjustments (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('player', 'club')),
  player_id uuid references public.players(id),
  metric text not null check (metric in ('goals', 'assists', 'wins', 'draws', 'losses')),
  delta integer not null check (delta <> 0),
  reason text not null check (length(trim(reason)) >= 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (
      scope = 'player'
      and player_id is not null
      and metric in ('goals', 'assists')
    )
    or (
      scope = 'club'
      and player_id is null
      and metric in ('wins', 'draws', 'losses')
    )
  )
);

create table public.club_settings (
  id boolean primary key default true check (id),
  club_name text not null default 'Unidos do RR',
  bio text not null default 'Unidos pelo bairro.',
  about_text text not null default 'Fut7 do Rio Vermelho, Florianopolis.',
  instagram_url text not null default 'https://www.instagram.com/unidosdorr/',
  locality text not null default 'Rio Vermelho, Florianopolis - SC',
  primary_field_id uuid references public.fields(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.club_settings default values;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

create or replace function public.enforce_match_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'scheduled' then
      new.started_at = null;
      new.ended_at = null;
    elsif new.status = 'live' then
      new.started_at = clock_timestamp();
      new.ended_at = null;
    elsif new.status = 'finished' then
      new.started_at = clock_timestamp();
      new.ended_at = new.started_at;
    end if;

    return new;
  end if;

  if old.status = 'finished' and new.status <> 'finished' then
    raise exception 'finished match cannot be reopened';
  end if;

  if old.status = 'live' and new.status = 'scheduled' then
    raise exception 'live match cannot return to scheduled';
  end if;

  if old.status = new.status then
    new.started_at = old.started_at;
    new.ended_at = old.ended_at;
    return new;
  end if;

  if old.status = 'scheduled' and new.status = 'live' then
    new.started_at = clock_timestamp();
    new.ended_at = null;
  elsif old.status = 'live' and new.status = 'finished' then
    new.started_at = old.started_at;
    new.ended_at = clock_timestamp();
  else
    raise exception 'invalid match status transition: % to %', old.status, new.status;
  end if;

  return new;
end;
$$;

create or replace function public.normalize_match_event()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_own_goal then
    new.scorer_player_id = null;
    new.assist_player_id = null;
  end if;

  return new;
end;
$$;

create or replace function public.set_event_minute()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_match public.matches;
  captured_at timestamptz := clock_timestamp();
  elapsed_until timestamptz;
begin
  select *
  into target_match
  from public.matches
  where id = new.match_id;

  if not found then
    raise exception 'match not found';
  end if;

  if target_match.started_at is null then
    raise exception 'match has not started';
  end if;

  elapsed_until = coalesce(target_match.ended_at, captured_at);
  new.occurred_at = captured_at;
  new.minute_snapshot = greatest(
    0,
    floor(extract(epoch from (elapsed_until - target_match.started_at)) / 60)::integer
  );

  return new;
end;
$$;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.start_match(p_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.matches;
begin
  if (select auth.role()) is distinct from 'authenticated'
    or not public.is_app_admin()
  then
    raise exception using errcode = '42501', message = 'not authorized';
  end if;

  update public.matches
  set status = 'live'
  where id = p_match_id and status = 'scheduled'
  returning * into result;

  if result.id is null then
    raise exception 'match cannot be started';
  end if;

  return result;
end;
$$;

create or replace function public.finish_match(p_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.matches;
begin
  if (select auth.role()) is distinct from 'authenticated'
    or not public.is_app_admin()
  then
    raise exception using errcode = '42501', message = 'not authorized';
  end if;

  update public.matches
  set status = 'finished'
  where id = p_match_id and status = 'live'
  returning * into result;

  if result.id is null then
    raise exception 'match cannot be finished';
  end if;

  return result;
end;
$$;

create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

create trigger opponents_set_updated_at
before update on public.opponents
for each row execute function public.set_updated_at();

create trigger fields_set_updated_at
before update on public.fields
for each row execute function public.set_updated_at();

create trigger matches_10_enforce_lifecycle
before insert or update on public.matches
for each row execute function public.enforce_match_lifecycle();

create trigger matches_90_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

create trigger match_events_10_normalize
before insert or update on public.match_events
for each row execute function public.normalize_match_event();

create trigger match_events_20_set_minute
before insert on public.match_events
for each row execute function public.set_event_minute();

create trigger match_events_90_set_updated_at
before update on public.match_events
for each row execute function public.set_updated_at();

create trigger stat_adjustments_set_updated_at
before update on public.stat_adjustments
for each row execute function public.set_updated_at();

create trigger club_settings_set_updated_at
before update on public.club_settings
for each row execute function public.set_updated_at();

alter table public.app_admins enable row level security;
alter table public.players enable row level security;
alter table public.opponents enable row level security;
alter table public.fields enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.stat_adjustments enable row level security;
alter table public.club_settings enable row level security;

create policy "users read own allowlist entry"
on public.app_admins
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "public reads players"
on public.players
for select
to anon, authenticated
using (is_active or public.is_app_admin());

create policy "admin writes players"
on public.players
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create policy "public reads opponents"
on public.opponents
for select
to anon, authenticated
using (is_active or public.is_app_admin());

create policy "admin writes opponents"
on public.opponents
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create policy "public reads fields"
on public.fields
for select
to anon, authenticated
using (is_active or public.is_app_admin());

create policy "admin writes fields"
on public.fields
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create policy "public reads matches"
on public.matches
for select
to anon, authenticated
using (true);

create policy "admin writes matches"
on public.matches
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create policy "public reads events"
on public.match_events
for select
to anon, authenticated
using (deleted_at is null or public.is_app_admin());

create policy "admin writes events"
on public.match_events
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create policy "public reads adjustments"
on public.stat_adjustments
for select
to anon, authenticated
using (true);

create policy "admin writes adjustments"
on public.stat_adjustments
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create policy "public reads settings"
on public.club_settings
for select
to anon, authenticated
using (true);

create policy "admin writes settings"
on public.club_settings
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

revoke all on table public.app_admins from anon, authenticated;
revoke all on table public.players from anon, authenticated;
revoke all on table public.opponents from anon, authenticated;
revoke all on table public.fields from anon, authenticated;
revoke all on table public.matches from anon, authenticated;
revoke all on table public.match_events from anon, authenticated;
revoke all on table public.stat_adjustments from anon, authenticated;
revoke all on table public.club_settings from anon, authenticated;

grant select on table public.app_admins to authenticated;
grant select on table public.players to anon;
grant select on table public.opponents to anon;
grant select on table public.fields to anon;
grant select on table public.matches to anon;
grant select on table public.match_events to anon;
grant select on table public.stat_adjustments to anon;
grant select on table public.club_settings to anon;

grant select, insert, update, delete on table public.players to authenticated;
grant select, insert, update, delete on table public.opponents to authenticated;
grant select, insert, update, delete on table public.fields to authenticated;
grant select, insert, update, delete on table public.matches to authenticated;
grant select, insert, update, delete on table public.match_events to authenticated;
grant select, insert, update, delete on table public.stat_adjustments to authenticated;
grant select, insert, update, delete on table public.club_settings to authenticated;

grant select, insert, update, delete on table
  public.app_admins,
  public.players,
  public.opponents,
  public.fields,
  public.matches,
  public.match_events,
  public.stat_adjustments,
  public.club_settings
to service_role;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.enforce_match_lifecycle() from public, anon, authenticated;
revoke all on function public.normalize_match_event() from public, anon, authenticated;
revoke all on function public.set_event_minute() from public, anon, authenticated;
revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to anon, authenticated;
revoke all on function public.start_match(uuid) from public, anon;
revoke all on function public.finish_match(uuid) from public, anon;
grant execute on function public.start_match(uuid) to authenticated;
grant execute on function public.finish_match(uuid) to authenticated;

alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.match_events;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'players',
    'players',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'opponents',
    'opponents',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads club media"
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('players', 'opponents'));

create policy "admins insert club media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('players', 'opponents')
  and public.is_app_admin()
);

create policy "admins update club media"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('players', 'opponents')
  and public.is_app_admin()
)
with check (
  bucket_id in ('players', 'opponents')
  and public.is_app_admin()
);

create policy "admins delete club media"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('players', 'opponents')
  and public.is_app_admin()
);

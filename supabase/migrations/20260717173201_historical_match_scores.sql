alter table public.matches
  add column score_unidos integer,
  add column score_opponent integer;

update public.matches as match
set
  score_unidos = (
    select count(*)::integer
    from public.match_events as event
    where event.match_id = match.id
      and event.deleted_at is null
      and event.beneficiary = 'unidos'
  ),
  score_opponent = (
    select count(*)::integer
    from public.match_events as event
    where event.match_id = match.id
      and event.deleted_at is null
      and event.beneficiary = 'opponent'
  )
where match.status = 'finished';

alter table public.matches
  add constraint matches_finished_score
  check (
    (
      status = 'finished'
      and score_unidos is not null
      and score_opponent is not null
      and score_unidos >= 0
      and score_opponent >= 0
    )
    or (
      status in ('scheduled', 'live')
      and score_unidos is null
      and score_opponent is null
    )
  );

alter table public.match_events
  drop constraint match_events_check1;

create or replace function public.enforce_match_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  captured_at timestamptz := clock_timestamp();
  has_recorded_events boolean;
  active_unidos_count integer;
  active_opponent_count integer;
begin
  if tg_op = 'INSERT' then
    if new.status = 'scheduled' then
      new.started_at = null;
      new.ended_at = null;
      new.score_unidos = null;
      new.score_opponent = null;
    elsif new.status = 'live' then
      new.started_at = captured_at;
      new.ended_at = null;
      new.score_unidos = null;
      new.score_opponent = null;
    elsif new.status = 'finished' then
      if new.scheduled_at >= captured_at then
        raise exception 'finished match must be scheduled in the past';
      end if;

      new.started_at = coalesce(new.started_at, new.scheduled_at);
      new.ended_at = coalesce(new.ended_at, new.started_at + interval '60 minutes');

      if new.started_at > captured_at or new.ended_at > captured_at then
        raise exception 'finished match timestamps cannot be in the future';
      end if;
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
    if new.status = 'scheduled' then
      new.started_at = null;
      new.ended_at = null;
      new.score_unidos = null;
      new.score_opponent = null;
    elsif new.status = 'live' then
      new.started_at = old.started_at;
      new.ended_at = null;
      new.score_unidos = null;
      new.score_opponent = null;
    elsif new.status = 'finished' then
      if new.started_at > captured_at or new.ended_at > captured_at then
        raise exception 'finished match timestamps cannot be in the future';
      end if;

      select
        count(*) > 0,
        count(*) filter (
          where deleted_at is null and beneficiary = 'unidos'
        )::integer,
        count(*) filter (
          where deleted_at is null and beneficiary = 'opponent'
        )::integer
      into
        has_recorded_events,
        active_unidos_count,
        active_opponent_count
      from public.match_events
      where match_id = new.id;

      if has_recorded_events
        and (
          new.started_at is distinct from old.started_at
          or new.ended_at is distinct from old.ended_at
        )
      then
        raise exception 'finished match timestamps cannot change after events are recorded';
      end if;

      if new.score_unidos < active_unidos_count
        or new.score_opponent < active_opponent_count
      then
        raise exception 'finished score cannot be lower than active event count';
      end if;

    end if;

    return new;
  end if;

  if old.status = 'scheduled' and new.status = 'live' then
    new.started_at = captured_at;
    new.ended_at = null;
    new.score_unidos = null;
    new.score_opponent = null;
  elsif old.status = 'live' and new.status = 'finished' then
    new.started_at = old.started_at;
    new.ended_at = captured_at;

    select
      count(*) filter (where beneficiary = 'unidos')::integer,
      count(*) filter (where beneficiary = 'opponent')::integer
    into new.score_unidos, new.score_opponent
    from public.match_events
    where match_id = new.id
      and deleted_at is null;
  else
    raise exception 'invalid match status transition: % to %', old.status, new.status;
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
  duration_minutes integer;
begin
  select *
  into target_match
  from public.matches
  where id = new.match_id
  for update;

  if not found then
    raise exception 'match not found';
  end if;

  if target_match.status = 'scheduled' then
    raise exception 'cannot add event to scheduled match';
  elsif target_match.status = 'live' then
    new.occurred_at = captured_at;
    new.minute_snapshot = greatest(
      0,
      floor(extract(epoch from (captured_at - target_match.started_at)) / 60)::integer
    );
  elsif target_match.status = 'finished' then
    duration_minutes = floor(
      extract(epoch from (target_match.ended_at - target_match.started_at)) / 60
    )::integer;

    if new.minute_snapshot is null
      or new.minute_snapshot < 0
      or new.minute_snapshot > duration_minutes
    then
      raise exception 'event minute must be between zero and match duration';
    end if;

    new.occurred_at =
      target_match.started_at + make_interval(mins => new.minute_snapshot);
  end if;

  return new;
end;
$$;

drop trigger match_events_20_set_minute on public.match_events;

create trigger match_events_20_set_minute
before insert or update of match_id, minute_snapshot, occurred_at
on public.match_events
for each row execute function public.set_event_minute();

create or replace function public.validate_finished_match_event_score()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_status text;
  target_score integer;
  existing_event_id uuid;
  active_event_count bigint;
begin
  if new.deleted_at is not null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    existing_event_id = old.id;
  end if;

  select
    status,
    case new.beneficiary
      when 'unidos' then score_unidos
      when 'opponent' then score_opponent
    end
  into target_status, target_score
  from public.matches
  where id = new.match_id
  for update;

  if not found then
    raise exception 'match not found';
  end if;

  if target_status <> 'finished' then
    return new;
  end if;

  select count(*)
  into active_event_count
  from public.match_events
  where match_id = new.match_id
    and beneficiary = new.beneficiary
    and deleted_at is null
    and (existing_event_id is null or id <> existing_event_id);

  if active_event_count + 1 > target_score then
    raise exception 'active event count exceeds finished match score';
  end if;

  return new;
end;
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
  if not public.is_app_admin() then
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
  if not public.is_app_admin() then
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

create trigger match_events_30_validate_finished_score
before insert or update on public.match_events
for each row execute function public.validate_finished_match_event_score();

revoke all on function public.enforce_match_lifecycle()
from public, anon, authenticated;

revoke all on function public.set_event_minute()
from public, anon, authenticated;

revoke all on function public.validate_finished_match_event_score()
from public, anon, authenticated;

revoke all on function public.start_match(uuid) from public, anon;
revoke all on function public.finish_match(uuid) from public, anon;
grant execute on function public.start_match(uuid) to authenticated;
grant execute on function public.finish_match(uuid) to authenticated;

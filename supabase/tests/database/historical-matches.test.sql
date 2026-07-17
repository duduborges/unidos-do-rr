begin;

create extension if not exists pgtap with schema extensions;
create extension if not exists dblink with schema extensions;

select plan(70);

select has_column('public', 'matches', 'score_unidos', 'matches has Unidos score');
select has_column('public', 'matches', 'score_opponent', 'matches has opponent score');
select col_type_is('public', 'matches', 'score_unidos', 'integer', 'Unidos score is an integer');
select col_type_is('public', 'matches', 'score_opponent', 'integer', 'opponent score is an integer');
select is(
  (
    select count(*)
    from pg_constraint
    where conrelid = 'public.matches'::regclass
      and conname = 'matches_finished_score'
  ),
  1::bigint,
  'match status and scores are constrained together'
);

insert into public.opponents (id, name)
values ('10000000-0000-0000-0000-000000000001', 'Adversario Historico');

insert into public.fields (id, name, address)
values (
  '20000000-0000-0000-0000-000000000001',
  'Campo Historico',
  'Rua das Partidas, 60'
);

insert into public.players (id, name, shirt_number, position)
values ('30000000-0000-0000-0000-000000000001', 'Autor Historico', 88, 'ala');

select throws_ok(
  $sql$
    insert into public.matches (opponent_id, field_id, scheduled_at, status)
    values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '2020-01-01 10:00:00+00',
      'finished'
    )
  $sql$,
  '23514',
  null::text,
  'finished matches require both scores'
);

select throws_ok(
  $sql$
    insert into public.matches (
      opponent_id,
      field_id,
      scheduled_at,
      status,
      score_unidos,
      score_opponent
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '2020-01-01 10:00:00+00',
      'finished',
      -1,
      0
    )
  $sql$,
  '23514',
  null::text,
  'finished scores cannot be negative'
);

select throws_ok(
  $sql$
    insert into public.matches (
      opponent_id,
      field_id,
      scheduled_at,
      status,
      score_unidos,
      score_opponent
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      clock_timestamp() + interval '1 day',
      'finished',
      0,
      0
    )
  $sql$,
  'P0001',
  'finished match must be scheduled in the past',
  'historical matches must be scheduled in the past'
);

select throws_ok(
  $sql$
    insert into public.matches (
      opponent_id,
      field_id,
      scheduled_at,
      status,
      started_at,
      ended_at,
      score_unidos,
      score_opponent
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '2020-01-01 10:00:00+00',
      'finished',
      clock_timestamp() + interval '1 day',
      clock_timestamp() + interval '2 days',
      0,
      0
    )
  $sql$,
  'P0001',
  'finished match timestamps cannot be in the future',
  'historical inserts reject a future start'
);

select throws_ok(
  $sql$
    insert into public.matches (
      opponent_id,
      field_id,
      scheduled_at,
      status,
      started_at,
      ended_at,
      score_unidos,
      score_opponent
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '2020-01-01 10:00:00+00',
      'finished',
      clock_timestamp() - interval '1 hour',
      clock_timestamp() + interval '1 hour',
      0,
      0
    )
  $sql$,
  'P0001',
  'finished match timestamps cannot be in the future',
  'historical inserts reject a future end'
);

select throws_ok(
  $sql$
    insert into public.matches (
      opponent_id,
      field_id,
      scheduled_at,
      status,
      started_at,
      ended_at,
      score_unidos,
      score_opponent
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '2020-01-01 10:00:00+00',
      'finished',
      '2020-01-01 11:00:00+00',
      '2020-01-01 10:00:00+00',
      0,
      0
    )
  $sql$,
  '23514',
  null::text,
  'historical inserts require the end at or after the start'
);

select lives_ok(
  $sql$
    insert into public.matches (
      id,
      opponent_id,
      field_id,
      scheduled_at,
      status,
      started_at,
      score_unidos,
      score_opponent
    ) values (
      '40000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '2020-01-01 09:45:00+00',
      'finished',
      '2020-01-01 10:00:00+00',
      2,
      1
    )
  $sql$,
  'a finished historical match can be inserted'
);

select is(
  (select started_at from public.matches where id = '40000000-0000-0000-0000-000000000001'),
  '2020-01-01 10:00:00+00'::timestamptz,
  'historical started_at is preserved'
);
select is(
  (select ended_at from public.matches where id = '40000000-0000-0000-0000-000000000001'),
  '2020-01-01 11:00:00+00'::timestamptz,
  'historical match defaults to sixty minutes'
);
select results_eq(
  $sql$
    select score_unidos, score_opponent
    from public.matches
    where id = '40000000-0000-0000-0000-000000000001'
  $sql$,
  $$values (2, 1)$$,
  'historical scores are preserved'
);

select lives_ok(
  $sql$
    insert into public.matches (
      id,
      opponent_id,
      field_id,
      scheduled_at,
      status,
      ended_at,
      score_unidos,
      score_opponent
    ) values (
      '40000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      '2020-02-01 20:00:00+00',
      'finished',
      '2020-02-01 21:30:00+00',
      0,
      0
    )
  $sql$,
  'historical timestamps may use the scheduled start'
);
select is(
  (select started_at from public.matches where id = '40000000-0000-0000-0000-000000000002'),
  '2020-02-01 20:00:00+00'::timestamptz,
  'scheduled_at is the fallback historical start'
);
select is(
  (select ended_at from public.matches where id = '40000000-0000-0000-0000-000000000002'),
  '2020-02-01 21:30:00+00'::timestamptz,
  'an informed historical end is preserved'
);

select lives_ok(
  $sql$
    insert into public.matches (
      id,
      opponent_id,
      field_id,
      scheduled_at,
      status,
      started_at,
      ended_at,
      score_unidos,
      score_opponent
    ) values (
      '40000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      clock_timestamp() + interval '1 day',
      'scheduled',
      clock_timestamp(),
      clock_timestamp(),
      9,
      8
    )
  $sql$,
  'scheduled inserts accept and normalize stale lifecycle data'
);
select results_eq(
  $sql$
    select
      started_at is null,
      ended_at is null,
      score_unidos is null,
      score_opponent is null
    from public.matches
    where id = '40000000-0000-0000-0000-000000000003'
  $sql$,
  $$values (true, true, true, true)$$,
  'scheduled inserts clear timestamps and scores'
);

select throws_ok(
  $sql$
    insert into public.match_events (
      match_id,
      beneficiary,
      minute_snapshot,
      client_event_id
    ) values (
      '40000000-0000-0000-0000-000000000003',
      'opponent',
      0,
      '50000000-0000-0000-0000-000000000001'
    )
  $sql$,
  'P0001',
  'cannot add event to scheduled match',
  'scheduled matches reject events'
);

select lives_ok(
  $sql$
    insert into public.match_events (
      id,
      match_id,
      beneficiary,
      scorer_player_id,
      minute_snapshot,
      client_event_id
    ) values (
      '50000000-0000-0000-0000-000000000010',
      '40000000-0000-0000-0000-000000000001',
      'unidos',
      null,
      37,
      '60000000-0000-0000-0000-000000000010'
    )
  $sql$,
  'historical Unidos goals may omit the scorer'
);
select is(
  (select minute_snapshot from public.match_events where id = '50000000-0000-0000-0000-000000000010'),
  37,
  'historical event minute is preserved'
);
select is(
  (select occurred_at from public.match_events where id = '50000000-0000-0000-0000-000000000010'),
  '2020-01-01 10:37:00+00'::timestamptz,
  'historical occurred_at is derived from its minute'
);

select lives_ok(
  $sql$
    insert into public.match_events (
      id,
      match_id,
      beneficiary,
      scorer_player_id,
      minute_snapshot,
      client_event_id
    ) values (
      '50000000-0000-0000-0000-000000000011',
      '40000000-0000-0000-0000-000000000001',
      'unidos',
      '30000000-0000-0000-0000-000000000001',
      40,
      '60000000-0000-0000-0000-000000000011'
    )
  $sql$,
  'partial historical detail may reach the consolidated score'
);

insert into public.match_events (
  id,
  match_id,
  beneficiary,
  minute_snapshot,
  client_event_id
) values (
  '50000000-0000-0000-0000-000000000013',
  '40000000-0000-0000-0000-000000000001',
  'opponent',
  50,
  '60000000-0000-0000-0000-000000000014'
);

select throws_ok(
  $sql$
    update public.match_events
    set minute_snapshot = -1
    where id = '50000000-0000-0000-0000-000000000010'
  $sql$,
  'P0001',
  'event minute must be between zero and match duration',
  'historical event updates reject negative minutes'
);

select throws_ok(
  $sql$
    update public.match_events
    set minute_snapshot = 61
    where id = '50000000-0000-0000-0000-000000000010'
  $sql$,
  'P0001',
  'event minute must be between zero and match duration',
  'historical event updates reject minutes above duration'
);

select lives_ok(
  $sql$
    update public.match_events
    set minute_snapshot = 25
    where id = '50000000-0000-0000-0000-000000000010'
  $sql$,
  'historical event minutes can be corrected'
);

select is(
  (select occurred_at from public.match_events where id = '50000000-0000-0000-0000-000000000010'),
  '2020-01-01 10:25:00+00'::timestamptz,
  'historical event updates keep occurred_at coherent with the minute'
);

select throws_ok(
  $sql$
    insert into public.match_events (
      id,
      match_id,
      beneficiary,
      minute_snapshot,
      client_event_id
    ) values (
      '50000000-0000-0000-0000-000000000012',
      '40000000-0000-0000-0000-000000000001',
      'unidos',
      42,
      '60000000-0000-0000-0000-000000000012'
    )
  $sql$,
  'P0001',
  'active event count exceeds finished match score',
  'event detail cannot exceed the consolidated score'
);

select lives_ok(
  $sql$
    update public.match_events
    set deleted_at = clock_timestamp()
    where id = '50000000-0000-0000-0000-000000000011'
  $sql$,
  'soft deleting an event releases its score slot'
);
select lives_ok(
  $sql$
    insert into public.match_events (
      id,
      match_id,
      beneficiary,
      minute_snapshot,
      client_event_id
    ) values (
      '50000000-0000-0000-0000-000000000012',
      '40000000-0000-0000-0000-000000000001',
      'unidos',
      42,
      '60000000-0000-0000-0000-000000000012'
    )
  $sql$,
  'a released score slot can be detailed again'
);
select throws_ok(
  $sql$
    update public.match_events
    set deleted_at = null
    where id = '50000000-0000-0000-0000-000000000011'
  $sql$,
  'P0001',
  'active event count exceeds finished match score',
  'restoring an event cannot exceed the consolidated score'
);

select is(
  (
    select count(*)
    from public.match_events
    where match_id = '40000000-0000-0000-0000-000000000001'
      and beneficiary = 'unidos'
      and deleted_at is null
  ),
  2::bigint,
  'only active event details count against the score'
);

select throws_ok(
  $sql$
    update public.matches
    set score_unidos = 1
    where id = '40000000-0000-0000-0000-000000000001'
  $sql$,
  'P0001',
  'finished score cannot be lower than active event count',
  'finished Unidos score cannot drop below active event detail'
);

select throws_ok(
  $sql$
    update public.matches
    set score_opponent = 0
    where id = '40000000-0000-0000-0000-000000000001'
  $sql$,
  'P0001',
  'finished score cannot be lower than active event count',
  'finished opponent score cannot drop below active event detail'
);

select throws_ok(
  $sql$
    insert into public.match_events (
      match_id,
      beneficiary,
      minute_snapshot,
      client_event_id
    ) values (
      '40000000-0000-0000-0000-000000000001',
      'opponent',
      61,
      '60000000-0000-0000-0000-000000000013'
    )
  $sql$,
  'P0001',
  'event minute must be between zero and match duration',
  'historical event minute cannot exceed match duration'
);

select throws_ok(
  $sql$
    update public.matches
    set ended_at = '2020-01-01 10:45:00+00'
    where id = '40000000-0000-0000-0000-000000000001'
  $sql$,
  'P0001',
  'finished match timestamps cannot change after events are recorded',
  'finished end cannot change after an active event is recorded'
);

select throws_ok(
  $sql$
    update public.matches
    set started_at = '2020-01-01 09:45:00+00'
    where id = '40000000-0000-0000-0000-000000000001'
  $sql$,
  'P0001',
  'finished match timestamps cannot change after events are recorded',
  'finished start cannot change after an active event is recorded'
);

insert into public.matches (
  id,
  opponent_id,
  field_id,
  scheduled_at,
  status,
  started_at,
  ended_at,
  score_unidos,
  score_opponent
) values (
  '40000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '2020-04-01 09:00:00+00',
  'finished',
  '2020-04-01 10:00:00+00',
  '2020-04-01 11:00:00+00',
  1,
  0
);

insert into public.match_events (
  id,
  match_id,
  beneficiary,
  minute_snapshot,
  client_event_id
) values (
  '50000000-0000-0000-0000-000000000020',
  '40000000-0000-0000-0000-000000000005',
  'unidos',
  15,
  '60000000-0000-0000-0000-000000000040'
);

update public.match_events
set deleted_at = clock_timestamp()
where id = '50000000-0000-0000-0000-000000000020';

select throws_ok(
  $sql$
    update public.matches
    set
      started_at = '2020-04-01 09:30:00+00',
      ended_at = '2020-04-01 10:30:00+00'
    where id = '40000000-0000-0000-0000-000000000005'
  $sql$,
  'P0001',
  'finished match timestamps cannot change after events are recorded',
  'finished timestamps cannot change when the only event is soft-deleted'
);

select lives_ok(
  $sql$
    update public.matches
    set
      started_at = '2020-02-01 19:30:00+00',
      ended_at = '2020-02-01 20:45:00+00',
      score_unidos = 3,
      score_opponent = 1
    where id = '40000000-0000-0000-0000-000000000002'
  $sql$,
  'finished timestamps remain correctable when no event exists'
);
select results_eq(
  $sql$
    select started_at, ended_at, score_unidos, score_opponent
    from public.matches
    where id = '40000000-0000-0000-0000-000000000002'
  $sql$,
  $expected$values (
    '2020-02-01 19:30:00+00'::timestamptz,
    '2020-02-01 20:45:00+00'::timestamptz,
    3,
    1
  )$expected$,
  'eventless finished corrections preserve informed lifecycle data'
);

select throws_ok(
  $sql$
    update public.matches
    set
      started_at = clock_timestamp() + interval '1 day',
      ended_at = clock_timestamp() + interval '2 days'
    where id = '40000000-0000-0000-0000-000000000002'
  $sql$,
  'P0001',
  'finished match timestamps cannot be in the future',
  'finished corrections reject a future start'
);

select throws_ok(
  $sql$
    update public.matches
    set ended_at = clock_timestamp() + interval '1 day'
    where id = '40000000-0000-0000-0000-000000000002'
  $sql$,
  'P0001',
  'finished match timestamps cannot be in the future',
  'finished corrections reject a future end'
);

select throws_ok(
  $sql$
    update public.matches
    set ended_at = started_at - interval '1 minute'
    where id = '40000000-0000-0000-0000-000000000002'
  $sql$,
  '23514',
  null::text,
  'finished corrections require the end at or after the start'
);

select throws_ok(
  $sql$
    update public.matches
    set status = 'live'
    where id = '40000000-0000-0000-0000-000000000001'
  $sql$,
  'P0001',
  'finished match cannot be reopened',
  'finished matches cannot reopen'
);

select lives_ok(
  $sql$
    insert into public.matches (
      id,
      opponent_id,
      field_id,
      scheduled_at,
      status,
      started_at,
      ended_at,
      score_unidos,
      score_opponent
    ) values (
      '40000000-0000-0000-0000-000000000004',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      clock_timestamp(),
      'live',
      '2010-01-01 00:00:00+00',
      '2010-01-01 01:00:00+00',
      9,
      8
    )
  $sql$,
  'a live match can be inserted'
);
select results_eq(
  $sql$
    select
      started_at > '2010-01-01 00:00:00+00'::timestamptz,
      ended_at is null,
      score_unidos is null,
      score_opponent is null
    from public.matches
    where id = '40000000-0000-0000-0000-000000000004'
  $sql$,
  $$values (true, true, true, true)$$,
  'live inserts use the current clock and clear scores'
);

insert into public.match_events (match_id, beneficiary, minute_snapshot, client_event_id)
values
  (
    '40000000-0000-0000-0000-000000000004',
    'unidos',
    50,
    '60000000-0000-0000-0000-000000000020'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'unidos',
    50,
    '60000000-0000-0000-0000-000000000021'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'opponent',
    50,
    '60000000-0000-0000-0000-000000000022'
  );

select lives_ok(
  $sql$
    update public.matches
    set status = 'finished'
    where id = '40000000-0000-0000-0000-000000000004'
  $sql$,
  'a live match can be finished'
);
select results_eq(
  $sql$
    select score_unidos, score_opponent
    from public.matches
    where id = '40000000-0000-0000-0000-000000000004'
  $sql$,
  $$values (2, 1)$$,
  'finishing a live match consolidates active events'
);
select ok(
  (
    select started_at is not null and ended_at >= started_at
    from public.matches
    where id = '40000000-0000-0000-0000-000000000004'
  ),
  'finishing a live match freezes a valid clock'
);

select lives_ok(
  $sql$
    update public.matches
    set status = 'live'
    where id = '40000000-0000-0000-0000-000000000003'
  $sql$,
  'a scheduled match can transition to live'
);
select results_eq(
  $sql$
    select
      started_at is not null,
      ended_at is null,
      score_unidos is null,
      score_opponent is null
    from public.matches
    where id = '40000000-0000-0000-0000-000000000003'
  $sql$,
  $$values (true, true, true, true)$$,
  'scheduled to live initializes only the live clock'
);

select is(
  (
    select count(*)
    from pg_constraint
    where conrelid = 'public.match_events'::regclass
      and conname = 'match_events_check1'
  ),
  0::bigint,
  'only the mandatory Unidos scorer constraint is removed'
);
select is(
  (
    select count(*)
    from pg_constraint
    where conrelid = 'public.match_events'::regclass
      and conname in ('match_events_check', 'match_events_check2')
  ),
  2::bigint,
  'assist and own-goal checks remain in place'
);

select has_function(
  'public',
  'validate_finished_match_event_score',
  array[]::text[],
  'finished score validation trigger function exists'
);
select ok(
  not has_function_privilege(
    'public',
    'public.validate_finished_match_event_score()',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.validate_finished_match_event_score()',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.validate_finished_match_event_score()',
    'execute'
  ),
  'new trigger function is not executable by API roles'
);

select ok(
  (
    select
      position('auth.role' in pg_get_functiondef('public.start_match(uuid)'::regprocedure)) = 0
      and position(
        'not public.is_app_admin()'
        in pg_get_functiondef('public.start_match(uuid)'::regprocedure)
      ) > 0
  ),
  'start_match authorizes only through is_app_admin'
);

select ok(
  (
    select
      position('auth.role' in pg_get_functiondef('public.finish_match(uuid)'::regprocedure)) = 0
      and position(
        'not public.is_app_admin()'
        in pg_get_functiondef('public.finish_match(uuid)'::regprocedure)
      ) > 0
  ),
  'finish_match authorizes only through is_app_admin'
);

select ok(
  not has_function_privilege('anon', 'public.start_match(uuid)', 'execute')
  and not has_function_privilege('anon', 'public.finish_match(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.start_match(uuid)', 'execute')
  and has_function_privilege('authenticated', 'public.finish_match(uuid)', 'execute'),
  'match RPC grants remain restricted to authenticated users'
);

do $block$
declare
  connection_string text :=
    'host=host.docker.internal port=54322 dbname=postgres user=postgres password=postgres';
begin
  perform extensions.dblink_connect('match_writer', connection_string);
  perform extensions.dblink_connect('event_writer', connection_string);

  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.match_events
      where match_id = '70000000-0000-0000-0000-000000000003'$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.matches
      where id = '70000000-0000-0000-0000-000000000003'$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.opponents
      where id = '70000000-0000-0000-0000-000000000001'$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.fields
      where id = '70000000-0000-0000-0000-000000000002'$remote$
  );

  perform extensions.dblink_exec(
    'match_writer',
    $remote$insert into public.opponents (id, name)
      values (
        '70000000-0000-0000-0000-000000000001',
        'Adversario Concorrencia'
      )$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$insert into public.fields (id, name, address)
      values (
        '70000000-0000-0000-0000-000000000002',
        'Campo Concorrencia',
        'Rua dos Locks, 1'
      )$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$insert into public.matches (
        id,
        opponent_id,
        field_id,
        scheduled_at,
        status,
        started_at,
        ended_at,
        score_unidos,
        score_opponent
      ) values (
        '70000000-0000-0000-0000-000000000003',
        '70000000-0000-0000-0000-000000000001',
        '70000000-0000-0000-0000-000000000002',
        '2020-03-01 09:00:00+00',
        'finished',
        '2020-03-01 10:00:00+00',
        '2020-03-01 11:00:00+00',
        2,
        0
      )$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$insert into public.match_events (
        id,
        match_id,
        beneficiary,
        minute_snapshot,
        client_event_id
      ) values (
        '70000000-0000-0000-0000-000000000004',
        '70000000-0000-0000-0000-000000000003',
        'unidos',
        10,
        '70000000-0000-0000-0000-000000000006'
      )$remote$
  );

  perform extensions.dblink_exec('match_writer', 'begin');
  perform extensions.dblink_exec(
    'match_writer',
    $remote$update public.matches
      set score_unidos = 2
      where id = '70000000-0000-0000-0000-000000000003'$remote$
  );
  perform extensions.dblink_send_query(
    'event_writer',
    $remote$insert into public.match_events (
        id,
        match_id,
        beneficiary,
        minute_snapshot,
        client_event_id
      ) values (
        '70000000-0000-0000-0000-000000000005',
        '70000000-0000-0000-0000-000000000003',
        'unidos',
        55,
        '70000000-0000-0000-0000-000000000007'
      )
      returning id::text$remote$
  );
  perform pg_sleep(0.2);
end;
$block$;

select is(
  extensions.dblink_is_busy('event_writer'),
  1,
  'event insert waits while a finished score update holds the match lock'
);

do $block$
begin
  perform extensions.dblink_exec('match_writer', 'commit');
end;
$block$;

select results_eq(
  $sql$
    select id
    from extensions.dblink_get_result('event_writer') as result(id text)
  $sql$,
  $expected$values ('70000000-0000-0000-0000-000000000005'::text)$expected$,
  'event insert completes after the score update commits'
);

do $drain$
begin
  perform result.id
  from extensions.dblink_get_result('event_writer') as result(id text);
end;
$drain$;

select is(
  (
    select occurred_at
    from public.match_events
    where id = '70000000-0000-0000-0000-000000000005'
  ),
  '2020-03-01 10:55:00+00'::timestamptz,
  'serialized event insert uses the unchanged match start'
);

do $block$
begin
  perform extensions.dblink_exec('event_writer', 'begin');
  perform extensions.dblink_exec(
    'event_writer',
    $remote$do $lock$
      begin
        perform id
        from public.match_events
        where id = '70000000-0000-0000-0000-000000000004'
        for update;
      end;
    $lock$$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$create or replace function pg_temp.try_timestamp_update()
      returns text
      language plpgsql
      as $attempt$
      begin
        update public.matches
        set
          started_at = '2020-03-01 12:00:00+00',
          ended_at = '2020-03-01 13:00:00+00'
        where id = '70000000-0000-0000-0000-000000000003';

        return 'updated';
      exception
        when others then
          return sqlstate || ':' || sqlerrm;
      end;
      $attempt$$remote$
  );
  perform extensions.dblink_send_query(
    'match_writer',
    'select pg_temp.try_timestamp_update()'
  );
  perform pg_sleep(0.2);
end;
$block$;

select is(
  extensions.dblink_is_busy('match_writer'),
  0,
  'timestamp correction rejects without waiting on the locked event row'
);

do $block$
begin
  perform extensions.dblink_exec('event_writer', 'rollback');
end;
$block$;

select results_eq(
  $sql$
    select result
    from extensions.dblink_get_result('match_writer') as response(result text)
  $sql$,
  $expected$values (
    'P0001:finished match timestamps cannot change after events are recorded'::text
  )$expected$,
  'timestamp correction reports the immutable-event contract'
);

do $drain$
begin
  perform response.result
  from extensions.dblink_get_result('match_writer') as response(result text);
end;
$drain$;

do $block$
begin
  perform extensions.dblink_exec('match_writer', 'begin');
  perform extensions.dblink_exec(
    'match_writer',
    $remote$update public.matches
      set score_unidos = 2
      where id = '70000000-0000-0000-0000-000000000003'$remote$
  );
  perform extensions.dblink_send_query(
    'event_writer',
    $remote$update public.match_events
      set minute_snapshot = 30
      where id = '70000000-0000-0000-0000-000000000005'
      returning id::text$remote$
  );
  perform pg_sleep(0.2);
end;
$block$;

select is(
  extensions.dblink_is_busy('event_writer'),
  1,
  'event update waits while a finished score update holds the match lock'
);

do $block$
begin
  perform extensions.dblink_exec('match_writer', 'commit');
end;
$block$;

select results_eq(
  $sql$
    select id
    from extensions.dblink_get_result('event_writer') as result(id text)
  $sql$,
  $expected$values ('70000000-0000-0000-0000-000000000005'::text)$expected$,
  'event update completes after the score update commits'
);

do $drain$
begin
  perform result.id
  from extensions.dblink_get_result('event_writer') as result(id text);
end;
$drain$;

select results_eq(
  $sql$
    select id, occurred_at
    from public.match_events
    where id in (
      '70000000-0000-0000-0000-000000000004',
      '70000000-0000-0000-0000-000000000005'
    )
    order by id
  $sql$,
  $expected$values
    (
      '70000000-0000-0000-0000-000000000004'::uuid,
      '2020-03-01 10:10:00+00'::timestamptz
    ),
    (
      '70000000-0000-0000-0000-000000000005'::uuid,
      '2020-03-01 10:30:00+00'::timestamptz
    )$expected$,
  'serialized score and event updates keep event timestamps coherent'
);

do $block$
begin
  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.match_events
      where match_id = '70000000-0000-0000-0000-000000000003'$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.matches
      where id = '70000000-0000-0000-0000-000000000003'$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.opponents
      where id = '70000000-0000-0000-0000-000000000001'$remote$
  );
  perform extensions.dblink_exec(
    'match_writer',
    $remote$delete from public.fields
      where id = '70000000-0000-0000-0000-000000000002'$remote$
  );
  perform extensions.dblink_disconnect('event_writer');
  perform extensions.dblink_disconnect('match_writer');
end;
$block$;

set local role anon;

select throws_ok(
  $sql$
    insert into public.matches (opponent_id, field_id, scheduled_at, status)
    values (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      clock_timestamp(),
      'scheduled'
    )
  $sql$,
  '42501',
  null::text,
  'anon cannot insert matches'
);
select throws_ok(
  $sql$
    insert into public.match_events (
      match_id,
      beneficiary,
      minute_snapshot,
      client_event_id
    ) values (
      '40000000-0000-0000-0000-000000000001',
      'opponent',
      1,
      '60000000-0000-0000-0000-000000000030'
    )
  $sql$,
  '42501',
  null::text,
  'anon cannot insert match events'
);

reset role;

select * from finish();
rollback;

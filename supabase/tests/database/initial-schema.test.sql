begin;

create extension if not exists pgtap with schema extensions;

select plan(37);

select has_table('public', 'app_admins', 'app_admins exists');
select has_table('public', 'players', 'players exists');
select has_table('public', 'opponents', 'opponents exists');
select has_table('public', 'fields', 'fields exists');
select has_table('public', 'matches', 'matches exists');
select has_table('public', 'match_events', 'match_events exists');
select has_table('public', 'stat_adjustments', 'stat_adjustments exists');
select has_table('public', 'club_settings', 'club_settings exists');

select has_function('public', 'set_updated_at', array[]::text[], 'updated_at trigger function exists');
select has_function('public', 'enforce_match_lifecycle', array[]::text[], 'match lifecycle trigger function exists');
select has_function('public', 'is_app_admin', array[]::text[], 'admin helper exists');
select has_function('public', 'start_match', array['uuid'], 'start RPC exists');
select has_function('public', 'finish_match', array['uuid'], 'finish RPC exists');
select has_function('public', 'set_event_minute', array[]::text[], 'event minute trigger function exists');

select col_is_unique(
  'public',
  'match_events',
  'client_event_id',
  'event client idempotency is enforced'
);

select policies_are(
  'public',
  'players',
  array['admin writes players', 'public reads players'],
  'player policies exist'
);
select policies_are(
  'public',
  'matches',
  array['admin writes matches', 'public reads matches'],
  'match policies exist'
);
select policies_are(
  'public',
  'match_events',
  array['admin writes events', 'public reads events'],
  'event policies exist'
);
select policies_are(
  'public',
  'club_settings',
  array['admin writes settings', 'public reads settings'],
  'settings policies exist'
);
select policies_are(
  'public',
  'app_admins',
  array['users read own allowlist entry'],
  'allowlist only exposes the current user entry'
);

select ok(
  has_table_privilege('service_role', 'public.app_admins', 'select')
  and has_table_privilege('service_role', 'public.app_admins', 'insert')
  and has_table_privilege('service_role', 'public.app_admins', 'update'),
  'service role can manage the admin allowlist'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.app_admins'::regclass),
  true,
  'app_admins has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.players'::regclass),
  true,
  'players has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.opponents'::regclass),
  true,
  'opponents has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.fields'::regclass),
  true,
  'fields has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.matches'::regclass),
  true,
  'matches has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.match_events'::regclass),
  true,
  'match_events has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.stat_adjustments'::regclass),
  true,
  'stat_adjustments has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.club_settings'::regclass),
  true,
  'club_settings has RLS enabled'
);

select is(
  (
    select count(*)
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'matches'
  ),
  1::bigint,
  'matches is published to Realtime'
);
select is(
  (
    select count(*)
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_events'
  ),
  1::bigint,
  'match_events is published to Realtime'
);

select is(
  (
    select count(*)
    from storage.buckets
    where id = 'players'
      and public
      and file_size_limit = 5242880
      and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  1::bigint,
  'players media bucket is public and constrained'
);
select is(
  (
    select count(*)
    from storage.buckets
    where id = 'opponents'
      and public
      and file_size_limit = 5242880
      and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  1::bigint,
  'opponents media bucket is public and constrained'
);

insert into public.players (id, name, shirt_number, position)
values ('00000000-0000-0000-0000-000000000001', 'Atleta Publico', 7, 'ala');

insert into public.opponents (id, name)
values ('00000000-0000-0000-0000-000000000010', 'Adversario Teste');

insert into public.fields (id, name, address)
values (
  '00000000-0000-0000-0000-000000000020',
  'Campo Teste',
  'Rua de Teste, 10'
);

insert into public.matches (id, opponent_id, field_id, scheduled_at, status)
values (
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000020',
  now(),
  'live'
);

select throws_ok(
  $sql$
    insert into public.matches (opponent_id, field_id, scheduled_at, status)
    values (
      '00000000-0000-0000-0000-000000000010',
      '00000000-0000-0000-0000-000000000020',
      now(),
      'live'
    )
  $sql$,
  '23505',
  null::text,
  'only one match can be live'
);

update public.matches
set status = 'finished'
where id = '00000000-0000-0000-0000-000000000030';

select throws_ok(
  $sql$
    update public.matches
    set status = 'live'
    where id = '00000000-0000-0000-0000-000000000030'
  $sql$,
  'P0001',
  'finished match cannot be reopened',
  'finished match stays finished'
);

set local role anon;

select throws_ok(
  $sql$
    insert into public.players (name, shirt_number, position)
    values ('Nao autorizado', 99, 'ala')
  $sql$,
  '42501',
  null::text,
  'anon cannot insert players'
);

select results_eq(
  $sql$
    select name
    from public.players
    where id = '00000000-0000-0000-0000-000000000001'
  $sql$,
  $$values ('Atleta Publico'::text)$$,
  'anon can select active players'
);

reset role;

select * from finish();
rollback;

# Unidos do RR MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o MVP publicavel do Unidos do RR com homepage responsiva, painel administrativo, cronometro continuo e placar em tempo real.

**Architecture:** Um projeto Next.js App Router roda na Vercel e usa Supabase para PostgreSQL, Auth, Storage e Realtime. Regras de integridade ficam no banco; funcoes de dominio puras calculam placar, retrospecto e estados da interface; Server Components carregam dados e pequenos Client Components assinam mudancas em tempo real.

**Tech Stack:** Node.js 20.9+, Next.js 16+, React, TypeScript, Tailwind CSS, Supabase JS/SSR/CLI, Zod, React Hook Form, Radix UI, Lucide, Vitest, Testing Library e Playwright.

---

## Scope and execution order

O plano usa incrementos verticais porque site publico, admin e Realtime compartilham os mesmos contratos de partida e evento. Execute as tarefas em ordem. Cada commit deve deixar lint, tipos e os testes da area alterada passando.

Documentos de referencia:

- `docs/superpowers/specs/2026-07-16-unidos-do-rr-mvp-design.md`
- `docs/CONTINUIDADE.md`

Referencias oficiais verificadas em 2026-07-16:

- Next.js usa `proxy.ts` a partir da versao 16: `https://nextjs.org/docs/app/getting-started/proxy`
- Supabase SSR para Next.js: `https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs`
- Supabase Postgres Changes: `https://supabase.com/docs/guides/realtime/postgres-changes`
- Supabase RLS: `https://supabase.com/docs/guides/database/postgres/row-level-security`
- Playwright projects: `https://playwright.dev/docs/test-projects`

## File map

### Project foundation

- `package.json`: scripts and dependencies.
- `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`: build configuration.
- `vitest.config.ts`, `vitest.setup.ts`: unit/component tests.
- `playwright.config.ts`: desktop and mobile E2E projects.
- `.env.example`: public and server-only environment contract.
- `public/brand/unidos-logo.png`, `public/brand/unidos-kits.png`: approved visual assets.

### Database and Supabase

- `supabase/config.toml`: local project configuration.
- `supabase/migrations/202607160001_initial_schema.sql`: tables, constraints, triggers, RLS and Realtime publication.
- `supabase/tests/database/initial-schema.test.sql`: pgTAP checks for constraints and access.
- `scripts/create-admin.mjs`: create the single Auth user and allowlist it.
- `src/lib/supabase/client.ts`: browser client.
- `src/lib/supabase/server.ts`: cookie-aware server client.
- `src/lib/supabase/proxy.ts`: cookie refresh for Next Proxy.
- `src/lib/supabase/database.types.ts`: generated database types.
- `src/proxy.ts`: session refresh entry point.
- `src/features/media/image-upload.tsx`: validated player/opponent image upload.
- `src/features/media/image-upload.test.tsx`: file type, size and upload-state tests.

### Domain

- `src/features/matches/types.ts`: match, event and aggregate contracts.
- `src/features/matches/domain.ts`: clock, score, record, player stats and hero state.
- `src/features/matches/domain.test.ts`: pure domain tests.
- `src/features/matches/queries.ts`: public/admin match reads.
- `src/features/matches/actions.ts`: create, start, finish and event mutations.

### Public site

- `src/app/layout.tsx`, `src/app/globals.css`: fonts, tokens and global shell.
- `src/app/(site)/page.tsx`: server-loaded homepage.
- `src/features/public-site/home-page.tsx`: approved section composition.
- `src/features/public-site/queries.ts`: home data aggregate.
- `src/features/public-site/live-home.tsx`: Realtime subscription and refetch.
- `src/features/public-site/components/*.tsx`: header, hero, record, about/location, history, roster, rivalry, kits, Instagram CTA and footer.
- `src/features/public-site/*.test.tsx`: state and accessibility contracts.

### Admin

- `src/app/admin/login/page.tsx`: login.
- `src/app/admin/(protected)/layout.tsx`: authenticated boundary and shell.
- `src/app/admin/(protected)/page.tsx`: dashboard.
- `src/app/admin/(protected)/jogos/**`: match list, form and live console pages.
- `src/app/admin/(protected)/elenco/page.tsx`: players.
- `src/app/admin/(protected)/cadastros/page.tsx`: opponents, fields and rival.
- `src/app/admin/(protected)/configuracoes/page.tsx`: content and adjustments.
- `src/features/admin/admin-shell.tsx`: desktop sidebar/mobile bottom navigation.
- `src/features/admin/login-form.tsx`: email/password form.
- `src/features/players/*`, `src/features/opponents/*`, `src/features/fields/*`: CRUD forms/actions.
- `src/features/live-match/*`: quick console, goal sheet, timeline and correction dialogs.
- `src/features/settings/*`: club settings and stat adjustments.

### Verification and operations

- `e2e/public-home.spec.ts`: public responsive states.
- `e2e/admin-match.spec.ts`: full admin/live flow.
- `docs/DEPLOY.md`: Supabase and Vercel setup.
- `README.md`: local setup and commands.

---

### Task 1: Bootstrap the Next.js project and test harness

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/(site)/page.tsx`
- Create: `src/app/smoke.test.tsx`
- Copy: `unidos-logo.png` to `public/brand/unidos-logo.png`
- Copy: `unidos-kit.png` to `public/brand/unidos-kits.png`

- [ ] **Step 1: Initialize packages**

Run:

```bash
pnpm init
pnpm add next@latest react@latest react-dom@latest @supabase/ssr @supabase/supabase-js zod react-hook-form @hookform/resolvers lucide-react @radix-ui/react-alert-dialog @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
pnpm add -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss eslint eslint-config-next vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test supabase
```

Expected: `package.json` and `pnpm-lock.yaml` exist; install exits 0.

- [ ] **Step 2: Define scripts and configuration**

Set these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:start": "supabase start",
    "db:reset": "supabase db reset",
    "db:test": "supabase test db",
    "db:types": "supabase gen types typescript --local > src/lib/supabase/database.types.ts"
  }
}
```

Create `vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure' },
  webServer: { command: 'pnpm dev', url: 'http://127.0.0.1:3000', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
})
```

Create `.env.example`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
```

- [ ] **Step 3: Write the failing app smoke test**

Create `src/app/smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import Home from './(site)/page'

vi.mock('@/features/public-site/queries', () => ({
  getHomeData: vi.fn().mockResolvedValue(null),
}))

it('renders the club identity', async () => {
  render(await Home())
  expect(screen.getByRole('heading', { name: /unidos do rr/i })).toBeInTheDocument()
})
```

- [ ] **Step 4: Run the smoke test and verify failure**

Run: `pnpm vitest run src/app/smoke.test.tsx`

Expected: FAIL because the route and public query do not exist.

- [ ] **Step 5: Create the minimal app shell**

Create `src/app/layout.tsx` with `Inter` and `Barlow_Condensed` from `next/font/google`, Portuguese metadata and `<html lang="pt-BR">`. Create `src/app/(site)/page.tsx` with an async `Home` component that renders `<h1>Unidos do RR</h1>` until the public feature lands. Create `src/features/public-site/queries.ts` exporting `getHomeData(): Promise<null>`.

Use this root layout contract:

```tsx
import { Barlow_Condensed, Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Unidos do RR | Fut7',
  description: 'Unidos pelo bairro. Fut7 do Rio Vermelho, Florianopolis.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${inter.variable} ${barlow.variable}`}>{children}</body></html>
}
```

Create the approved color tokens in `src/app/globals.css` and import Tailwind:

```css
@import "tailwindcss";

:root {
  --rr-ink: #030b14;
  --rr-navy: #071626;
  --rr-raised: #0d2033;
  --rr-red: #c81018;
  --rr-red-dark: #a70d14;
  --rr-white: #f7f7f4;
  --rr-muted: #aeb7c2;
  --rr-disabled: #68717c;
  --rr-border: rgb(247 247 244 / 10%);
  --font-sans: var(--font-body);
  --font-display-face: var(--font-display);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--rr-ink); }
body { margin: 0; background: var(--rr-ink); color: var(--rr-white); font-family: var(--font-body), sans-serif; }
button, input, select, textarea { font: inherit; }
```

- [ ] **Step 6: Copy assets and verify foundation**

Run:

```bash
mkdir -p public/brand
cp unidos-logo.png public/brand/unidos-logo.png
cp unidos-kit.png public/brand/unidos-kits.png
pnpm vitest run src/app/smoke.test.tsx
pnpm lint
pnpm typecheck
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs vitest.config.ts vitest.setup.ts playwright.config.ts .env.example .gitignore public src/app src/features/public-site/queries.ts
git commit -m "chore: bootstrap unidos do rr app"
```

---

### Task 2: Create the Supabase schema, integrity rules and RLS

**Files:**

- Create: `supabase/config.toml`
- Create: `supabase/migrations/202607160001_initial_schema.sql`
- Create: `supabase/tests/database/initial-schema.test.sql`
- Create: `scripts/create-admin.mjs`
- Create: `src/lib/supabase/database.types.ts` through generation

- [ ] **Step 1: Initialize Supabase locally**

Run:

```bash
pnpm exec supabase init
pnpm db:start
```

Expected: local API, database and Studio start successfully.

- [ ] **Step 2: Write failing database tests**

Create `supabase/tests/database/initial-schema.test.sql`:

```sql
begin;
select plan(16);

select has_table('public', 'players', 'players exists');
select has_table('public', 'matches', 'matches exists');
select has_table('public', 'match_events', 'match_events exists');
select has_table('public', 'stat_adjustments', 'stat_adjustments exists');
select has_function('public', 'is_app_admin', array[]::text[], 'admin helper exists');
select has_function('public', 'start_match', array['uuid'], 'start RPC exists');
select has_function('public', 'finish_match', array['uuid'], 'finish RPC exists');
select col_is_unique('public', 'match_events', 'client_event_id', 'event idempotency is enforced');
select policies_are('public', 'players', array['public reads players', 'admin writes players'], 'player policies exist');
select policies_are('public', 'matches', array['public reads matches', 'admin writes matches'], 'match policies exist');
select policies_are('public', 'match_events', array['public reads events', 'admin writes events'], 'event policies exist');
select policies_are('public', 'club_settings', array['public reads settings', 'admin writes settings'], 'settings policies exist');

select * from finish();
rollback;
```

- [ ] **Step 3: Run database tests and verify failure**

Run: `pnpm db:test`

Expected: FAIL because the schema does not exist.

- [ ] **Step 4: Implement the initial migration**

Create `supabase/migrations/202607160001_initial_schema.sql`. It must contain these exact objects and invariants:

```sql
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
  position text not null check (position in ('goleiro','fixo','ala','meia','pivo')),
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index players_active_shirt_number_idx on public.players(shirt_number) where is_active;

create table public.opponents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  crest_url text,
  is_rival boolean not null default false,
  is_primary_rival boolean not null default false,
  rivalry_title text,
  rivalry_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index opponents_primary_rival_idx on public.opponents(is_primary_rival) where is_primary_rival;

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
create unique index fields_primary_idx on public.fields(is_primary) where is_primary;

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  opponent_id uuid not null references public.opponents(id),
  field_id uuid not null references public.fields(id),
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  is_home boolean not null default true,
  started_at timestamptz,
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'scheduled' and started_at is null and ended_at is null)
    or (status = 'live' and started_at is not null and ended_at is null)
    or (status = 'finished' and started_at is not null and ended_at is not null))
);
create unique index matches_one_live_idx on public.matches(status) where status = 'live';

create or replace function public.enforce_match_lifecycle()
returns trigger language plpgsql set search_path = '' as $
begin
  if tg_op = 'UPDATE' then
    if old.status = 'finished' and new.status <> 'finished' then
      raise exception 'finished match cannot be reopened';
    end if;
    if old.status = 'live' and new.status = 'scheduled' then
      raise exception 'live match cannot return to scheduled';
    end if;
    if old.status = new.status then
      new.started_at = old.started_at;
      new.ended_at = old.ended_at;
    end if;
  end if;

  if new.status = 'scheduled' then
    new.started_at = null;
    new.ended_at = null;
  elsif new.status = 'live' and (tg_op = 'INSERT' or old.status <> 'live') then
    new.started_at = clock_timestamp();
    new.ended_at = null;
  elsif new.status = 'finished' and (tg_op = 'INSERT' or old.status <> 'finished') then
    if coalesce(new.started_at, old.started_at) is null then raise exception 'match has not started'; end if;
    new.started_at = coalesce(new.started_at, old.started_at);
    new.ended_at = clock_timestamp();
  end if;
  return new;
end;
$;
create trigger matches_enforce_lifecycle before insert or update on public.matches for each row execute function public.enforce_match_lifecycle();

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type text not null default 'goal' check (event_type = 'goal'),
  beneficiary text not null check (beneficiary in ('unidos','opponent')),
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
  check (is_own_goal or beneficiary = 'opponent' or scorer_player_id is not null),
  check (not is_own_goal or (scorer_player_id is null and assist_player_id is null))
);

create table public.stat_adjustments (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('player','club')),
  player_id uuid references public.players(id),
  metric text not null check (metric in ('goals','assists','wins','draws','losses')),
  delta integer not null check (delta <> 0),
  reason text not null check (length(trim(reason)) >= 4),
  created_at timestamptz not null default now(),
  check ((scope = 'player' and player_id is not null and metric in ('goals','assists'))
    or (scope = 'club' and player_id is null and metric in ('wins','draws','losses')))
);

create table public.club_settings (
  id boolean primary key default true check (id),
  club_name text not null default 'Unidos do RR',
  bio text not null default 'Unidos pelo bairro.',
  about_text text not null default 'Fut7 do Rio Vermelho, Florianopolis.',
  instagram_url text not null default 'https://www.instagram.com/unidosdorr/',
  locality text not null default 'Rio Vermelho, Florianopolis - SC',
  primary_field_id uuid references public.fields(id),
  updated_at timestamptz not null default now()
);
insert into public.club_settings default values;

create or replace function public.is_app_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.app_admins where user_id = (select auth.uid()));
$$;

create or replace function public.start_match(p_match_id uuid)
returns public.matches language plpgsql security definer set search_path = '' as $$
declare result public.matches;
begin
  if not public.is_app_admin() then raise exception 'not authorized'; end if;
  update public.matches
    set status = 'live', started_at = clock_timestamp(), ended_at = null, updated_at = now()
    where id = p_match_id and status = 'scheduled'
    returning * into result;
  if result.id is null then raise exception 'match cannot be started'; end if;
  return result;
end;
$$;

create or replace function public.finish_match(p_match_id uuid)
returns public.matches language plpgsql security definer set search_path = '' as $$
declare result public.matches;
begin
  if not public.is_app_admin() then raise exception 'not authorized'; end if;
  update public.matches
    set status = 'finished', ended_at = clock_timestamp(), updated_at = now()
    where id = p_match_id and status = 'live'
    returning * into result;
  if result.id is null then raise exception 'match cannot be finished'; end if;
  return result;
end;
$$;

create or replace function public.set_event_minute()
returns trigger language plpgsql set search_path = '' as $$
declare target public.matches;
begin
  select * into target from public.matches where id = new.match_id;
  if target.started_at is null then raise exception 'match has not started'; end if;
  new.occurred_at = clock_timestamp();
  new.minute_snapshot = greatest(0, floor(extract(epoch from (coalesce(target.ended_at, clock_timestamp()) - target.started_at)) / 60));
  return new;
end;
$$;
create trigger match_events_set_minute before insert on public.match_events for each row execute function public.set_event_minute();

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$;

create trigger players_set_updated_at before update on public.players for each row execute function public.set_updated_at();
create trigger opponents_set_updated_at before update on public.opponents for each row execute function public.set_updated_at();
create trigger fields_set_updated_at before update on public.fields for each row execute function public.set_updated_at();
create trigger matches_set_updated_at before update on public.matches for each row execute function public.set_updated_at();
create trigger match_events_set_updated_at before update on public.match_events for each row execute function public.set_updated_at();
create trigger club_settings_set_updated_at before update on public.club_settings for each row execute function public.set_updated_at();

alter table public.app_admins enable row level security;
alter table public.players enable row level security;
alter table public.opponents enable row level security;
alter table public.fields enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.stat_adjustments enable row level security;
alter table public.club_settings enable row level security;

create policy "public reads players" on public.players for select to anon, authenticated using (is_active or public.is_app_admin());
create policy "public reads opponents" on public.opponents for select to anon, authenticated using (is_active or public.is_app_admin());
create policy "public reads fields" on public.fields for select to anon, authenticated using (is_active or public.is_app_admin());
create policy "public reads matches" on public.matches for select to anon, authenticated using (true);
create policy "public reads events" on public.match_events for select to anon, authenticated using (deleted_at is null or public.is_app_admin());
create policy "public reads adjustments" on public.stat_adjustments for select to anon, authenticated using (true);
create policy "public reads settings" on public.club_settings for select to anon, authenticated using (true);
create policy "admin reads allowlist" on public.app_admins for select to authenticated using (user_id = (select auth.uid()));

create policy "admin writes players" on public.players for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "admin writes opponents" on public.opponents for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "admin writes fields" on public.fields for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "admin writes matches" on public.matches for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "admin writes events" on public.match_events for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "admin writes adjustments" on public.stat_adjustments for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
create policy "admin writes settings" on public.club_settings for all to authenticated using (public.is_app_admin()) with check (public.is_app_admin());

grant select on public.players, public.opponents, public.fields, public.matches, public.match_events, public.stat_adjustments, public.club_settings to anon;
grant select, insert, update, delete on public.players, public.opponents, public.fields, public.matches, public.match_events, public.stat_adjustments, public.club_settings to authenticated;
grant select on public.app_admins to authenticated;
revoke all on function public.start_match(uuid), public.finish_match(uuid) from public, anon;
grant execute on function public.start_match(uuid), public.finish_match(uuid) to authenticated;

alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.match_events;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('players', 'players', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('opponents', 'opponents', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads club media" on storage.objects for select to anon, authenticated
using (bucket_id in ('players','opponents'));
create policy "admin inserts club media" on storage.objects for insert to authenticated
with check (bucket_id in ('players','opponents') and public.is_app_admin());
create policy "admin updates club media" on storage.objects for update to authenticated
using (bucket_id in ('players','opponents') and public.is_app_admin())
with check (bucket_id in ('players','opponents') and public.is_app_admin());
create policy "admin deletes club media" on storage.objects for delete to authenticated
using (bucket_id in ('players','opponents') and public.is_app_admin());
```

Add these four pgTAP cases below the structural assertions:

```sql
insert into public.opponents (id, name) values ('00000000-0000-0000-0000-000000000010', 'Adversario Teste');
insert into public.fields (id, name, address) values ('00000000-0000-0000-0000-000000000020', 'Campo Teste', 'Rua de Teste, 10');
insert into public.matches (id, opponent_id, field_id, scheduled_at, status)
values ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', now(), 'live');

select throws_ok(
  $insert into public.matches (opponent_id, field_id, scheduled_at, status)
    values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', now(), 'live')$,
  '23505', null, 'only one match can be live'
);

update public.matches set status = 'finished' where id = '00000000-0000-0000-0000-000000000030';
select throws_ok(
  $update public.matches set status = 'live' where id = '00000000-0000-0000-0000-000000000030'$,
  'P0001', 'finished match cannot be reopened', 'finished match stays finished'
);

set local role anon;
select throws_ok(
  $insert into public.players (name, shirt_number, position) values ('Nao autorizado', 99, 'ala')$,
  '42501', null, 'anon cannot insert players'
);
select lives_ok($select id from public.players$, 'anon can read public players');
reset role;
```

- [ ] **Step 5: Reset, test and generate types**

Run:

```bash
pnpm db:reset
pnpm db:test
mkdir -p src/lib/supabase
pnpm db:types
```

Expected: 8 pgTAP assertions PASS and generated types include all seven public data tables plus `app_admins`.

- [ ] **Step 6: Add the admin bootstrap script**

Create `scripts/create-admin.mjs` that validates `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`, calls `supabase.auth.admin.createUser({ email, password, email_confirm: true })`, tolerates an existing user by listing users and matching the email, then upserts `{ user_id }` into `app_admins`. Never log the password or service key.

The command must finish with only:

```text
Admin account ready: <email>
```

Add script: `"admin:create": "node scripts/create-admin.mjs"`.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml supabase scripts/create-admin.mjs src/lib/supabase/database.types.ts
git commit -m "feat: add supabase schema and security"
```

---

### Task 3: Implement and test match domain rules

**Files:**

- Create: `src/features/matches/types.ts`
- Create: `src/features/matches/domain.ts`
- Create: `src/features/matches/domain.test.ts`

- [ ] **Step 1: Define domain contracts**

Create `types.ts` with `MatchStatus`, `Beneficiary`, `MatchSummary`, `GoalEvent`, `Score`, `ClubRecord`, `PlayerStat` and `HeroState`. Use ISO strings at the database boundary and `Date` only as function inputs.

```ts
export type MatchStatus = 'scheduled' | 'live' | 'finished'
export type Beneficiary = 'unidos' | 'opponent'

export interface MatchSummary {
  id: string
  status: MatchStatus
  scheduledAt: string
  startedAt: string | null
  endedAt: string | null
}

export interface GoalEvent {
  id: string
  beneficiary: Beneficiary
  isOwnGoal: boolean
  scorerPlayerId: string | null
  assistPlayerId: string | null
  minute: number
  deletedAt: string | null
}

export interface Score { unidos: number; opponent: number }
export interface ClubRecord { wins: number; draws: number; losses: number }
export interface PlayerStat { playerId: string; goals: number; assists: number }
export type StatMetric = 'goals' | 'assists' | 'wins' | 'draws' | 'losses'
export interface StatAdjustment {
  scope: 'player' | 'club'
  playerId: string | null
  metric: StatMetric
  delta: number
}
export interface FinishedMatchResult {
  id: string
  status: 'finished'
  score: Score
}
export type HeroState = 'live' | 'scheduled' | 'finished' | 'institutional'
```

- [ ] **Step 2: Write failing domain tests**

Cover these assertions in `domain.test.ts`:

```ts
expect(formatMatchClock('2026-07-16T20:00:00Z', null, new Date('2026-07-16T21:01:02Z'))).toBe('61:02')
expect(calculateScore(events)).toEqual({ unidos: 2, opponent: 1 })
expect(calculatePlayerStats(events, [])).toContainEqual({ playerId: 'p10', goals: 1, assists: 0 })
expect(calculatePlayerStats(events, [])).not.toContainEqual(expect.objectContaining({ playerId: 'own-goal-player' }))
expect(calculateClubRecord(finishedMatches, [])).toEqual({ wins: 2, draws: 0, losses: 2 })
expect(selectHeroState({ live, scheduled, finished })).toBe('live')
```

Include deleted events, own goals, player and club adjustments, frozen finished clock and no-data hero cases.

- [ ] **Step 3: Run tests and verify failure**

Run: `pnpm vitest run src/features/matches/domain.test.ts`

Expected: FAIL with missing domain exports.

- [ ] **Step 4: Implement pure domain functions**

Implement these signatures without Supabase imports:

```ts
export function formatMatchClock(startedAt: string, endedAt: string | null, now = new Date()): string
export function calculateScore(events: GoalEvent[]): Score
export function calculatePlayerStats(events: GoalEvent[], adjustments: StatAdjustment[]): PlayerStat[]
export function calculateClubRecord(matches: FinishedMatchResult[], adjustments: StatAdjustment[]): ClubRecord
export function selectHeroState(input: { live: MatchSummary | null; scheduled: MatchSummary | null; finished: MatchSummary | null }): HeroState
```

Clock behavior is `Math.max(0, floor(milliseconds / 1000))`, formatted as unbounded minutes plus two-digit seconds. Filter `deletedAt` before every aggregate. Own goals affect score by beneficiary but never player stats.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/features/matches/domain.test.ts
pnpm typecheck
```

Expected: PASS.

```bash
git add src/features/matches
git commit -m "feat: add match domain rules"
```

---

### Task 4: Add Supabase SSR clients and protect admin routes

**Files:**

- Create: `src/lib/env.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `src/proxy.ts`
- Create: `src/lib/auth/require-admin.ts`
- Create: `src/lib/auth/require-admin.test.ts`

- [ ] **Step 1: Write failing authorization tests**

Mock the server client and assert `requireAdmin()` redirects to `/admin/login` when `auth.getClaims()` has no subject or when `app_admins` has no matching row. Assert it returns the user id when both checks pass.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm vitest run src/lib/auth/require-admin.test.ts`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement environment and Supabase clients**

`src/lib/env.ts` must throw a descriptive error when either public Supabase value is absent. `client.ts` uses `createBrowserClient<Database>()`. `server.ts` uses `createServerClient<Database>()`, `await cookies()`, `getAll` and a guarded `setAll` because Server Components cannot always write cookies.

`src/lib/supabase/proxy.ts` must follow the current Supabase SSR cookie recipe and call `auth.getClaims()`, not trust `getSession()` for authorization.

Create `src/proxy.ts`:

```ts
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 4: Implement the server authorization boundary**

`requireAdmin()` calls `getClaims()`, extracts `claims.sub`, queries `app_admins.user_id`, redirects on any denial and returns `{ userId }` on success. Do not rely only on the Proxy; protected layouts must call this helper.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/lib/auth/require-admin.test.ts
pnpm lint
pnpm typecheck
```

Expected: PASS.

```bash
git add src/lib src/proxy.ts
git commit -m "feat: add supabase auth boundary"
```

---

### Task 5: Build the typed public data aggregate

**Files:**

- Create: `src/features/public-site/types.ts`
- Modify: `src/features/public-site/queries.ts`
- Create: `src/features/public-site/queries.test.ts`
- Create: `src/features/matches/mappers.ts`

- [ ] **Step 1: Write failing aggregate tests**

Mock Supabase query results and assert `getHomeData()` returns:

```ts
{
  hero: { state: 'live', match: expect.any(Object), score: { unidos: 2, opponent: 1 } },
  record: { wins: 2, draws: 0, losses: 2 },
  players: expect.arrayContaining([{ name: 'Jogador 10', goals: 4, assists: 2 }]),
  recentMatches: expect.any(Array),
  rivalry: expect.objectContaining({ opponentName: 'Muito Paia FC' }),
  settings: expect.objectContaining({ instagramUrl: 'https://www.instagram.com/unidosdorr/' }),
}
```

Also test scheduled, finished and institutional hero priority.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm vitest run src/features/public-site/queries.test.ts`

Expected: FAIL because the aggregate is still a null stub.

- [ ] **Step 3: Implement mappers and query**

Define a `HomeData` type with hero, record, players, recent matches, rivalry, fields and settings. Query independent tables in `Promise.all`, map snake_case database fields once in `mappers.ts`, then call pure domain functions. Fetch only active player/opponent/field rows and non-deleted public events.

Return a valid institutional object when tables contain no matches. Throw a typed `HomeDataError` on database failures so the page can render an explicit retry state instead of fake data.

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm vitest run src/features/public-site/queries.test.ts src/features/matches/domain.test.ts
pnpm typecheck
```

Expected: PASS.

```bash
git add src/features/public-site src/features/matches/mappers.ts
git commit -m "feat: add public club data aggregate"
```

---

### Task 6: Implement the responsive public homepage

**Files:**

- Modify: `src/app/(site)/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/features/public-site/home-page.tsx`
- Create: `src/features/public-site/home-page.test.tsx`
- Create: `src/features/public-site/components/site-header.tsx`
- Create: `src/features/public-site/components/match-hero.tsx`
- Create: `src/features/public-site/components/season-record.tsx`
- Create: `src/features/public-site/components/about-location.tsx`
- Create: `src/features/public-site/components/match-history.tsx`
- Create: `src/features/public-site/components/roster.tsx`
- Create: `src/features/public-site/components/rivalry.tsx`
- Create: `src/features/public-site/components/kits.tsx`
- Create: `src/features/public-site/components/friendly-cta.tsx`
- Create: `src/features/public-site/components/site-footer.tsx`

- [ ] **Step 1: Write failing homepage behavior tests**

Render `HomePage` with fixture data and assert:

- `Ao vivo` and `38:12` are visible for live hero data.
- sections appear in approved order using heading DOM positions.
- roster cards expose name, position, goals and assists.
- all four kit labels exist.
- Instagram link has `href="https://www.instagram.com/unidosdorr/"`, `target="_blank"` and safe `rel`.
- no player photo renders a jersey-number fallback.

- [ ] **Step 2: Run test and verify failure**

Run: `pnpm vitest run src/features/public-site/home-page.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement approved composition**

`home-page.tsx` must render this exact semantic order:

```tsx
<>
  <SiteHeader live={data.hero.state === 'live'} />
  <main>
    <MatchHero hero={data.hero} />
    <SeasonRecord record={data.record} />
    <AboutLocation settings={data.settings} fields={data.fields} />
    <MatchHistory matches={data.recentMatches} />
    <Roster players={data.players} />
    <Rivalry rivalry={data.rivalry} />
    <Kits imageSrc="/brand/unidos-kits.png" />
    <FriendlyCta instagramUrl={data.settings.instagramUrl} />
  </main>
  <SiteFooter />
</>
```

Use full-width bands, not nested cards. Player and match rows may use cards with radius up to 8 px. `MatchHero` must keep a stable score grid and render `live`, `scheduled`, `finished` and `institutional` states from props. Use `next/image` for both approved PNG assets.

- [ ] **Step 4: Implement responsive visual rules**

Use Tailwind utilities and the tokens from `globals.css`. Required breakpoints and constraints:

- Mobile content padding 16 px; desktop max content width 1200 px.
- Hero leaves the next band visible on 667 px tall mobile and 768 px tall desktop viewports.
- Score uses fixed `minmax(72px, auto) auto minmax(72px, auto)` tracks.
- Mobile navigation contains at most five anchors and collapses to an icon menu when labels do not fit.
- Roster uses one column at 320 px, two at 640 px, four at 1024 px.
- Long names use wrapping, not clipping or viewport-scaled font sizes.
- CTA uses a real Instagram command label and external-link icon.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/features/public-site/home-page.test.tsx
pnpm lint
pnpm typecheck
pnpm build
```

Expected: PASS.

```bash
git add src/app src/features/public-site
git commit -m "feat: build public club homepage"
```

---

### Task 7: Add live match clock and Supabase Realtime refresh

**Files:**

- Create: `src/features/public-site/live-home.tsx`
- Create: `src/features/public-site/live-home.test.tsx`
- Create: `src/features/matches/use-match-clock.ts`
- Create: `src/features/matches/use-match-clock.test.tsx`
- Modify: `src/features/public-site/home-page.tsx`

- [ ] **Step 1: Write failing clock and subscription tests**

Use fake timers to assert the hook moves from `59:59` to `60:00` and `60:01`. Mock Supabase channels and assert `LiveHome` subscribes to `matches` and `match_events`, filters events by `match_id`, calls `router.refresh()` after a change, and removes the channel on unmount.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm vitest run src/features/matches/use-match-clock.test.tsx src/features/public-site/live-home.test.tsx`

Expected: FAIL with missing hooks/components.

- [ ] **Step 3: Implement the clock hook**

```ts
'use client'

import { useEffect, useState } from 'react'
import { formatMatchClock } from './domain'

export function useMatchClock(startedAt: string, endedAt: string | null) {
  const [value, setValue] = useState(() => formatMatchClock(startedAt, endedAt))
  useEffect(() => {
    if (endedAt) return
    const tick = () => setValue(formatMatchClock(startedAt, null))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt, endedAt])
  return value
}
```

- [ ] **Step 4: Implement Realtime refresh**

`LiveHome` owns the browser Supabase client. Create one channel named `live-match:<id>`, subscribe to `UPDATE` on `matches` filtered by id and `*` on `match_events` filtered by `match_id`. Debounce refreshes by 150 ms so one admin mutation cannot trigger a render storm. On channel status `SUBSCRIBED` after reconnection, refresh once to recover missed events.

For MVP scale, use Postgres Changes. Keep the subscription isolated so it can later be replaced by Broadcast without changing presentational components.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/features/matches src/features/public-site
pnpm typecheck
```

Expected: PASS.

```bash
git add src/features/matches src/features/public-site
git commit -m "feat: stream live match updates"
```

---

### Task 8: Implement admin login, shell and dashboard

**Files:**

- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/(protected)/layout.tsx`
- Create: `src/app/admin/(protected)/page.tsx`
- Create: `src/features/admin/login-form.tsx`
- Create: `src/features/admin/login-actions.ts`
- Create: `src/features/admin/admin-shell.tsx`
- Create: `src/features/admin/admin-shell.test.tsx`
- Create: `src/features/admin/dashboard.tsx`

- [ ] **Step 1: Write failing shell and login tests**

Assert the login form labels email/password, reports invalid credentials, disables while submitting and redirects on success. Assert mobile shell has four navigation areas (`Inicio`, `Jogos`, `Elenco`, `Mais`) and desktop shell renders a sidebar with the same destinations.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm vitest run src/features/admin`

Expected: FAIL because admin components do not exist.

- [ ] **Step 3: Implement login action**

Use a Zod schema with `z.email()` and minimum 8-character password. `loginAction` calls `supabase.auth.signInWithPassword`, then verifies `app_admins` through `requireAdmin` semantics. Return a generic Portuguese error for any denial; never reveal whether the email exists. On success call `redirect('/admin')`.

- [ ] **Step 4: Implement protected layout and responsive shell**

The protected layout calls `requireAdmin()` before rendering. `AdminShell` uses a desktop sidebar from 900 px and fixed mobile bottom navigation below it. Use Lucide `House`, `CalendarDays`, `Users`, `Menu`, `LogOut`; every icon-only control has an accessible label and tooltip.

Dashboard priority:

1. Active match with `Abrir console`.
2. Next scheduled match.
3. Empty state with `Cadastrar partida`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/features/admin
pnpm lint
pnpm typecheck
```

Expected: PASS.

```bash
git add src/app/admin src/features/admin
git commit -m "feat: add protected admin shell"
```

---

### Task 9: Add player, opponent and field CRUDs

**Files:**

- Create: `src/app/admin/(protected)/elenco/page.tsx`
- Create: `src/app/admin/(protected)/cadastros/page.tsx`
- Create: `src/features/players/schema.ts`
- Create: `src/features/players/actions.ts`
- Create: `src/features/players/player-form.tsx`
- Create: `src/features/players/player-list.tsx`
- Create: `src/features/opponents/schema.ts`
- Create: `src/features/opponents/actions.ts`
- Create: `src/features/opponents/opponent-form.tsx`
- Create: `src/features/opponents/opponent-list.tsx`
- Create: `src/features/fields/schema.ts`
- Create: `src/features/fields/actions.ts`
- Create: `src/features/fields/field-form.tsx`
- Create: `src/features/fields/field-list.tsx`
- Create: `src/features/media/image-upload.tsx`
- Create: `src/features/media/image-upload.test.tsx`
- Create: `src/features/admin/resource-actions.test.ts`

- [ ] **Step 1: Write failing validation and mutation tests**

Test these cases with mocked authenticated Supabase clients:

- player rejects duplicate active shirt number and invalid position;
- opponent can become the single primary rival and clears the previous primary rival in one action;
- field requires name/address and validates maps URL;
- archive actions set `is_active=false` and never issue DELETE.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm vitest run src/features/admin/resource-actions.test.ts`

Expected: FAIL with missing actions.

- [ ] **Step 3: Implement schemas**

Use these exact Zod contracts:

```ts
export const playerSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(80),
  nickname: z.string().trim().max(40).optional(),
  shirtNumber: z.coerce.number().int().min(0).max(99),
  position: z.enum(['goleiro', 'fixo', 'ala', 'meia', 'pivo']),
  photoUrl: z.url().optional().or(z.literal('')),
})

export const opponentSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(80),
  crestUrl: z.url().optional().or(z.literal('')),
  isRival: z.boolean(),
  isPrimaryRival: z.boolean(),
  rivalryTitle: z.string().trim().max(80).optional(),
  rivalryDescription: z.string().trim().max(400).optional(),
})

export const fieldSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(200),
  mapsUrl: z.url().optional().or(z.literal('')),
  isPrimary: z.boolean(),
})
```

- [ ] **Step 4: Implement server actions and forms**

Every server action must call `requireAdmin()`, parse `FormData`, map camelCase to database names, return `{ ok, fieldErrors, message }`, call `revalidatePath` and never accept `is_active` directly from the browser.

Forms use semantic labels, native validation hints and Radix Dialog only for create/edit overlays. Lists render compact rows on desktop and unframed stacked rows on mobile. Archive uses AlertDialog confirmation.

Create `ImageUpload` for optional player photos and opponent crests. It accepts only JPEG, PNG or WebP up to 5 MB, shows a local preview, uploads to the matching `players` or `opponents` bucket under `<resource-id>/<random-uuid>.<extension>`, and writes only the returned public URL into the resource form. While uploading, disable save and expose progress text through `aria-live`. Test invalid MIME type, oversize file, successful URL assignment and failed upload retry.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/features/admin/resource-actions.test.ts src/features/media/image-upload.test.tsx
pnpm lint
pnpm typecheck
```

Expected: PASS.

```bash
git add src/app/admin src/features/players src/features/opponents src/features/fields src/features/media src/features/admin/resource-actions.test.ts
git commit -m "feat: add club resource management"
```

---

### Task 10: Add match scheduling and lifecycle

**Files:**

- Create: `src/app/admin/(protected)/jogos/page.tsx`
- Create: `src/app/admin/(protected)/jogos/novo/page.tsx`
- Create: `src/app/admin/(protected)/jogos/[id]/page.tsx`
- Create: `src/features/matches/schema.ts`
- Create: `src/features/matches/actions.ts`
- Create: `src/features/matches/match-form.tsx`
- Create: `src/features/matches/match-list.tsx`
- Create: `src/features/matches/match-detail.tsx`
- Create: `src/features/matches/actions.test.ts`

- [ ] **Step 1: Write failing lifecycle tests**

Assert:

- create requires active opponent, field and valid future/past datetime;
- start invokes RPC `start_match` exactly once and surfaces the one-live-match error;
- finish invokes `finish_match` only after confirmation;
- finished matches cannot restart;
- UI labels the match as Agendado, Ao vivo or Encerrado.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm vitest run src/features/matches/actions.test.ts`

Expected: FAIL with missing actions.

- [ ] **Step 3: Implement match schema and actions**

```ts
export const matchSchema = z.object({
  id: z.uuid().optional(),
  opponentId: z.uuid(),
  fieldId: z.uuid(),
  scheduledAt: z.iso.datetime({ local: true }),
  isHome: z.boolean(),
  notes: z.string().trim().max(500).optional(),
})
```

Create/update writes only scheduled matches. `startMatchAction(id)` and `finishMatchAction(id)` call the RPCs from Task 2, return stable Portuguese error messages and revalidate `/`, `/admin` and `/admin/jogos/<id>`.

- [ ] **Step 4: Implement pages and confirmations**

Match detail shows opponent, field, scheduled time and current score. Start is a primary command only for scheduled matches. Finish is a destructive outlined command inside AlertDialog only for live matches. Finished match detail links to event corrections but does not expose a restart command.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/features/matches
pnpm lint
pnpm typecheck
```

Expected: PASS.

```bash
git add src/app/admin src/features/matches
git commit -m "feat: manage match lifecycle"
```

---

### Task 11: Implement the mobile Quick Console and event corrections

**Files:**

- Create: `src/app/admin/(protected)/jogos/[id]/ao-vivo/page.tsx`
- Create: `src/features/live-match/live-console.tsx`
- Create: `src/features/live-match/goal-sheet.tsx`
- Create: `src/features/live-match/event-timeline.tsx`
- Create: `src/features/live-match/event-menu.tsx`
- Create: `src/features/live-match/actions.ts`
- Create: `src/features/live-match/schema.ts`
- Create: `src/features/live-match/live-console.test.tsx`
- Create: `src/features/live-match/actions.test.ts`

- [ ] **Step 1: Write failing event action tests**

Cover:

- Unidos goal requires scorer and optional different assist;
- opponent goal needs no player;
- own goal requires beneficiary and clears scorer/assist;
- `client_event_id` is generated once and reused on retry;
- remove sets `deleted_at` instead of deleting;
- edit validates scorer/assist/beneficiary and allows finished-match corrections;
- pending submission disables the confirm command.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm vitest run src/features/live-match`

Expected: FAIL because console/actions do not exist.

- [ ] **Step 3: Implement event schema and actions**

```ts
export const goalEventSchema = z.object({
  matchId: z.uuid(),
  clientEventId: z.uuid(),
  beneficiary: z.enum(['unidos', 'opponent']),
  isOwnGoal: z.boolean(),
  scorerPlayerId: z.uuid().nullable(),
  assistPlayerId: z.uuid().nullable(),
}).superRefine((value, ctx) => {
  if (!value.isOwnGoal && value.beneficiary === 'unidos' && !value.scorerPlayerId) {
    ctx.addIssue({ code: 'custom', path: ['scorerPlayerId'], message: 'Selecione quem marcou.' })
  }
  if (value.scorerPlayerId && value.scorerPlayerId === value.assistPlayerId) {
    ctx.addIssue({ code: 'custom', path: ['assistPlayerId'], message: 'Autor e assistente devem ser diferentes.' })
  }
})
```

Insert with `minute_snapshot: 0`; the database trigger replaces it. A duplicate `client_event_id` is treated as successful idempotent replay after fetching the existing row. Edit never changes `client_event_id`. Remove sets `deleted_at = now()`.

- [ ] **Step 4: Implement the Quick Console**

The console layout contract:

1. sticky compact admin header;
2. live badge and `useMatchClock` value;
3. stable three-column score;
4. 48 px `Gol do Unidos` primary button;
5. secondary `Gol adversario` and `Gol contra` buttons;
6. newest-first event timeline;
7. menu per event for edit/remove;
8. finish command behind confirmation.

`GoalSheet` uses a Radix Dialog presented from the bottom on mobile. Player selection uses large number swatches; assist is optional. Announce successful event with an `aria-live="polite"` status. Keep the same content in a centered dialog on desktop.

- [ ] **Step 5: Add admin-side Realtime synchronization**

Subscribe to the same filtered match/event changes as the public site. On mutation success, wait for database confirmation and then close the sheet. On channel reconnect, refetch full state. Show `Enviando...`, `Falha ao enviar` and `Tentar novamente` states without changing the displayed score optimistically.

- [ ] **Step 6: Verify and commit**

Run:

```bash
pnpm vitest run src/features/live-match src/features/matches
pnpm lint
pnpm typecheck
```

Expected: PASS.

```bash
git add src/app/admin src/features/live-match src/features/matches
git commit -m "feat: add live match quick console"
```

---

### Task 12: Add club settings and audited stat adjustments

**Files:**

- Create: `src/app/admin/(protected)/configuracoes/page.tsx`
- Create: `src/features/settings/settings-form.tsx`
- Create: `src/features/settings/adjustment-form.tsx`
- Create: `src/features/settings/actions.ts`
- Create: `src/features/settings/actions.test.ts`

- [ ] **Step 1: Write failing settings tests**

Assert Instagram must be an `instagram.com` URL, about text cannot be empty, club adjustment only accepts wins/draws/losses, player adjustment only accepts goals/assists, zero delta is rejected and reason needs at least four characters.

- [ ] **Step 2: Run test and verify failure**

Run: `pnpm vitest run src/features/settings/actions.test.ts`

Expected: FAIL with missing settings actions.

- [ ] **Step 3: Implement schemas and actions**

Settings update the singleton `club_settings` row. Adjustments are append-only in the UI: correction of a wrong adjustment creates an inverse row with a reason, preserving history. The form requires scope, metric, signed delta, optional player and reason.

- [ ] **Step 4: Implement the page**

Use tabs for `Clube` and `Ajustes`. The club tab edits bio, about, Instagram, locality and primary field. The adjustments tab shows compact chronological rows and the new-adjustment form. Do not expose raw database ids in visible labels.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm vitest run src/features/settings src/features/public-site src/features/matches
pnpm lint
pnpm typecheck
```

Expected: PASS.

```bash
git add src/app/admin src/features/settings
git commit -m "feat: add club settings and stat corrections"
```

---

### Task 13: Add E2E coverage, responsive screenshots and deployment documentation

**Files:**

- Create: `e2e/public-home.spec.ts`
- Create: `e2e/admin-match.spec.ts`
- Modify: `playwright.config.ts`
- Create: `README.md`
- Create: `docs/DEPLOY.md`
- Modify: `docs/CONTINUIDADE.md`

- [ ] **Step 1: Write public E2E tests**

`public-home.spec.ts` must assert all approved section headings, Instagram destination, no horizontal overflow, visible logo and kit image natural dimensions greater than zero. Capture full-page desktop and mobile screenshots.

Core checks:

```ts
await expect(page.getByRole('heading', { name: /unidos do rr/i })).toBeVisible()
await expect(page.getByRole('link', { name: /amistoso/i })).toHaveAttribute('href', 'https://www.instagram.com/unidosdorr/')
expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
await expect(page).toHaveScreenshot('public-home.png', { fullPage: true })
```

- [ ] **Step 2: Write the full admin E2E flow**

Use `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD`. Create unique names with the test run id. The test logs in, creates player/opponent/field, schedules and starts a match, adds a goal with assist, verifies the public page in a second context, edits the event, removes it, adds the final events, finishes the match and verifies the public final state and updated club record.

Use role/label locators, never CSS implementation selectors. Delete no records; archive test records in teardown through the admin UI or service-role setup helper.

- [ ] **Step 3: Run E2E and inspect screenshots**

Run:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: desktop and mobile projects PASS. Inspect snapshots for clipping, overlap, unreadable type, blank images and unstable score dimensions. Fix any visual defect before updating snapshots.

- [ ] **Step 4: Write operation docs**

`README.md` must include prerequisites, install, Supabase local start/reset, environment setup, admin creation, dev, tests and build.

`docs/DEPLOY.md` must include:

1. create Supabase project;
2. link CLI and push migrations;
3. enable Realtime tables if migration publication is not applied by hosting policy;
4. set Auth site URL and redirect URLs;
5. create admin with `pnpm admin:create` using service role only in a trusted shell;
6. create Vercel project and set environment variables;
7. run preview smoke test;
8. promote to production;
9. verify RLS with anonymous and authenticated sessions;
10. rotate any credential exposed during setup.

Update `docs/CONTINUIDADE.md` with current commit, verification results, known limitations and exact next action. Never write passwords or secret values.

- [ ] **Step 5: Run the final verification gate**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm db:test
pnpm test:e2e
pnpm build
git diff --check
```

Expected: every command exits 0. Do not claim completion if any command is skipped; record the blocker and exact missing prerequisite.

- [ ] **Step 6: Commit**

```bash
git add e2e playwright.config.ts README.md docs/DEPLOY.md docs/CONTINUIDADE.md
git commit -m "test: verify mvp release flow"
```

---

## Completion checklist

- [ ] Every task commit exists in order and contains only its scoped files.
- [ ] All design-spec acceptance criteria map to a test or manual screenshot inspection above.
- [ ] Root PNG source files are preserved; application copies live under `public/brand`.
- [ ] `.superpowers/` is ignored and never committed.
- [ ] No service role key, admin password or local Supabase secret is committed.
- [ ] Public reads work anonymously; every write fails without the allowlisted admin account.
- [ ] Only one match can be live.
- [ ] Clock survives reload, has no pause and continues beyond 60:00.
- [ ] Add/edit/remove event updates score and derived stats consistently.
- [ ] Mobile and desktop Playwright screenshots have no overflow or overlap.
- [ ] Production build is ready for Vercel.

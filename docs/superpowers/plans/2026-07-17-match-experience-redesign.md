# Match Experience Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar partidas historicas com detalhes publicos, carrossel 2.5D dos quatro kits e uma home Broadcast Tech responsiva e animada.

**Architecture:** O banco passa a guardar placar consolidado apenas para partidas encerradas, enquanto eventos continuam alimentando o ao vivo e estatisticas individuais. A camada publica separa resumo e detalhe de partida; a UI usa componentes focados para faixa da temporada, historico, movimento e kits. O admin preserva o fluxo ao vivo e adiciona um modo historico com detalhamento opcional.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase/Postgres/RLS/Realtime, Motion, Embla Carousel, Vitest, Testing Library, pgTAP e Playwright.

---

## Estrutura De Arquivos

- `supabase/migrations/cli-generated_historical_match_scores.sql`: placar consolidado, lifecycle e eventos historicos.
- `supabase/tests/database/historical-matches.test.sql`: contrato de banco, seguranca e limites de eventos.
- `src/lib/supabase/database.types.ts`: tipos regenerados apos a migration.
- `src/features/matches/types.ts`: tipos de resumo e detalhe de partida.
- `src/features/matches/domain.ts`: selecao da fonte oficial do placar e validacao de detalhamento.
- `src/features/matches/domain.test.ts`: testes unitarios do contrato de placar.
- `src/features/public-site/match-detail-query.ts`: consulta server-side de uma partida e navegacao adjacente.
- `src/features/public-site/match-detail.tsx`: apresentacao publica do detalhe.
- `src/features/public-site/match-detail.css`: layout responsivo da rota de detalhe.
- `src/app/(site)/jogos/[id]/page.tsx`: rota publica.
- `src/app/(site)/jogos/[id]/loading.tsx`: skeleton estavel.
- `src/app/(site)/jogos/[id]/not-found.tsx`: partida inexistente.
- `src/features/admin/historical-match-editor.tsx`: formulario de resultado e eventos opcionais.
- `src/features/admin/resource-managers.tsx`: integra o modo historico ao gestor atual.
- `src/features/public-site/season-record.tsx`: faixa de estatisticas alinhada.
- `src/features/public-site/match-history.tsx`: lista navegavel de partidas.
- `src/features/public-site/motion-reveal.tsx`: movimento reutilizavel e acessivel.
- `src/features/public-site/kit-carousel.tsx`: carrossel 2.5D.
- `src/features/public-site/home-page.tsx`: composicao das novas secoes.
- `src/features/public-site/home.css`: linguagem Broadcast Tech e responsividade.
- `public/kits/*.png`: quatro imagens publicas dos kits.

### Task 1: Dependencias E Assets Dos Kits

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `public/kits/jogador-home.png`
- Create: `public/kits/jogador-away.png`
- Create: `public/kits/goleiro-home.png`
- Create: `public/kits/goleiro-away.png`

- [ ] **Step 1: Instalar dependencias com lockfile**

Run:

```bash
corepack pnpm add motion embla-carousel-react embla-carousel-autoplay
```

Expected: `package.json` e `pnpm-lock.yaml` incluem as tres dependencias.

- [ ] **Step 2: Publicar os quatro assets sem alterar os originais**

Run:

```bash
mkdir -p public/kits
cp "Kits/Jogador - home.png" public/kits/jogador-home.png
cp "Kits/Jogador away.png" public/kits/jogador-away.png
cp "Kits/Goleiro home.png" public/kits/goleiro-home.png
cp "Kits/Goleiro Away.png" public/kits/goleiro-away.png
```

Expected: quatro PNGs RGBA de `1448x1086` em `public/kits/`.

- [ ] **Step 3: Validar resolucao de arquivos**

Run:

```bash
file public/kits/*.png
```

Expected: quatro imagens PNG `1448 x 1086`.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml public/kits
git commit -m "chore: add motion and kit carousel assets"
```

### Task 2: Contrato De Banco Para Partidas Historicas

**Files:**
- Create: `supabase/migrations/cli-generated_historical_match_scores.sql`
- Create: `supabase/tests/database/historical-matches.test.sql`
- Modify: `src/lib/supabase/database.types.ts`

- [ ] **Step 1: Criar a migration pelo CLI**

Run:

```bash
corepack pnpm exec supabase migration new historical_match_scores
```

Expected: um arquivo timestampado em `supabase/migrations/`.

- [ ] **Step 2: Escrever testes pgTAP que falham**

Adicionar testes que comprovem:

```sql
select has_column('public', 'matches', 'score_unidos');
select has_column('public', 'matches', 'score_opponent');

select throws_ok(
  $$ insert into public.matches (opponent_id, field_id, scheduled_at, status)
     values (test_opponent(), test_field(), now() - interval '1 day', 'finished') $$,
  '23514'
);

select lives_ok(
  $$ insert into public.matches (
       opponent_id, field_id, scheduled_at, status,
       started_at, ended_at, score_unidos, score_opponent
     ) values (
       test_opponent(), test_field(), now() - interval '1 day', 'finished',
       now() - interval '1 day', now() - interval '23 hours', 3, 2
     ) $$
);
```

O arquivo tambem deve testar consolidacao no `finish_match`, minuto historico preservado, autor nulo permitido, limite de eventos pelo placar final e escrita anonima bloqueada.

- [ ] **Step 3: Executar os testes e confirmar falha**

Run:

```bash
corepack pnpm exec supabase test db --local
```

Expected: FAIL porque as colunas e regras ainda nao existem.

- [ ] **Step 4: Implementar migration**

Adicionar:

```sql
alter table public.matches
  add column score_unidos integer,
  add column score_opponent integer;

update public.matches m
set
  score_unidos = (
    select count(*)::integer from public.match_events e
    where e.match_id = m.id and e.deleted_at is null and e.beneficiary = 'unidos'
  ),
  score_opponent = (
    select count(*)::integer from public.match_events e
    where e.match_id = m.id and e.deleted_at is null and e.beneficiary = 'opponent'
  )
where m.status = 'finished';

alter table public.matches add constraint matches_finished_score
check (
  (status = 'finished' and score_unidos >= 0 and score_opponent >= 0)
  or (status <> 'finished' and score_unidos is null and score_opponent is null)
);
```

Substituir `enforce_match_lifecycle()` para preservar `started_at`, `ended_at` e placar em inserts historicos, usar duracao padrao de 60 minutos e consolidar eventos na transicao `live -> finished`. Substituir `set_event_minute()` para preservar minutos em partidas encerradas e validar que eventos detalhados nao ultrapassam `score_unidos`/`score_opponent`. Remover apenas o check que exige autor em todo gol do Unidos; manter autor/assistencia nulos para eventos nao atribuidos.

- [ ] **Step 5: Aplicar localmente e executar pgTAP**

Run:

```bash
corepack pnpm exec supabase migration up --local
corepack pnpm exec supabase test db --local
```

Expected: todos os testes antigos e novos passam.

- [ ] **Step 6: Regenerar tipos**

Run:

```bash
corepack pnpm run db:types
```

Expected: `matches.Row`, `Insert` e `Update` contem os dois campos de placar.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations supabase/tests src/lib/supabase/database.types.ts
git commit -m "feat: support historical match scores"
```

### Task 3: Dominio E Consultas Publicas

**Files:**
- Modify: `src/features/matches/types.ts`
- Modify: `src/features/matches/domain.ts`
- Modify: `src/features/matches/domain.test.ts`
- Modify: `src/features/public-site/demo-data.ts`
- Modify: `src/features/public-site/queries.ts`
- Create: `src/features/public-site/match-detail-query.ts`

- [ ] **Step 1: Escrever testes de dominio que falham**

Adicionar:

```ts
it('uses the consolidated score for finished matches', () => {
  expect(resolveMatchScore({
    status: 'finished',
    scoreUnidos: 4,
    scoreOpponent: 2,
    events: [],
  })).toEqual({ unidos: 4, opponent: 2 })
})

it('uses events while the match is live', () => {
  expect(resolveMatchScore({
    status: 'live',
    scoreUnidos: null,
    scoreOpponent: null,
    events: [goal('unidos'), goal('opponent')],
  })).toEqual({ unidos: 1, opponent: 1 })
})
```

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
corepack pnpm vitest run src/features/matches/domain.test.ts
```

Expected: FAIL porque `resolveMatchScore` nao existe.

- [ ] **Step 3: Implementar dominio minimo**

```ts
export function resolveMatchScore(input: {
  status: 'scheduled' | 'live' | 'finished'
  scoreUnidos: number | null
  scoreOpponent: number | null
  events: GoalEvent[]
}): Score {
  if (input.status === 'finished') {
    return {
      unidos: input.scoreUnidos ?? 0,
      opponent: input.scoreOpponent ?? 0,
    }
  }
  return calculateScore(input.events)
}
```

- [ ] **Step 4: Atualizar resumo da home**

Tornar `HomeMatch.id` obrigatorio. Em `getHomeData()`, usar `resolveMatchScore` para cada partida e calcular o recorde pelos placares consolidados encerrados.

- [ ] **Step 5: Implementar consulta detalhada**

`getMatchDetail(id)` deve buscar partida, adversario, campo, eventos ativos, autor e assistente; ordenar eventos por minuto; buscar partidas anterior/proxima por `scheduled_at`; e retornar `null` para ID inexistente.

- [ ] **Step 6: Rodar testes**

Run:

```bash
corepack pnpm vitest run src/features/matches/domain.test.ts src/app/smoke.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/matches src/features/public-site/demo-data.ts src/features/public-site/queries.ts src/features/public-site/match-detail-query.ts
git commit -m "feat: expose consolidated match data"
```

### Task 4: Cadastro De Jogos Passados No Admin

**Files:**
- Create: `src/features/admin/historical-match-editor.tsx`
- Create: `src/features/admin/historical-match-editor.test.tsx`
- Modify: `src/features/admin/resource-managers.tsx`
- Modify: `src/features/admin/admin.css`

- [ ] **Step 1: Escrever teste do modo historico**

O teste deve alternar para `Ja realizada`, preencher adversario, campo, data, `3 x 2`, submeter e verificar um insert com:

```ts
expect(insert).toHaveBeenCalledWith(expect.objectContaining({
  status: 'finished',
  score_unidos: 3,
  score_opponent: 2,
  started_at: expect.any(String),
  ended_at: expect.any(String),
}))
```

Tambem deve provar que autor e assistencia nao sao exigidos para salvar o resultado.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
corepack pnpm vitest run src/features/admin/historical-match-editor.test.tsx
```

Expected: FAIL porque o componente ainda nao existe.

- [ ] **Step 3: Implementar formulario segmentado**

Criar `HistoricalMatchEditor` com props de adversarios, campos, callback de sucesso e cliente Supabase injetavel em teste. Converter `datetime-local` para ISO, usar 60 minutos como duracao e validar placares inteiros entre 0 e 99.

- [ ] **Step 4: Implementar editor opcional de eventos**

Para uma partida encerrada selecionada, mostrar gols detalhados e saldo restante por equipe. Permitir minuto, beneficiario, autor opcional e assistencia opcional. Bloquear novo evento quando o total detalhado atingir o placar consolidado.

- [ ] **Step 5: Integrar ao MatchManager**

Adicionar controle `AGENDADA | JA REALIZADA`, botao `DETALHES` nas partidas encerradas e manter `INICIAR`/`CONSOLE` sem regressao.

- [ ] **Step 6: Rodar testes e lint**

Run:

```bash
corepack pnpm vitest run src/features/admin/historical-match-editor.test.tsx
corepack pnpm run lint
```

Expected: PASS sem warnings.

- [ ] **Step 7: Commit**

```bash
git add src/features/admin
git commit -m "feat: register historical matches in admin"
```

### Task 5: Pagina Publica De Detalhes

**Files:**
- Create: `src/features/public-site/match-detail.tsx`
- Create: `src/features/public-site/match-detail.test.tsx`
- Create: `src/features/public-site/match-detail.css`
- Create: `src/app/(site)/jogos/[id]/page.tsx`
- Create: `src/app/(site)/jogos/[id]/loading.tsx`
- Create: `src/app/(site)/jogos/[id]/not-found.tsx`

- [ ] **Step 1: Escrever testes de apresentacao**

Testar tres cenarios: timeline completa com autor/assistencia, placar parcialmente detalhado com mensagem informativa e partida sem eventos. Verificar links anterior/proximo e CTA do Instagram.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
corepack pnpm vitest run src/features/public-site/match-detail.test.tsx
```

Expected: FAIL porque o componente nao existe.

- [ ] **Step 3: Implementar MatchDetail**

Renderizar hero compacto de placar, metadados, timeline, observacoes e navegacao. Usar `Link`, `MapPin`, `Goal`, `ArrowLeft`, `ArrowRight` e `Instagram` do Lucide.

- [ ] **Step 4: Implementar rota e estados**

```tsx
export default async function MatchPage({ params }: PageProps<'/jogos/[id]'>) {
  const { id } = await params
  const detail = await getMatchDetail(id)
  if (!detail) notFound()
  return <MatchDetail data={detail} />
}
```

Criar skeleton com dimensoes fixas e pagina de nao encontrado com retorno para `/`.

- [ ] **Step 5: Rodar testes, typecheck e lint**

Run:

```bash
corepack pnpm vitest run src/features/public-site/match-detail.test.tsx
corepack pnpm run typecheck
corepack pnpm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app src/features/public-site
git commit -m "feat: add public match detail pages"
```

### Task 6: Faixa Da Temporada E Historico Navegavel

**Files:**
- Create: `src/features/public-site/season-record.tsx`
- Create: `src/features/public-site/season-record.test.tsx`
- Create: `src/features/public-site/match-history.tsx`
- Modify: `src/features/public-site/home-page.tsx`
- Modify: `src/features/public-site/home.css`

- [ ] **Step 1: Escrever teste da faixa**

Renderizar `SeasonRecord` com `8, 2, 0, 6` e verificar quatro celulas, quatro rotulos e nenhum valor duplicado ou oculto semanticamente.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
corepack pnpm vitest run src/features/public-site/season-record.test.tsx
```

Expected: FAIL porque o componente nao existe.

- [ ] **Step 3: Implementar componentes**

`SeasonRecord` usa uma lista de quatro itens com a mesma estrutura DOM. `MatchHistory` envolve cada linha em `Link href={'/jogos/' + match.id}` e fornece foco visivel e `aria-label` com placar.

- [ ] **Step 4: Corrigir CSS responsivo**

Desktop: `grid-template-columns: repeat(4, minmax(0, 1fr))`. Cada celula usa `grid-template-rows: auto 1fr auto`, numero alinhado pela baseline e bordas consistentes. Mobile: grade `2 x 2`, mantendo partidas visivel.

- [ ] **Step 5: Rodar teste e screenshot focado**

Run:

```bash
corepack pnpm vitest run src/features/public-site/season-record.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/public-site
git commit -m "fix: align season record and link match history"
```

### Task 7: Carrossel 2.5D E Sistema De Movimento

**Files:**
- Create: `src/features/public-site/kit-carousel.tsx`
- Create: `src/features/public-site/kit-carousel.test.tsx`
- Create: `src/features/public-site/motion-reveal.tsx`
- Modify: `src/features/public-site/home-page.tsx`
- Modify: `src/features/public-site/home.css`

- [ ] **Step 1: Escrever testes do carrossel**

Verificar quatro slides, nome do kit ativo, setas acessiveis, indicadores, atualizacao apos clique e pausa do autoplay quando `prefers-reduced-motion` for verdadeiro.

- [ ] **Step 2: Rodar teste e confirmar falha**

Run:

```bash
corepack pnpm vitest run src/features/public-site/kit-carousel.test.tsx
```

Expected: FAIL porque `KitCarousel` nao existe.

- [ ] **Step 3: Implementar KitCarousel com Embla**

Usar `useEmblaCarousel({ loop: true, align: 'center' })`, plugin Autoplay, estado `selectedIndex`, `scrollPrev`, `scrollNext` e `scrollTo`. Cada slide recebe `data-active` para CSS aplicar perspectiva sem alterar o fluxo.

- [ ] **Step 4: Implementar palco 2.5D**

O viewport usa `perspective: 1200px`; slides adjacentes recebem `rotateY`, `translateZ`, escala e opacidade. A imagem ativa permanece inteira com `object-fit: contain`, sombra curta e reflexo discreto. Controles usam icones, tooltips e alvos de 44 px.

- [ ] **Step 5: Implementar MotionReveal**

Usar `motion` com `whileInView`, `viewport={{ once: true, amount: 0.18 }}` e `useReducedMotion()`. Aplicar em secoes e itens, sem animar layout ou propriedades caras.

- [ ] **Step 6: Rodar testes e lint**

Run:

```bash
corepack pnpm vitest run src/features/public-site/kit-carousel.test.tsx
corepack pnpm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/public-site
git commit -m "feat: add broadcast motion and 2.5d kit carousel"
```

### Task 8: Polimento, E2E E Publicacao Do Schema

**Files:**
- Modify: `src/features/public-site/home.css`
- Modify: `src/features/admin/admin.css`
- Modify: `docs/CONTINUIDADE.md`
- Create or Modify: `playwright.config.ts`
- Create: `tests/e2e/match-experience.spec.ts`

- [ ] **Step 1: Criar fluxo E2E**

O teste deve autenticar no admin, cadastrar uma partida passada `3 x 2`, abrir detalhes, adicionar um gol opcional, visitar a home, clicar no historico e navegar pelo carrossel em desktop e mobile.

- [ ] **Step 2: Executar suite completa local**

Run:

```bash
corepack pnpm test
corepack pnpm run db:test
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run build
```

Expected: todas as suites e o build passam.

- [ ] **Step 3: Validar visualmente em 390 px e 1440 px**

Iniciar com Node 22, capturar home, detalhe, admin e carrossel. Confirmar: nenhum overflow horizontal, texto sobreposto, imagem quebrada, canvas vazio, layout shift ou erro de console. Validar tambem `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Aplicar migration remota**

Run:

```bash
corepack pnpm exec supabase db push --linked --dry-run
corepack pnpm exec supabase db push --linked
```

Expected: somente a migration `historical_match_scores` e aplicada.

- [ ] **Step 5: Smoke test remoto**

Consultar uma partida finalizada pela chave publicavel, confirmar os novos placares e provar que insert anonimo continua retornando `401 / 42501`.

- [ ] **Step 6: Atualizar continuidade**

Registrar migration, novos componentes, comandos executados, resultados dos testes e limitacoes restantes em `docs/CONTINUIDADE.md`.

- [ ] **Step 7: Commit final e push**

```bash
git add src tests docs playwright.config.ts
git commit -m "test: verify redesigned match experience"
git push origin feature/unidos-do-rr-mvp
```

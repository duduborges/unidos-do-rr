# Unidos do RR - Continuidade do projeto

Este documento registra o contexto, as decisoes e o estado do projeto para que o trabalho possa ser retomado por outro agente, inclusive Claude.

## Estado atual

- Fase: descoberta e definicao do MVP.
- Implementacao: ainda nao iniciada; especificacao aprovada e plano tecnico pronto, aguardando escolha do modo de execucao.
- Repositorio: projeto novo, sem estrutura de aplicacao e sem commits.
- Ativos existentes na raiz:
  - `unidos-logo.png`: escudo oficial, 1254 x 1254 px.
  - `unidos-kit.png`: apresentacao dos uniformes, 1448 x 1086 px.
- Companion visual: sessao local criada em `.superpowers/brainstorm/`.

## Objetivo

Construir um MVP publicavel do site do time de Fut7 Unidos do RR, com site publico, painel administrativo e atualizacoes de jogo em tempo real.

## Stack obrigatoria

- Node.js.
- Supabase para banco PostgreSQL, autenticacao e Realtime.
- Vercel para deploy.

## Decisoes confirmadas

- A primeira entrega sera um MVP publicavel.
- O MVP inclui site publico, painel administrativo essencial, login e placar ao vivo.
- O MVP tera uma unica conta administrativa, que podera ser compartilhada entre os responsaveis pelo time.
- O site publico e o painel administrativo devem ser totalmente responsivos em mobile e desktop.
- O fluxo de operacao da partida deve ser confortavel no celular, pois sera usado ao lado do campo.
- As partidas usam, em geral, 60 minutos corridos e nao possuem dois tempos.
- Depois de iniciado, o cronometro corre continuamente e nao pode ser pausado.
- Ao atingir 60:00, o cronometro continua contando ate o encerramento manual da partida.
- O projeto deve ser documentado durante a execucao para facilitar continuidade em outro agente.
- Correcao avancada de estatisticas pode ser tratada depois do fluxo essencial, sem impedir que erros de eventos sejam corrigidos no MVP.
- O CTA de amistosos direcionara para https://www.instagram.com/unidosdorr/.

## Escopo publico solicitado

- Apresentacao do time e da ligacao com o Rio Vermelho, Florianopolis.
- Elenco com nome, posicao e estatisticas dinamicas.
- Local onde o time joga.
- Historico de partidas com local, placar e resumo de vitorias, empates e derrotas.
- Secao do classico Unidos do RR x Muito Paia FC.
- Chamada para marcar amistoso via DM no Instagram.
- Placar, horario e eventos de uma partida ao vivo, atualizados em tempo real.
- Exibicao dos quatro kits: jogador home/away e goleiro home/away.

## Escopo administrativo solicitado

- Login.
- Cadastro e edicao de atletas.
- Cadastro de adversarios, campos e rivais.
- Cadastro de partidas.
- Inicio de partida com cronometro.
- Registro de gol com autor, assistencia opcional ou gol contra.
- Remocao/correcao de gol.
- Correcao de estatisticas de jogador e clube.
- Atualizacao em tempo real do site publico.

## Direcao tecnica preliminar

Arquitetura aprovada: Next.js com App Router sobre Node.js, hospedado na Vercel. O Supabase fornece Auth, PostgreSQL e Realtime. O placar publico assina alteracoes do Supabase Realtime; nao sera mantido um servidor WebSocket proprio dentro de funcoes serverless da Vercel.

O cronometro deve ser calculado a partir de timestamps persistidos no banco, para continuar correto mesmo que o administrador feche ou recarregue o navegador.

## Modelo de dados aprovado

- `players`: atletas, numero, posicao, foto e status ativo.
- `opponents`: adversarios, escudo e indicacao de rival.
- `fields`: campos, endereco e link de mapa.
- `matches`: partidas, data, adversario, campo, status, `started_at` e `ended_at`.
- `match_events`: gols, assistencia opcional, gol contra, minuto e correcoes.
- `stat_adjustments`: ajustes manuais com motivo registrado.
- `club_settings`: Instagram, textos e configuracoes publicas.

Gols e eventos sao a fonte oficial do placar e das estatisticas. Correcoes ou remocoes recalculam os dados derivados. O publico assina `matches` e `match_events` pelo Supabase Realtime. Escritas exigem a conta autenticada e autorizada por RLS.

Em conexao instavel, o admin exibe envio pendente, impede duplicidade e sincroniza novamente o estado confirmado pelo banco.

## Organizacao de interface aprovada

### Site publico

A primeira area muda conforme o estado: proxima partida, jogo ao vivo, resultado final ou apresentacao institucional com o ultimo resultado. Estatisticas individuais incluem o jogo atual; o resumo de vitorias, empates e derrotas muda apenas quando a partida e encerrada.

### Painel administrativo

- `/admin/login`: conta administrativa unica.
- `/admin`: visao geral e jogo atual.
- `/admin/jogos`: criar, editar, iniciar e consultar partidas.
- `/admin/elenco`: atletas e estatisticas.
- `/admin/cadastros`: adversarios, campos e rivais.
- `/admin/configuracoes`: textos, Instagram e ajustes.

No celular, o admin usa navegacao inferior com quatro areas. Durante uma partida, o Console Rapido assume a tela principal. Edicao, remocao de eventos e encerramento exigem confirmacao. Atletas sem foto usam o numero da camisa como representacao.

## Direcao visual recebida

- Personalidade: forte, urbana, competitiva, comunitaria, moderna e direta.
- Frase principal: `Unidos pelo bairro.`
- Base escura: `#030B14` e `#071626`.
- Destaque vermelho: `#C81018`.
- Texto principal: `#F7F7F4`.
- Tipografia sugerida: Barlow Condensed ExtraBold para titulos e Inter para interface.
- Elementos: escudo, linhas vermelhas, curvas representando o rio e referencias discretas ao bairro.
- Evitar efeitos 3D excessivos, excesso de cores e referencias comerciais nao autorizadas.
- Direcao de homepage aprovada: Dia de Jogo, com escudo e placar como elementos dominantes na primeira tela.
- Quando nao houver partida ao vivo, o mesmo espaco apresenta o proximo jogo.
- Ordem aprovada da homepage: jogo ao vivo ou proximo jogo; resumo da temporada; sobre o time e local; ultimas partidas; elenco; classico; kits; CTA para amistoso no Instagram.
- Fluxo administrativo de partida aprovado: Console Rapido, otimizado para uso no celular.
- O placar e o cronometro ficam sempre visiveis; botoes grandes abrem seletores de autor e assistencia; cada lance possui menu para edicao ou remocao.

## Questoes em aberto

- Dados iniciais de atletas, partidas, campos e adversarios.
- Estrutura final da navegacao publica e do painel.

## Proximos passos

1. Fechar as decisoes essenciais do MVP.
2. Comparar alternativas de arquitetura e fluxo administrativo.
3. Apresentar e validar a direcao visual no companion.
4. Escrever a especificacao aprovada.
5. Criar o plano de implementacao.
6. Implementar com testes e validacao responsiva.

## Registro de decisoes

### 2026-07-16

- Projeto analisado: repositorio vazio, exceto pelos dois ativos visuais.
- Usuario escolheu um MVP publicavel como primeira entrega.
- Usuario solicitou documentacao continua para permitir retomada com Claude.
- MVP definido com uma unica conta administrativa compartilhavel.
- Responsividade mobile e desktop definida como requisito obrigatorio, inclusive no admin.
- Cronometro definido como periodo unico de 60 minutos corridos, sem dois tempos.
- Cronometro definido sem opcao de pausa depois do inicio da partida.
- A contagem continua alem de 60:00 ate o administrador encerrar o jogo.
- Instagram oficial confirmado: https://www.instagram.com/unidosdorr/.
- Arquitetura aprovada com Next.js App Router, Supabase Auth/PostgreSQL/Realtime e Vercel.
- Direcao visual selecionada no companion: Dia de Jogo.
- Sequencia da homepage selecionada no companion: Jornada do Clube.
- Fluxo de operacao ao vivo selecionado no companion: Console Rapido.
- Modelo de dados, seguranca e funcionamento Realtime aprovados.
- Organizacao do site publico, rotas administrativas e estados da interface aprovados.
- Regras de integridade, testes e deploy aprovadas.
- Especificacao consolidada e aprovada em `docs/superpowers/specs/2026-07-16-unidos-do-rr-mvp-design.md`.
- Plano tecnico criado em `docs/superpowers/plans/2026-07-16-unidos-do-rr-mvp.md`.

### 2026-07-17

- Fundacao Supabase implementada com schema, integridade, Realtime, Storage e tipos TypeScript gerados.
- RLS e privilegios validados por 37 testes pgTAP; bootstrap administrativo validado localmente.

## Limitacoes aceitas no MVP

- Como todos usarao a mesma conta administrativa, o sistema nao conseguira atribuir cada alteracao a uma pessoa diferente.
- Contas individuais, papeis e trilha de auditoria por usuario ficam como evolucao posterior.

## Estado atual do MVP - 2026-07-17

### Implementado

- Homepage publica responsiva com identidade oficial, estado institucional, jogo ao vivo, placar, cronometro continuo, historico, retrospecto, elenco e estatisticas, classico, quatro kits, local e CTA oficial do Instagram.
- Agregacao publica consulta PostgreSQL pelo Supabase e recalcula placar/estatisticas a partir de eventos nao removidos e ajustes auditados.
- Supabase Realtime assina `matches` e `match_events`; um gol publicado no admin atualiza a homepage aberta sem recarregamento manual.
- Login real via Supabase Auth; `/admin` exige sessao e registro correspondente em `app_admins`.
- Painel responsivo com navegacao lateral no desktop e barra inferior no celular.
- Cadastro real de atletas, adversarios, rival principal, campos e partidas.
- Ciclo da partida via RPC: agendada -> ao vivo -> encerrada. O banco impede duas partidas simultaneamente ao vivo e impede reabrir partida encerrada.
- Console ao vivo grava gol do Unidos com autor/assistencia, gol do adversario e gol contra; remocao usa `deleted_at` e nunca apaga o evento.
- Cronometro persistente, sem pausa ou tempos, continua alem de 60:00 ate o encerramento.
- Edicao de bio, texto sobre o clube, localidade e Instagram.
- Ajustes auditados de gols, assistencias, vitorias, empates e derrotas com valor e motivo.
- Buckets publicos `players` e `opponents` preparados para imagens JPEG/PNG/WebP de ate 5 MB.
- Runtime definido como Node.js 22 ou superior para compatibilidade com a versao atual do Supabase.

### Validacao executada

- `pnpm test`: 2 arquivos e 5 testes aprovados.
- `pnpm db:test`: 37 testes pgTAP aprovados, incluindo schema, RLS e regras de ciclo da partida.
- `pnpm typecheck`: aprovado.
- `pnpm lint`: aprovado sem erros ou avisos.
- `pnpm build`: build de producao aprovado.
- Playwright: login, cadastro de atleta/adversario/campo/partida, inicio de jogo e publicacao de gol aprovados.
- Playwright em duas abas: placar publico alterou de `1x0` para `1x1` por Realtime.
- Viewports 390 px e 1440 px validados sem overflow horizontal, imagem quebrada ou erro de pagina.

### Variaveis de ambiente

Frontend e Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Bootstrap da conta unica, usado apenas no terminal/CI seguro:

```env
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no navegador ou em variavel com prefixo `NEXT_PUBLIC_`.

### Publicacao

1. Criar ou escolher um projeto Supabase.
2. Vincular o projeto com `supabase link --project-ref <ref>`.
3. Aplicar o schema com `supabase db push`.
4. Definir as quatro variaveis do bootstrap e executar `pnpm admin:create` uma vez.
5. Cadastrar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel.
6. Importar o repositorio na Vercel usando Node.js 22 e executar o deploy.
7. No primeiro acesso, cadastrar atletas, adversarios e campos reais; os nomes usados nos testes locais nao fazem parte da migration.

### Limitacoes conhecidas para a proxima iteracao

- Upload visual de foto do atleta e escudo do adversario ainda nao esta ligado aos formularios, embora Storage e politicas estejam prontos.
- Correcao de gol no MVP e feita removendo logicamente o evento e publicando o correto; edicao direta do mesmo evento pode ser adicionada depois.
- Cadastros permitem criar e arquivar atletas; edicao completa e arquivamento de adversarios/campos ainda podem ser ampliados.
- Nao ha contas individuais nem atribuicao de alteracoes por pessoa, conforme a decisao de conta compartilhada.

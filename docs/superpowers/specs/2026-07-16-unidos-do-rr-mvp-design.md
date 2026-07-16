# Unidos do RR - Especificacao de design do MVP

Data: 2026-07-16

Status: design aprovado em conversa; aguardando revisao final do documento pelo usuario.

## 1. Objetivo

Construir um MVP publicavel para o time de Fut7 Unidos do RR, do Rio Vermelho, Florianopolis. O produto tera um site publico responsivo, um painel administrativo protegido e atualizacoes de partida em tempo real.

O MVP precisa permitir que uma unica conta administrativa cadastre a operacao do clube e controle um jogo pelo celular. Visitantes devem acompanhar placar, cronometro e eventos sem recarregar a pagina.

## 2. Metas do MVP

- Publicar o site em producao na Vercel.
- Usar Node.js, Supabase PostgreSQL, Supabase Auth e Supabase Realtime.
- Entregar uma homepage completa e responsiva para mobile e desktop.
- Entregar um painel administrativo confortavel para uso ao lado do campo.
- Manter placar e estatisticas consistentes quando um evento for criado, corrigido ou removido.
- Versionar migrations, configuracao e documentacao para facilitar continuidade por outro agente.

## 3. Fora do escopo inicial

- Contas individuais e permissoes diferentes para cada membro do time.
- Auditoria que identifique qual amigo realizou cada alteracao usando a conta compartilhada.
- Servidor WebSocket proprio.
- Aplicativo mobile nativo.
- Notificacoes push.
- Cadastro administrativo de uniformes.
- Escalacao, banco de reservas e estatisticas de participacao por partida.
- Integracoes automaticas com Instagram ou plataformas esportivas.

## 4. Usuarios

### Visitante

Acompanha o time, elenco, estatisticas, partidas, classico, uniformes e local. Durante uma partida, ve placar, cronometro e autores dos gols em tempo real. Pode abrir o Instagram oficial para marcar amistoso.

### Administrador

Usa uma unica conta compartilhada do Supabase Auth. Cadastra atletas, partidas, adversarios, campos e rivais. Durante o jogo, inicia o cronometro, registra eventos, corrige lances e encerra a partida.

## 5. Arquitetura aprovada

- Aplicacao: Next.js com App Router e runtime Node.js.
- Hospedagem: Vercel.
- Banco: Supabase PostgreSQL.
- Autenticacao: Supabase Auth com uma conta administrativa.
- Tempo real: Supabase Realtime sobre alteracoes de `matches` e `match_events`.
- Estilos: Tailwind CSS e tokens CSS da identidade do clube.
- Componentes: componentes acessiveis e icones Lucide quando houver um simbolo conhecido.

O Next.js entrega o site publico e o painel em um unico projeto. Nao sera criado um servidor Socket.IO separado, porque conexoes persistentes nao combinam com o modelo serverless da Vercel e o Supabase ja oferece o canal necessario.

## 6. Estrutura de rotas

### Publico

- `/`: homepage completa com navegacao por secoes.
- Secoes ancoradas: inicio, sobre, jogos, elenco, classico, uniformes e contato.

O MVP nao precisa de paginas publicas separadas para cada secao. Componentes e consultas devem permitir a criacao dessas paginas no futuro sem reescrever o modelo de dados.

### Administrativo

- `/admin/login`: entrada da conta unica.
- `/admin`: visao geral, proxima partida e acesso ao jogo ativo.
- `/admin/jogos`: lista, criacao, edicao, detalhes e operacao de partidas.
- `/admin/elenco`: atletas e estatisticas.
- `/admin/cadastros`: adversarios, campos e rivais.
- `/admin/configuracoes`: conteudo institucional, Instagram e ajustes de estatisticas.

## 7. Homepage aprovada

Direcao visual: `Dia de Jogo`.

Sequencia: `Jornada do Clube`.

1. Cabecalho com escudo, navegacao e indicador de partida ao vivo.
2. Hero dinamico com jogo ao vivo, proximo jogo, ultimo resultado ou apresentacao institucional.
3. Resumo da temporada com vitorias, empates e derrotas.
4. Sobre o Unidos do RR e onde o time joga.
5. Ultimas partidas e acesso visual ao historico.
6. Elenco com nome, numero, posicao, gols e assistencias.
7. Classico Unidos do RR x Muito Paia FC.
8. Uniformes de jogador home/away e goleiro home/away.
9. Chamada para amistoso no Instagram.
10. Rodape com identidade e localidade.

Instagram oficial: `https://www.instagram.com/unidosdorr/`.

### Estados do hero

- `live`: placar, cronometro, adversario, campo e eventos recentes.
- `scheduled`: proximo adversario, data, horario e campo.
- `finished`: resultado final e autores dos gols.
- sem partida: escudo, frase `Unidos pelo bairro.` e ultimo resultado, quando existir.

Quando houver jogo ao vivo, esse estado sempre tem prioridade. Quando nao houver, a aplicacao procura a proxima partida agendada. Em seguida procura a ultima encerrada. Se nenhuma existir, mostra o estado institucional.

### Estatisticas publicas

- Gols e assistencias individuais incluem a partida atual.
- Vitorias, empates e derrotas do clube consideram apenas partidas encerradas.
- Gol contra nao credita gol ou assistencia a um atleta do Unidos.
- Historico e placar nunca devem ser hardcoded; derivam dos dados persistidos.

O valor inicial informado de `2 vitorias, 0 empates e 2 derrotas` deve ser representado por partidas historicas cadastradas ou por ajustes de baseline com motivo registrado. Os detalhes dessas quatro partidas ainda precisam ser fornecidos.

## 8. Direcao visual

### Identidade

- Personalidade: forte, urbana, competitiva, comunitaria, moderna e direta.
- Mensagem principal: `Unidos pelo bairro.`
- Base: `#030B14` e `#071626`.
- Superficie elevada: `#0D2033`.
- Destaque: `#C81018`.
- Texto principal: `#F7F7F4`.
- Texto secundario: `#AEB7C2`.
- Linhas e divisores: branco com aproximadamente 10% de opacidade.
- Cores de goleiro aparecem apenas na secao de uniformes e em materiais associados.

### Tipografia

- Titulos, numeros e placares: Barlow Condensed ExtraBold.
- Interface e textos: Inter.
- Titulos esportivos em caixa alta, sem letter spacing negativo.

### Composicao

- Primeira tela com escudo e estado da partida como sinais dominantes.
- Bandas horizontais de pagina em vez de secoes flutuantes dentro de cards.
- Cards apenas para itens repetidos, como atletas e partidas.
- Cantos discretos, ate 8 px.
- Vermelho reservado para estado ao vivo, acao principal e alertas importantes.
- Texturas e referencias ao bairro devem ter baixo contraste e nao reproduzir marcas comerciais.
- Usar `unidos-logo.png` como escudo oficial e `unidos-kit.png` como fonte visual dos quatro kits.

### Responsividade

- Mobile-first, com suporte de 320 px ate desktop amplo.
- Nenhum texto pode sobrepor outro elemento ou escapar do container.
- Placar, botoes de jogo e navegacao possuem dimensoes estaveis.
- Site publico usa cabecalho compacto e navegacao movel com no maximo cinco itens.
- Admin usa barra inferior com quatro areas no celular e barra lateral no desktop.
- Controles de partida devem ter alvos de toque de pelo menos 44 px.

## 9. Painel administrativo

### Dashboard

- Mostra partida ativa ou proxima partida.
- Atalhos para nova partida, novo atleta e cadastros.
- Indicadores simples de elenco, partidas e desempenho.

### Console Rapido

Fluxo aprovado para operacao durante o jogo:

- Placar e cronometro sempre visiveis.
- Botao principal `Gol do Unidos`.
- Acoes secundarias para gol adversario e gol contra.
- Ao tocar em gol do Unidos, abre um seletor inferior de autor e assistencia opcional.
- Gol contra solicita qual lado foi beneficiado e nao exige autor cadastrado.
- Linha do tempo de eventos em ordem decrescente.
- Menu de cada evento permite editar ou remover.
- Encerramento da partida fica em acao separada e exige confirmacao.

### CRUDs

- Atleta: nome, apelido opcional, numero, posicao, foto opcional e status ativo.
- Adversario: nome, escudo opcional e indicacao de rival.
- Campo: nome, endereco, link de mapa e indicacao de campo principal.
- Partida: adversario, campo, data, horario, mando, status e observacao opcional.
- Rival: configurado a partir de um adversario; o MVP permite destacar um rival principal para a secao do classico.

Registros ja referenciados por partidas ou eventos sao arquivados, nao excluidos fisicamente.

## 10. Modelo de dados

### `app_admins`

- `user_id uuid primary key` referenciando `auth.users`.
- `created_at timestamptz`.

O MVP tera apenas uma linha. A tabela evita depender de email hardcoded em policies.

### `players`

- `id uuid primary key`.
- `name text not null`.
- `nickname text null`.
- `shirt_number integer not null`.
- `position text not null`.
- `photo_url text null`.
- `is_active boolean not null default true`.
- `created_at`, `updated_at`.

Numero pode se repetir historicamente, mas nao entre atletas ativos. Essa regra deve ser aplicada por indice parcial.

### `opponents`

- `id uuid primary key`.
- `name text not null`.
- `crest_url text null`.
- `is_rival boolean not null default false`.
- `is_primary_rival boolean not null default false`.
- `rivalry_title text null`.
- `rivalry_description text null`.
- `is_active boolean not null default true`.
- `created_at`, `updated_at`.

Apenas um adversario pode ser o rival principal.

### `fields`

- `id uuid primary key`.
- `name text not null`.
- `address text not null`.
- `maps_url text null`.
- `is_primary boolean not null default false`.
- `is_active boolean not null default true`.
- `created_at`, `updated_at`.

### `matches`

- `id uuid primary key`.
- `opponent_id uuid not null`.
- `field_id uuid not null`.
- `scheduled_at timestamptz not null`.
- `status text`: `scheduled`, `live` ou `finished`.
- `is_home boolean not null default true`.
- `started_at timestamptz null`.
- `ended_at timestamptz null`.
- `notes text null`.
- `created_at`, `updated_at`.

Um indice parcial garante no maximo uma partida `live`.

### `match_events`

- `id uuid primary key`.
- `match_id uuid not null`.
- `event_type text not null default 'goal'`.
- `beneficiary text`: `unidos` ou `opponent`.
- `is_own_goal boolean not null default false`.
- `scorer_player_id uuid null`.
- `assist_player_id uuid null`.
- `minute_snapshot integer not null`.
- `occurred_at timestamptz not null`.
- `client_event_id uuid not null unique` para idempotencia.
- `deleted_at timestamptz null` para remocao auditavel.
- `created_at`, `updated_at`.

Regras:

- Gol normal do Unidos exige autor.
- Assistencia e opcional e deve ser diferente do autor.
- Gol adversario nao exige jogador cadastrado.
- Gol contra exige o lado beneficiado e nao credita estatistica individual.
- Eventos removidos nao entram no placar nem nas estatisticas.

### `stat_adjustments`

- `id uuid primary key`.
- `scope text`: `player` ou `club`.
- `player_id uuid null`.
- `metric text`: por exemplo `goals`, `assists`, `wins`, `draws` ou `losses`.
- `delta integer not null`.
- `reason text not null`.
- `created_at`.

### `club_settings`

Registro unico com:

- Nome, bio, frase institucional e texto sobre o time.
- Instagram e localidade.
- Campo principal opcional.
- Configuracoes de exibicao publicas.
- `updated_at`.

### Views e consultas derivadas

- Placar por partida soma eventos ativos por `beneficiary`.
- Estatisticas de atleta somam gols e assistencias validos mais ajustes.
- Resumo do clube compara placares de partidas encerradas e soma ajustes.
- Classico filtra partidas do rival principal.

## 11. Estados e regras da partida

Fluxo: `scheduled -> live -> finished`.

### Inicio

- Exige adversario, campo e data/hora.
- Exige confirmacao.
- Define `started_at` com horario do banco e muda status para `live`.
- Falha se ja existir outra partida ao vivo.

### Cronometro

- Periodo unico de 60 minutos corridos.
- Nao existe segundo tempo.
- Nao existe pausa depois do inicio.
- O valor e calculado por `agora - started_at`.
- Ao atingir `60:00`, continua em `60:01`, `60:02` e assim por diante.
- Recarregar ou trocar de dispositivo nao altera a contagem.

### Encerramento

- Exige confirmacao.
- Define `ended_at` e status `finished`.
- O cronometro congelado usa `ended_at - started_at`.
- Uma partida encerrada nao volta ao estado ao vivo no MVP.
- Eventos ainda podem ser corrigidos depois do encerramento.

## 12. Tempo real

1. A homepage busca a partida prioritaria no carregamento.
2. Se houver partida ao vivo, assina alteracoes da linha em `matches` e dos eventos correspondentes em `match_events`.
3. Ao receber mudanca, recalcula placar, eventos e estatisticas visiveis.
4. O cronometro roda localmente a partir de `started_at`, mas a referencia sempre vem do banco.
5. Ao reconectar, a pagina refaz a consulta completa antes de continuar.

O cliente administrativo gera `client_event_id` antes do envio. Enquanto a operacao estiver pendente, o botao fica desabilitado. Uma nova tentativa com o mesmo identificador nao cria evento duplicado.

## 13. Seguranca

- Visitantes anonimos podem ler apenas dados publicos necessarios ao site.
- Apenas usuarios autenticados presentes em `app_admins` podem inserir, atualizar ou arquivar dados.
- Policies RLS cobrem todas as tabelas expostas pelo Supabase.
- Service role nunca e enviado ao navegador.
- Rotas administrativas validam sessao no servidor e no cliente.
- Uploads de foto e escudo usam buckets com leitura publica e escrita administrativa.
- Senhas, tokens e chaves ficam em variaveis de ambiente e nunca no repositorio.

A conta compartilhada e uma limitacao aceita: nao sera possivel atribuir cada alteracao a uma pessoa diferente.

## 14. Integridade e tratamento de erros

- Apenas uma partida ao vivo por vez.
- Operacoes de evento devem ser idempotentes.
- Falhas de rede exibem estado claro e opcao de tentar novamente.
- Nenhum placar e incrementado apenas na memoria sem confirmacao do banco.
- Edicao ou remocao de evento recalcula placar e estatisticas.
- Ajustes manuais exigem motivo.
- Registros referenciados sao arquivados.
- Formularios validam campos no cliente e no servidor.
- Estados vazios explicam a proxima acao administrativa sem expor detalhes tecnicos.

## 15. Testes e verificacao

### Unidade

- Formatacao e calculo do cronometro antes, em e depois de `60:00`.
- Calculo de placar, gols, assistencias e retrospecto.
- Gol contra, evento removido e ajustes manuais.
- Selecao do estado correto do hero.

### Integracao

- Policies RLS para visitante e administrador.
- Restricao de uma partida ao vivo.
- Idempotencia de eventos.
- Correcao de evento e recalculo de dados.

### Interface e E2E

- Login.
- Cadastro de atleta, adversario e campo.
- Criacao e inicio de partida.
- Registro de gol com e sem assistencia.
- Gol adversario e gol contra.
- Correcao e remocao.
- Encerramento.
- Atualizacao do site publico sem recarregar.
- Capturas Playwright em mobile e desktop para evitar sobreposicao, overflow e canvas ou imagens vazias.

### Producao

- Lint, testes, verificacao de tipos e build devem passar.
- Preview da Vercel deve usar um projeto Supabase de desenvolvimento ou ambiente explicitamente isolado.
- Migrations devem subir em banco limpo sem passos manuais ocultos.

## 16. Deploy e operacao

- Repositorio conectado a Vercel.
- Variaveis publicas: URL e anon key do Supabase.
- Segredos administrativos usados apenas no ambiente servidor quando necessarios.
- Migrations SQL versionadas em `supabase/migrations`.
- Arquivo `.env.example` sem valores secretos.
- Instrucao documentada para criar o usuario no Supabase Auth e inserir seu UUID em `app_admins`.
- Dominio personalizado e analytics ficam opcionais para depois do primeiro deploy funcional.

## 17. Dados pendentes para publicacao

- Email da conta administrativa; a senha nao deve ser registrada em documentacao.
- Lista inicial de atletas, numeros e posicoes.
- Dados das quatro partidas que formam o retrospecto 2-0-2, ou confirmacao de baseline manual.
- Nome, endereco e link do campo principal.
- Escudos dos adversarios, quando disponiveis.
- Fotos do elenco, opcionais para o MVP.

Esses dados nao bloqueiam a implementacao porque poderao ser inseridos pelo painel.

## 18. Criterios de aceite

- Site e admin funcionam em mobile e desktop sem sobreposicoes.
- Visitante ve conteudo do clube e dados dinamicos vindos do Supabase.
- Conta nao autorizada nao consegue alterar dados.
- Administrador cria cadastros e uma partida completa.
- Cronometro continua corretamente apos recarga e alem de 60 minutos.
- Gol aparece no site publico em tempo real e atualiza estatisticas.
- Correcao ou remocao atualiza todos os dados derivados.
- Jogo encerrado congela o tempo e passa a contar no retrospecto.
- CTA abre `https://www.instagram.com/unidosdorr/`.
- Build de producao esta pronto para Vercel.

## 19. Decisoes registradas

- MVP publicavel em vez de sistema completo de primeira vez.
- Uma conta administrativa compartilhada.
- Next.js + Supabase + Vercel.
- Supabase Realtime em vez de servidor de sockets proprio.
- Homepage `Dia de Jogo` com sequencia `Jornada do Clube`.
- Admin `Console Rapido` mobile-first.
- Partida com 60 minutos corridos, sem intervalo e sem pausa.
- Cronometro continua depois de 60:00 ate encerramento manual.
- Estatisticas derivadas dos eventos, com ajustes auditaveis quando necessarios.

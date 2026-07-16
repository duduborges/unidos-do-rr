# Unidos do RR - Continuidade do projeto

Este documento registra o contexto, as decisoes e o estado do projeto para que o trabalho possa ser retomado por outro agente, inclusive Claude.

## Estado atual

- Fase: descoberta e definicao do MVP.
- Implementacao: ainda nao iniciada; aguardando revisao da especificacao escrita pelo usuario.
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
- Especificacao consolidada em `docs/superpowers/specs/2026-07-16-unidos-do-rr-mvp-design.md`.

## Limitacoes aceitas no MVP

- Como todos usarao a mesma conta administrativa, o sistema nao conseguira atribuir cada alteracao a uma pessoa diferente.
- Contas individuais, papeis e trilha de auditoria por usuario ficam como evolucao posterior.

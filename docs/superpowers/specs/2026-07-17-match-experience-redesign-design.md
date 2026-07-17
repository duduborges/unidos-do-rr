# Unidos do RR - Match Experience Redesign

## Objetivo

Elevar a experiencia publica do Unidos do RR com uma direcao Broadcast Tech, corrigir a faixa de estatisticas, transformar os kits em um carrossel 2.5D e ampliar o dominio de partidas para aceitar resultados historicos com detalhes publicos.

## Escopo

- Corrigir o alinhamento da visao geral da temporada em desktop e mobile.
- Criar um sistema consistente de movimento e profundidade para a home.
- Substituir a imagem unica dos uniformes por um carrossel 2.5D com quatro kits.
- Permitir cadastrar partidas agendadas ou ja realizadas no admin.
- Tornar autor, assistencia e minuto dos gols opcionais em partidas historicas.
- Criar a rota publica `/jogos/[id]` com placar, metadados e timeline.
- Validar acessibilidade, responsividade, performance e seguranca RLS.

Ficam fora desta rodada: modelos 3D reais, upload de modelos, replay em video e contas administrativas adicionais.

## Direcao Visual

A interface seguira uma estetica Broadcast Tech: fundos escuros, tipografia esportiva, vermelho usado como sinal, linhas de dados, texturas discretas e movimento curto. Elementos Cyber aparecem apenas no hero, placar ao vivo e palco dos kits. O resultado deve parecer uma transmissao esportiva moderna, nao um site gamer.

### Movimento

- Entradas escalonadas e curtas durante o scroll.
- Parallax leve no hero e em marcas d'agua.
- Feedback de hover direcional em partidas e atletas.
- Transicoes de placar e estados ao vivo.
- `prefers-reduced-motion` desativa parallax, autoplay e movimentos nao essenciais.
- Nenhuma animacao pode alterar dimensoes estaveis ou causar layout shift.

## Home Publica

### Visao Geral

A faixa sera uma grade estavel de quatro colunas: partidas, vitorias, empates e derrotas. Cada celula usa a mesma estrutura interna e alinha rotulo, numero e legenda independentemente do comprimento do texto. No mobile, a grade passa para duas colunas ou quatro celulas compactas sem esconder o total de partidas.

### Historico

Cada partida encerrada sera um link para `/jogos/[id]`. A linha mostra data, campo, adversario, placar e resultado. Hover e foco reforcam que o item e navegavel sem depender apenas de cor.

### Elenco E Classico

Os cards recebem profundidade, resposta ao ponteiro e entrada escalonada. A secao do classico ganha composicao de confronto mais forte, mantendo leitura e contraste.

## Carrossel De Kits

As imagens em `Kits/` serao publicadas como:

- `/kits/jogador-home.png`
- `/kits/jogador-away.png`
- `/kits/goleiro-home.png`
- `/kits/goleiro-away.png`

`embla-carousel-react` controla navegacao, arraste, teclado e snap. O slide ativo fica central, maior e frontal; os adjacentes recebem perspectiva, escala e opacidade reduzidas. O palco inclui nome, categoria, paleta, setas com icones, indicadores e autoplay pausavel. No mobile, permanece um kit por vez com arraste horizontal e controles acessiveis.

## Modelo De Partidas

### Placar Consolidado

Partidas encerradas terao placar final persistido no registro da partida. Isso permite cadastrar um jogo antigo sem inventar eventos. Partidas ao vivo continuam derivando o placar de `match_events`; ao encerrar, a funcao de dominio consolida o resultado final.

### Partidas Historicas

O admin oferece um controle segmentado:

- `Agendada`: adversario, campo, data/hora, mando e observacoes.
- `Ja realizada`: os mesmos dados, placar final obrigatorio e duracao padrao de 60 minutos.

Depois de salvar um jogo realizado, o admin pode adicionar detalhes opcionais dos gols. Um gol pode ter minuto e, quando for do Unidos, autor e assistencia opcionais. A ausencia desses dados nao altera o placar consolidado nem cria estatistica individual.

### Consistencia

- Resultado oficial e recorde do clube usam o placar consolidado da partida encerrada.
- Estatisticas de atletas usam apenas eventos com autor/assistencia identificados e ajustes manuais existentes.
- Eventos historicos nao podem elevar o total acima do placar final sem validacao.
- Alteracoes administrativas continuam protegidas por RLS e allowlist.

## Pagina De Detalhes

A rota `/jogos/[id]` apresenta:

- Estado da partida, data, horario, local e mando.
- Placar e adversario.
- Timeline cronologica de gols com minuto, autor e assistencia quando informados.
- Mensagem discreta quando o placar existe sem detalhamento completo.
- Observacoes da partida quando existirem.
- Navegacao para partida anterior e proxima.
- CTA para amistoso pelo Instagram.

Partidas inexistentes retornam `notFound()`. Falhas de consulta usam um estado de erro coerente com a identidade visual.

## Componentes E Dependencias

- `KitCarousel`: dados dos quatro kits, Embla, controles e estados de movimento.
- `MotionReveal`: entrada reutilizavel com reducao de movimento.
- `SeasonRecord`: faixa de estatisticas isolada e responsiva.
- `MatchHistoryForm`: cadastro de resultado passado.
- `HistoricalEventEditor`: detalhes opcionais apos o placar ser salvo.
- `MatchDetailPage`: consulta e composicao server-side da pagina publica.

Sera adicionada a dependencia `motion` para movimento declarativo e `embla-carousel-react` para o carrossel. Nenhum canvas ou Three.js sera usado nesta rodada.

## Banco E Migracao

Uma nova migration deve:

- Adicionar placar consolidado para partidas encerradas.
- Backfill dos jogos existentes a partir dos eventos ativos.
- Ajustar lifecycle para preservar data e duracao de jogos historicos autorizados.
- Permitir eventos historicos com minuto informado e autor opcional.
- Consolidar o placar ao encerrar uma partida ao vivo.
- Manter grants explicitos, RLS e validacoes administrativas.

A migration sera testada localmente antes de `db push`. O schema remoto so sera alterado depois dos testes pgTAP passarem.

## Testes E Aceite

- Testes unitarios para placar, recorde e estatisticas com eventos parciais.
- pgTAP para lifecycle historico, consolidacao, limites de eventos e RLS.
- Testes de componentes para alternancia do formulario e controles do carrossel.
- Teste da rota de detalhes com timeline completa, parcial e vazia.
- Playwright em 390 px e 1440 px para home, carrossel, admin e detalhes.
- Verificacao de overflow, layout shift, imagens quebradas e erros de console.
- Verificacao de `prefers-reduced-motion`.

## Criterios De Conclusao

- Faixa de estatisticas alinhada em todos os viewports testados.
- Quatro kits navegaveis por arraste, teclado, setas e indicadores.
- Jogo passado pode ser salvo apenas com placar e metadados basicos.
- Detalhes opcionais nao alteram indevidamente o placar oficial.
- Toda partida encerrada abre uma pagina publica funcional.
- Home permanece rapida, legivel e utilizavel com movimento reduzido.

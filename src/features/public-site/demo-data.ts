export const demoData = {
  liveMatch: {
    id: 'demo-live',
    opponent: 'Muito Paia FC',
    field: 'Arena Rio Vermelho',
    startedAt: new Date(Date.now() - 2292000).toISOString(),
    score: { unidos: 2, opponent: 1 },
  },
  record: { wins: 2, draws: 0, losses: 2 },
  players: [
    { id: '1', name: 'Gustavo Borges', nickname: 'Guga', number: 1, position: 'Goleiro', goals: 0, assists: 1 },
    { id: '2', name: 'Lucas Henrique', nickname: 'Luquinhas', number: 4, position: 'Fixo', goals: 1, assists: 2 },
    { id: '3', name: 'Rafael Martins', nickname: 'Rafa', number: 7, position: 'Ala', goals: 4, assists: 3 },
    { id: '4', name: 'Matheus Silva', nickname: 'Teteu', number: 10, position: 'Meia', goals: 6, assists: 4 },
    { id: '5', name: 'Bruno Costa', nickname: 'BC', number: 9, position: 'Pivo', goals: 5, assists: 1 },
    { id: '6', name: 'Joao Pedro', nickname: 'JP', number: 11, position: 'Ala', goals: 2, assists: 2 },
  ],
  matches: [
    { date: '12 JUL', opponent: 'Resenha FC', field: 'Arena Rio Vermelho', us: 4, them: 2, result: 'V' },
    { date: '05 JUL', opponent: 'Muito Paia FC', field: 'Floripa Soccer', us: 2, them: 3, result: 'D' },
    { date: '28 JUN', opponent: 'Real Norte', field: 'Arena Norte', us: 5, them: 1, result: 'V' },
    { date: '21 JUN', opponent: 'Familia Fut7', field: 'Arena Rio Vermelho', us: 1, them: 2, result: 'D' },
  ],
} as const

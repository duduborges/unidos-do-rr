export interface HomePlayer {
  id: string
  name: string
  nickname: string
  number: number
  position: string
  goals: number
  assists: number
}

export interface HomeMatch {
  id?: string
  date: string
  opponent: string
  field: string
  us: number
  them: number
  result: 'V' | 'E' | 'D'
}

export interface HomeData {
  liveMatch: {
    id: string
    opponent: string
    field: string
    startedAt: string
    score: { unidos: number; opponent: number }
  } | null
  record: { wins: number; draws: number; losses: number }
  players: HomePlayer[]
  matches: HomeMatch[]
  settings: {
    about: string
    locality: string
    instagramUrl: string
    mapsUrl: string
  }
  rivalry: {
    opponent: string
    title: string
    description: string
  }
}

export const demoData: HomeData = {
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
  settings: {
    about: 'Do Rio Vermelho para o campo. Somos um time de Fut7 criado entre amigos, movido pela comunidade e pela vontade de competir. Em cada partida levamos o orgulho do norte da ilha.',
    locality: 'Rio Vermelho · Florianópolis, Santa Catarina',
    instagramUrl: 'https://www.instagram.com/unidosdorr/',
    mapsUrl: 'https://maps.google.com/?q=Rio+Vermelho+Florianopolis',
  },
  rivalry: {
    opponent: 'Muito Paia FC',
    title: 'Rivalidade do bairro',
    description: 'Quando Unidos do RR e Muito Paia FC entram em campo, não existe amistoso. É o confronto que movimenta a resenha e decide quem manda no bairro.',
  },
}

export const emptyHomeData: HomeData = {
  ...demoData,
  liveMatch: null,
  record: { wins: 0, draws: 0, losses: 0 },
  players: [],
  matches: [],
}

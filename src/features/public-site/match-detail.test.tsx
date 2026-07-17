import { render, screen, within } from '@testing-library/react'
import { MatchDetail } from './match-detail'
import type { MatchDetail as MatchDetailData } from './match-detail-query'

function buildDetail(overrides: Partial<MatchDetailData> = {}): MatchDetailData {
  return {
    id: 'match-1',
    status: 'finished',
    scheduledAt: '2026-07-05T19:00:00Z',
    startedAt: '2026-07-05T19:00:00Z',
    endedAt: '2026-07-05T20:00:00Z',
    opponent: 'Muito Paia FC',
    field: 'Arena Rio Vermelho',
    address: 'Rua do Campo, 100',
    mapsUrl: 'https://maps.google.com/?q=arena',
    score: { unidos: 3, opponent: 2 },
    events: [],
    previous: null,
    next: null,
    ...overrides,
  }
}

it('renders a full timeline with scorer and assist', () => {
  render(<MatchDetail data={buildDetail({
    events: [{
      id: 'e1',
      type: 'goal',
      beneficiary: 'unidos',
      isOwnGoal: false,
      minute: 12,
      occurredAt: '2026-07-05T19:12:00Z',
      scorer: { id: 'p1', name: 'Rafael Martins', nickname: 'Rafa', shirtNumber: 7 },
      assist: { id: 'p2', name: 'Matheus Silva', nickname: 'Teteu', shirtNumber: 10 },
    }],
  })} />)

  const timeline = screen.getByRole('list', { name: /eventos da partida/i })
  expect(within(timeline).getByText(/rafa/i)).toBeInTheDocument()
  expect(within(timeline).getByText(/teteu/i)).toBeInTheDocument()
})

it('shows an informative note when the score is only partially detailed', () => {
  render(<MatchDetail data={buildDetail({
    score: { unidos: 3, opponent: 2 },
    events: [{
      id: 'e1', type: 'goal', beneficiary: 'unidos', isOwnGoal: false, minute: 10,
      occurredAt: '2026-07-05T19:10:00Z', scorer: null, assist: null,
    }],
  })} />)

  expect(screen.getByText(/nem todos os gols/i)).toBeInTheDocument()
})

it('renders an empty timeline state without events', () => {
  render(<MatchDetail data={buildDetail({ events: [] })} />)
  expect(screen.getByText(/sem lances detalhados/i)).toBeInTheDocument()
})

it('links to adjacent matches and the Instagram CTA', () => {
  render(<MatchDetail data={buildDetail({
    previous: { id: 'match-0', opponent: 'Resenha FC', date: '2026-06-28T19:00:00Z' },
    next: { id: 'match-2', opponent: 'Real Norte', date: '2026-07-12T19:00:00Z' },
  })} />)

  expect(screen.getByRole('link', { name: /resenha fc/i })).toHaveAttribute('href', '/jogos/match-0')
  expect(screen.getByRole('link', { name: /real norte/i })).toHaveAttribute('href', '/jogos/match-2')
  expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('href', 'https://www.instagram.com/unidosdorr/')
})

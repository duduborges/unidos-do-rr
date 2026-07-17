import { describe, expect, it } from 'vitest'
import { calculateClubRecord, calculatePlayerStats, calculateScore, formatMatchClock } from './domain'
import type { GoalEvent } from './types'

const events: GoalEvent[] = [
  { id: '1', beneficiary: 'unidos', isOwnGoal: false, scorerPlayerId: 'p10', assistPlayerId: 'p7', minute: 10, deletedAt: null },
  { id: '2', beneficiary: 'opponent', isOwnGoal: false, scorerPlayerId: null, assistPlayerId: null, minute: 20, deletedAt: null },
  { id: '3', beneficiary: 'unidos', isOwnGoal: true, scorerPlayerId: null, assistPlayerId: null, minute: 30, deletedAt: null },
  { id: '4', beneficiary: 'opponent', isOwnGoal: false, scorerPlayerId: null, assistPlayerId: null, minute: 40, deletedAt: '2026-07-16T21:00:00Z' },
]

describe('match domain', () => {
  it('keeps the continuous clock running beyond 60 minutes', () => {
    expect(formatMatchClock('2026-07-16T20:00:00Z', null, new Date('2026-07-16T21:01:02Z'))).toBe('61:02')
  })

  it('ignores removed events when calculating the score', () => {
    expect(calculateScore(events)).toEqual({ unidos: 2, opponent: 1 })
  })

  it('does not attribute own goals to players', () => {
    expect(calculatePlayerStats(events, [])).toEqual([
      { playerId: 'p10', goals: 1, assists: 0 },
      { playerId: 'p7', goals: 0, assists: 1 },
    ])
  })

  it('calculates the club record and audited adjustments', () => {
    expect(calculateClubRecord([
      { unidos: 4, opponent: 2 },
      { unidos: 2, opponent: 3 },
      { unidos: 5, opponent: 1 },
      { unidos: 1, opponent: 2 },
    ], [])).toEqual({ wins: 2, draws: 0, losses: 2 })
  })
})

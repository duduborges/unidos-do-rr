export type Beneficiary = 'unidos' | 'opponent'

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
export type MatchStatus = 'scheduled' | 'live' | 'finished'
export interface MatchScoreInput {
  status: MatchStatus
  scoreUnidos: number | null
  scoreOpponent: number | null
  events: GoalEvent[]
}
export interface ClubRecord { wins: number; draws: number; losses: number }
export interface PlayerStat { playerId: string; goals: number; assists: number }
export type StatMetric = 'goals' | 'assists' | 'wins' | 'draws' | 'losses'
export interface StatAdjustment {
  scope: 'player' | 'club'
  playerId: string | null
  metric: StatMetric
  delta: number
}

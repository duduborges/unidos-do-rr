import type { ClubRecord, GoalEvent, PlayerStat, Score, StatAdjustment } from './types'

export function formatMatchClock(startedAt: string, endedAt: string | null, now = new Date()) {
  const end = endedAt ? new Date(endedAt) : now
  const seconds = Math.max(0, Math.floor((end.getTime() - new Date(startedAt).getTime()) / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function calculateScore(events: GoalEvent[]): Score {
  return events.filter((event) => !event.deletedAt).reduce<Score>((score, event) => {
    score[event.beneficiary] += 1
    return score
  }, { unidos: 0, opponent: 0 })
}

export function calculatePlayerStats(events: GoalEvent[], adjustments: StatAdjustment[]): PlayerStat[] {
  const stats = new Map<string, PlayerStat>()
  const get = (id: string) => stats.get(id) ?? { playerId: id, goals: 0, assists: 0 }
  for (const event of events.filter((item) => !item.deletedAt && !item.isOwnGoal)) {
    if (event.scorerPlayerId) {
      const stat = get(event.scorerPlayerId)
      stat.goals += 1
      stats.set(stat.playerId, stat)
    }
    if (event.assistPlayerId) {
      const stat = get(event.assistPlayerId)
      stat.assists += 1
      stats.set(stat.playerId, stat)
    }
  }
  for (const adjustment of adjustments.filter((item) => item.scope === 'player' && item.playerId)) {
    const stat = get(adjustment.playerId!)
    if (adjustment.metric === 'goals' || adjustment.metric === 'assists') stat[adjustment.metric] += adjustment.delta
    stats.set(stat.playerId, stat)
  }
  return [...stats.values()]
}

export function calculateClubRecord(scores: Score[], adjustments: StatAdjustment[]): ClubRecord {
  const record = scores.reduce<ClubRecord>((value, score) => {
    if (score.unidos > score.opponent) value.wins += 1
    else if (score.unidos === score.opponent) value.draws += 1
    else value.losses += 1
    return value
  }, { wins: 0, draws: 0, losses: 0 })
  for (const adjustment of adjustments.filter((item) => item.scope === 'club')) {
    if (adjustment.metric === 'wins' || adjustment.metric === 'draws' || adjustment.metric === 'losses') {
      record[adjustment.metric] += adjustment.delta
    }
  }
  return record
}

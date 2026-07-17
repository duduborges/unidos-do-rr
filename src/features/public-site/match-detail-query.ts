import { resolveMatchScore } from '@/features/matches/domain'
import type { Beneficiary, GoalEvent, MatchStatus, Score } from '@/features/matches/types'
import { createClient } from '@/lib/supabase/server'

export interface MatchDetailPlayer {
  id: string
  name: string
  nickname: string | null
  shirtNumber: number
}

export interface MatchDetailEvent {
  id: string
  type: string
  beneficiary: Beneficiary
  isOwnGoal: boolean
  minute: number
  occurredAt: string
  scorer: MatchDetailPlayer | null
  assist: MatchDetailPlayer | null
}

export interface MatchNavigation {
  id: string
  opponent: string
  date: string
}

export interface MatchDetail {
  id: string
  status: MatchStatus
  scheduledAt: string
  startedAt: string | null
  endedAt: string | null
  opponent: string
  field: string
  address: string
  mapsUrl: string | null
  score: Score
  events: MatchDetailEvent[]
  previous: MatchNavigation | null
  next: MatchNavigation | null
}

export class MatchDetailQueryError extends Error {}

export async function getMatchDetail(id: string): Promise<MatchDetail | null> {
  const supabase = await createClient()
  const matchResult = await supabase
    .from('matches')
    .select(`
      id,
      status,
      scheduled_at,
      started_at,
      ended_at,
      score_unidos,
      score_opponent,
      opponent:opponents(name),
      field:fields(name, address, maps_url)
    `)
    .eq('id', id)
    .maybeSingle()

  if (matchResult.error) throw new MatchDetailQueryError(matchResult.error.message)
  const match = matchResult.data
  if (!match) return null

  const [eventsResult, previousResult, nextResult] = await Promise.all([
    supabase
      .from('match_events')
      .select(`
        id,
        event_type,
        beneficiary,
        is_own_goal,
        minute_snapshot,
        occurred_at,
        scorer:players!match_events_scorer_player_id_fkey(id, name, nickname, shirt_number),
        assist:players!match_events_assist_player_id_fkey(id, name, nickname, shirt_number)
      `)
      .eq('match_id', id)
      .is('deleted_at', null)
      .order('minute_snapshot', { ascending: true })
      .order('occurred_at', { ascending: true }),
    supabase
      .from('matches')
      .select('id, scheduled_at, opponent:opponents(name)')
      .lt('scheduled_at', match.scheduled_at)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('matches')
      .select('id, scheduled_at, opponent:opponents(name)')
      .gt('scheduled_at', match.scheduled_at)
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const failure = [eventsResult, previousResult, nextResult].find((result) => result.error)
  if (failure?.error) throw new MatchDetailQueryError(failure.error.message)

  const rawEvents = eventsResult.data ?? []
  const scoreEvents: GoalEvent[] = rawEvents.map((event) => ({
    id: event.id,
    beneficiary: event.beneficiary === 'opponent' ? 'opponent' : 'unidos',
    isOwnGoal: event.is_own_goal,
    scorerPlayerId: event.scorer?.id ?? null,
    assistPlayerId: event.assist?.id ?? null,
    minute: event.minute_snapshot,
    deletedAt: null,
  }))
  const toNavigation = (item: typeof previousResult.data): MatchNavigation | null => item ? {
    id: item.id,
    opponent: item.opponent?.name ?? 'Adversário',
    date: item.scheduled_at,
  } : null

  return {
    id: match.id,
    status: match.status as MatchStatus,
    scheduledAt: match.scheduled_at,
    startedAt: match.started_at,
    endedAt: match.ended_at,
    opponent: match.opponent?.name ?? 'Adversário',
    field: match.field?.name ?? 'Local a definir',
    address: match.field?.address ?? '',
    mapsUrl: match.field?.maps_url ?? null,
    score: resolveMatchScore({
      status: match.status as MatchStatus,
      scoreUnidos: match.score_unidos,
      scoreOpponent: match.score_opponent,
      events: scoreEvents,
    }),
    events: rawEvents.map((event) => ({
      id: event.id,
      type: event.event_type,
      beneficiary: event.beneficiary === 'opponent' ? 'opponent' : 'unidos',
      isOwnGoal: event.is_own_goal,
      minute: event.minute_snapshot,
      occurredAt: event.occurred_at,
      scorer: event.scorer ? {
        id: event.scorer.id,
        name: event.scorer.name,
        nickname: event.scorer.nickname,
        shirtNumber: event.scorer.shirt_number,
      } : null,
      assist: event.assist ? {
        id: event.assist.id,
        name: event.assist.name,
        nickname: event.assist.nickname,
        shirtNumber: event.assist.shirt_number,
      } : null,
    })),
    previous: toNavigation(previousResult.data),
    next: toNavigation(nextResult.data),
  }
}

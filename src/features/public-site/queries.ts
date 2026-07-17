import { calculateClubRecord, calculatePlayerStats, calculateScore } from '@/features/matches/domain'
import type { GoalEvent, StatAdjustment } from '@/features/matches/types'
import { createClient } from '@/lib/supabase/server'
import { emptyHomeData, type HomeData, type HomeMatch } from './demo-data'

export class HomeDataError extends Error {}

export async function getHomeData(): Promise<HomeData> {
  const supabase = await createClient()
  const [playersResult, matchesResult, eventsResult, adjustmentsResult, settingsResult, rivalResult, fieldResult] = await Promise.all([
    supabase.from('players').select('*').eq('is_active', true).order('shirt_number'),
    supabase.from('matches').select('*, opponents(name), fields(name)').order('scheduled_at', { ascending: false }),
    supabase.from('match_events').select('*').is('deleted_at', null),
    supabase.from('stat_adjustments').select('*'),
    supabase.from('club_settings').select('*').eq('id', true).maybeSingle(),
    supabase.from('opponents').select('*').eq('is_primary_rival', true).eq('is_active', true).maybeSingle(),
    supabase.from('fields').select('*').eq('is_primary', true).eq('is_active', true).maybeSingle(),
  ])

  const failure = [playersResult, matchesResult, eventsResult, adjustmentsResult, settingsResult, rivalResult, fieldResult].find((result) => result.error)
  if (failure?.error) throw new HomeDataError(failure.error.message)

  const rawEvents = eventsResult.data ?? []
  const events: GoalEvent[] = rawEvents.map((event) => ({
    id: event.id,
    beneficiary: event.beneficiary === 'opponent' ? 'opponent' : 'unidos',
    isOwnGoal: event.is_own_goal,
    scorerPlayerId: event.scorer_player_id,
    assistPlayerId: event.assist_player_id,
    minute: event.minute_snapshot,
    deletedAt: event.deleted_at,
  }))
  const adjustments: StatAdjustment[] = (adjustmentsResult.data ?? []).map((item) => ({
    scope: item.scope === 'club' ? 'club' : 'player',
    playerId: item.player_id,
    metric: item.metric as StatAdjustment['metric'],
    delta: item.delta,
  }))
  const stats = new Map(calculatePlayerStats(events, adjustments).map((item) => [item.playerId, item]))

  const matchScores = new Map<string, { unidos: number; opponent: number }>()
  for (const match of matchesResult.data ?? []) {
    matchScores.set(match.id, calculateScore(events.filter((event) => rawEvents.find((raw) => raw.id === event.id)?.match_id === match.id)))
  }

  const finished = (matchesResult.data ?? []).filter((match) => match.status === 'finished')
  const record = calculateClubRecord(
    finished.map((match) => matchScores.get(match.id) ?? { unidos: 0, opponent: 0 }),
    adjustments,
  )
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' })

  const recentMatches: HomeMatch[] = finished.slice(0, 8).map((match) => {
    const score = matchScores.get(match.id) ?? { unidos: 0, opponent: 0 }
    return {
      id: match.id,
      date: dateFormatter.format(new Date(match.scheduled_at)).replace('.', '').toUpperCase(),
      opponent: match.opponents?.name ?? 'Adversário',
      field: match.fields?.name ?? 'Local a definir',
      us: score.unidos,
      them: score.opponent,
      result: score.unidos > score.opponent ? 'V' : score.unidos === score.opponent ? 'E' : 'D',
    }
  })

  const live = (matchesResult.data ?? []).find((match) => match.status === 'live' && match.started_at)
  const settings = settingsResult.data
  const primaryField = fieldResult.data
  const rival = rivalResult.data

  return {
    liveMatch: live ? {
      id: live.id,
      opponent: live.opponents?.name ?? 'Adversário',
      field: live.fields?.name ?? 'Local a definir',
      startedAt: live.started_at!,
      score: matchScores.get(live.id) ?? { unidos: 0, opponent: 0 },
    } : null,
    record,
    players: (playersResult.data ?? []).map((player) => {
      const playerStats = stats.get(player.id)
      return {
        id: player.id,
        name: player.name,
        nickname: player.nickname || player.name.split(' ')[0],
        number: player.shirt_number,
        position: player.position,
        goals: playerStats?.goals ?? 0,
        assists: playerStats?.assists ?? 0,
      }
    }),
    matches: recentMatches,
    settings: {
      about: settings?.about_text ?? emptyHomeData.settings.about,
      locality: settings?.locality ?? emptyHomeData.settings.locality,
      instagramUrl: settings?.instagram_url ?? emptyHomeData.settings.instagramUrl,
      mapsUrl: primaryField?.maps_url ?? emptyHomeData.settings.mapsUrl,
    },
    rivalry: {
      opponent: rival?.name ?? 'Muito Paia FC',
      title: rival?.rival_title ?? 'Rivalidade do bairro',
      description: rival?.rival_description ?? emptyHomeData.rivalry.description,
    },
  }
}

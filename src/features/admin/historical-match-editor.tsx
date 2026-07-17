'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Goal, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

const MATCH_DURATION_MINUTES = 60

type EditorClient = Pick<ReturnType<typeof createClient>, 'from'>

interface Option {
  id: string
  name: string
}

interface HistoricalMatchEditorProps {
  opponents: Option[]
  fields: Option[]
  onSuccess: () => void
  client?: EditorClient
}

function toIsoRange(localValue: string) {
  const startedAt = new Date(localValue)
  const endedAt = new Date(startedAt.getTime() + MATCH_DURATION_MINUTES * 60 * 1000)
  return { startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString() }
}

function clampScore(value: string) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return 0
  return Math.min(99, Math.max(0, parsed))
}

export function HistoricalMatchEditor({ opponents, fields, onSuccess, client }: HistoricalMatchEditorProps) {
  const supabase = useMemo(() => client ?? createClient(), [client])
  const [opponentId, setOpponentId] = useState('')
  const [fieldId, setFieldId] = useState('')
  const [playedAt, setPlayedAt] = useState('')
  const [scoreUnidos, setScoreUnidos] = useState('0')
  const [scoreOpponent, setScoreOpponent] = useState('0')
  const [isHome, setIsHome] = useState(true)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!opponentId || !fieldId || !playedAt) {
      setMessage('Preencha adversário, campo e data.')
      return
    }
    setSaving(true)
    setMessage('')
    const { startedAt, endedAt } = toIsoRange(playedAt)
    const { error } = await supabase.from('matches').insert({
      opponent_id: opponentId,
      field_id: fieldId,
      scheduled_at: startedAt,
      status: 'finished',
      started_at: startedAt,
      ended_at: endedAt,
      score_unidos: clampScore(scoreUnidos),
      score_opponent: clampScore(scoreOpponent),
      is_home: isHome,
    })
    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setOpponentId('')
    setFieldId('')
    setPlayedAt('')
    setScoreUnidos('0')
    setScoreOpponent('0')
    setMessage('Partida registrada.')
    onSuccess()
  }

  return (
    <form className="manager-form historical-form" onSubmit={submit}>
      <label>Adversário
        <select value={opponentId} onChange={(event) => setOpponentId(event.target.value)} required>
          <option value="">Selecione</option>
          {opponents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label>Campo
        <select value={fieldId} onChange={(event) => setFieldId(event.target.value)} required>
          <option value="">Selecione</option>
          {fields.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label>Data e hora
        <input type="datetime-local" value={playedAt} onChange={(event) => setPlayedAt(event.target.value)} required />
      </label>
      <label>Gols do Unidos
        <input type="number" min={0} max={99} value={scoreUnidos} onChange={(event) => setScoreUnidos(event.target.value)} required />
      </label>
      <label>Gols do adversário
        <input type="number" min={0} max={99} value={scoreOpponent} onChange={(event) => setScoreOpponent(event.target.value)} required />
      </label>
      <label className="check-label">
        <input type="checkbox" checked={isHome} onChange={(event) => setIsHome(event.target.checked)} /> Mandante
      </label>
      <button disabled={saving || !opponents.length || !fields.length}><CalendarClock /> SALVAR RESULTADO</button>
      {message ? <p className="manager-message" role="status">{message}</p> : null}
    </form>
  )
}

type MatchEventRow = Database['public']['Tables']['match_events']['Row']
type PlayerOption = Pick<Database['public']['Tables']['players']['Row'], 'id' | 'name' | 'nickname' | 'shirt_number'>

interface HistoricalMatchEventsProps {
  match: { id: string; scoreUnidos: number; scoreOpponent: number }
  players: PlayerOption[]
  events: MatchEventRow[]
  onChange: () => void
  client?: EditorClient
}

export function HistoricalMatchEvents({ match, players, events, onChange, client }: HistoricalMatchEventsProps) {
  const supabase = useMemo(() => client ?? createClient(), [client])
  const [minute, setMinute] = useState('0')
  const [kind, setKind] = useState<'unidos' | 'opponent' | 'own'>('unidos')
  const [scorer, setScorer] = useState('')
  const [assist, setAssist] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const active = events.filter((event) => !event.deleted_at)
  const registered = active.reduce(
    (totals, event) => {
      totals[event.beneficiary === 'unidos' ? 'unidos' : 'opponent'] += 1
      return totals
    },
    { unidos: 0, opponent: 0 },
  )
  const remaining = {
    unidos: Math.max(0, match.scoreUnidos - registered.unidos),
    opponent: Math.max(0, match.scoreOpponent - registered.opponent),
  }
  const beneficiary = kind === 'opponent' ? 'opponent' : 'unidos'
  const blocked = remaining[beneficiary] === 0
  const byId = new Map(players.map((player) => [player.id, player]))

  async function addEvent() {
    if (blocked) {
      setMessage('O placar já está totalmente detalhado para esta equipe.')
      return
    }
    setSaving(true)
    setMessage('')
    const own = kind === 'own'
    const { error } = await supabase.from('match_events').insert({
      match_id: match.id,
      beneficiary,
      is_own_goal: own,
      scorer_player_id: own || kind === 'opponent' ? null : scorer || null,
      assist_player_id: own || kind === 'opponent' || !assist ? null : assist,
      minute_snapshot: clampScore(minute),
      client_event_id: crypto.randomUUID(),
    })
    setSaving(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setScorer('')
    setAssist('')
    setMessage('Lance adicionado.')
    onChange()
  }

  async function remove(id: string) {
    const { error } = await supabase.from('match_events').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    setMessage(error ? error.message : 'Lance removido.')
    if (!error) onChange()
  }

  return (
    <div className="historical-events">
      <div className="historical-balance">
        <span>SALDO A DETALHAR</span>
        <strong>Unidos {remaining.unidos}</strong>
        <strong>Adversário {remaining.opponent}</strong>
      </div>
      <div className="kind-control">
        <button type="button" className={kind === 'unidos' ? 'active' : ''} onClick={() => setKind('unidos')}>GOL UNIDOS</button>
        <button type="button" className={kind === 'opponent' ? 'active' : ''} onClick={() => setKind('opponent')}>GOL ADVERSÁRIO</button>
        <button type="button" className={kind === 'own' ? 'active' : ''} onClick={() => setKind('own')}>GOL CONTRA</button>
      </div>
      <div className="historical-inputs">
        <label>Minuto
          <input type="number" min={0} max={MATCH_DURATION_MINUTES} value={minute} onChange={(event) => setMinute(event.target.value)} />
        </label>
        {kind === 'unidos' && (
          <>
            <label>Autor
              <select value={scorer} onChange={(event) => { setScorer(event.target.value); if (assist === event.target.value) setAssist('') }}>
                <option value="">Sem autor</option>
                {players.map((item) => <option key={item.id} value={item.id}>#{item.shirt_number} · {item.nickname || item.name}</option>)}
              </select>
            </label>
            <label>Assistência
              <select value={assist} onChange={(event) => setAssist(event.target.value)}>
                <option value="">Sem assistência</option>
                {players.filter((item) => item.id !== scorer).map((item) => <option key={item.id} value={item.id}>#{item.shirt_number} · {item.nickname || item.name}</option>)}
              </select>
            </label>
          </>
        )}
      </div>
      <button type="button" className="confirm-goal" onClick={addEvent} disabled={saving || blocked}><Plus /> ADICIONAR LANCE</button>
      {message ? <p className="manager-message" role="status">{message}</p> : null}
      <div className="historical-timeline">
        {active.map((event) => {
          const author = event.scorer_player_id ? byId.get(event.scorer_player_id) : null
          return (
            <article key={event.id}>
              <span className={event.beneficiary === 'unidos' ? 'event-dot us' : 'event-dot'}><Goal /></span>
              <div>
                <strong>{event.is_own_goal ? 'Gol contra' : event.beneficiary === 'opponent' ? 'Gol do adversário' : `Gol · ${author?.nickname || author?.name || 'Sem autor'}`}</strong>
                <small>{event.minute_snapshot}&apos; de jogo</small>
              </div>
              <button type="button" aria-label="Remover lance" onClick={() => remove(event.id)}><Trash2 /></button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

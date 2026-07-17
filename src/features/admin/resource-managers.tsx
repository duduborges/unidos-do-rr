'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Goal, MapPin, Plus, Radio, Shield, Trash2, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { formatMatchClock } from '@/features/matches/domain'
import { HistoricalMatchEditor, HistoricalMatchEvents } from './historical-match-editor'

type Player = Database['public']['Tables']['players']['Row']
type Opponent = Database['public']['Tables']['opponents']['Row']
type Field = Database['public']['Tables']['fields']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & { opponents: { name: string } | null; fields: { name: string } | null }
type MatchEvent = Database['public']['Tables']['match_events']['Row']

function Message({ value }: { value: string }) {
  return value ? <p className="manager-message" role="status">{value}</p> : null
}

export function PlayerManager() {
  const supabase = useMemo(() => createClient(), [])
  const [players, setPlayers] = useState<Player[]>([])
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('players').select('*').order('is_active', { ascending: false }).order('shirt_number')
    if (error) setMessage(error.message)
    else setPlayers(data)
  }, [supabase])
  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id) }, [load])

  async function submit(formData: FormData) {
    setMessage('')
    const { error } = await supabase.from('players').insert({
      name: String(formData.get('name') ?? '').trim(),
      nickname: String(formData.get('nickname') ?? '').trim() || null,
      shirt_number: Number(formData.get('shirtNumber')),
      position: String(formData.get('position')),
    })
    setMessage(error ? error.code === '23505' ? 'Este número já está em uso.' : error.message : 'Atleta cadastrado.')
    if (!error) await load()
  }

  async function archive(id: string) {
    const { error } = await supabase.from('players').update({ is_active: false }).eq('id', id)
    setMessage(error ? error.message : 'Atleta arquivado.')
    if (!error) await load()
  }

  return <><ManagerHeading eyebrow="CADASTRO" title="ELENCO" text="Gerencie atletas e informações esportivas." />
    <form className="manager-form player-form" action={submit}>
      <label>Nome<input name="name" minLength={2} maxLength={80} required /></label>
      <label>Apelido<input name="nickname" maxLength={40} /></label>
      <label>Número<input name="shirtNumber" type="number" min={0} max={99} required /></label>
      <label>Posição<select name="position" required><option value="goleiro">Goleiro</option><option value="fixo">Fixo</option><option value="ala">Ala</option><option value="meia">Meia</option><option value="pivo">Pivô</option></select></label>
      <button><UserPlus /> CADASTRAR ATLETA</button>
    </form>
    <Message value={message} />
    <div className="admin-roster">{players.map((player) => <article key={player.id} className={!player.is_active ? 'archived' : ''}><div className="mini-number">{player.shirt_number}</div><div><strong>{player.name}</strong><small>{player.position} · #{player.shirt_number}</small></div><span>{player.is_active ? 'ATIVO' : 'ARQUIVADO'}</span>{player.is_active && <button aria-label={`Arquivar ${player.name}`} onClick={() => archive(player.id)}><Trash2 /></button>}</article>)}</div>
  </>
}

export function CatalogManager() {
  const supabase = useMemo(() => createClient(), [])
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    const [o, f] = await Promise.all([
      supabase.from('opponents').select('*').order('name'),
      supabase.from('fields').select('*').order('name'),
    ])
    if (o.error || f.error) setMessage(o.error?.message ?? f.error?.message ?? '')
    else { setOpponents(o.data); setFields(f.data) }
  }, [supabase])
  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id) }, [load])

  async function addOpponent(formData: FormData) {
    const primary = formData.get('isPrimaryRival') === 'on'
    if (primary) await supabase.from('opponents').update({ is_primary_rival: false }).eq('is_primary_rival', true)
    const { error } = await supabase.from('opponents').insert({
      name: String(formData.get('name') ?? '').trim(),
      is_rival: primary,
      is_primary_rival: primary,
      rival_title: primary ? 'Rivalidade do bairro' : null,
    })
    setMessage(error ? error.message : 'Adversário cadastrado.')
    if (!error) await load()
  }

  async function addField(formData: FormData) {
    const primary = formData.get('isPrimary') === 'on'
    if (primary) await supabase.from('fields').update({ is_primary: false }).eq('is_primary', true)
    const { error } = await supabase.from('fields').insert({
      name: String(formData.get('name') ?? '').trim(),
      address: String(formData.get('address') ?? '').trim(),
      maps_url: String(formData.get('mapsUrl') ?? '').trim() || null,
      is_primary: primary,
    })
    setMessage(error ? error.message : 'Campo cadastrado.')
    if (!error) await load()
  }

  return <><ManagerHeading eyebrow="CONFIGURAÇÃO" title="CADASTROS" text="Adversários, rivalidade e campos usados nas partidas." />
    <div className="manager-columns">
      <section className="manager-panel"><h2><Shield /> ADVERSÁRIOS</h2><form className="manager-form stacked" action={addOpponent}><label>Nome<input name="name" minLength={2} required /></label><label className="check-label"><input name="isPrimaryRival" type="checkbox" /> Definir como nosso clássico</label><button><Plus /> CADASTRAR</button></form><div className="compact-list">{opponents.map((item) => <div key={item.id}><strong>{item.name}</strong><small>{item.is_primary_rival ? 'NOSSO CLÁSSICO' : item.is_active ? 'ATIVO' : 'ARQUIVADO'}</small></div>)}</div></section>
      <section className="manager-panel"><h2><MapPin /> CAMPOS</h2><form className="manager-form stacked" action={addField}><label>Nome<input name="name" minLength={2} required /></label><label>Endereço<input name="address" minLength={5} required /></label><label>Link do mapa<input name="mapsUrl" type="url" /></label><label className="check-label"><input name="isPrimary" type="checkbox" /> Campo principal</label><button><Plus /> CADASTRAR</button></form><div className="compact-list">{fields.map((item) => <div key={item.id}><strong>{item.name}</strong><small>{item.is_primary ? 'CAMPO PRINCIPAL' : item.address}</small></div>)}</div></section>
    </div><Message value={message} />
  </>
}

export function MatchManager({ onLive }: { onLive: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [matches, setMatches] = useState<Match[]>([])
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'scheduled' | 'finished'>('scheduled')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailEvents, setDetailEvents] = useState<MatchEvent[]>([])
  const load = useCallback(async () => {
    const [m, o, f, p] = await Promise.all([
      supabase.from('matches').select('*, opponents(name), fields(name)').order('scheduled_at', { ascending: false }),
      supabase.from('opponents').select('*').eq('is_active', true).order('name'),
      supabase.from('fields').select('*').eq('is_active', true).order('name'),
      supabase.from('players').select('*').eq('is_active', true).order('shirt_number'),
    ])
    if (m.error || o.error || f.error || p.error) setMessage(m.error?.message ?? o.error?.message ?? f.error?.message ?? p.error?.message ?? '')
    else { setMatches(m.data); setOpponents(o.data); setFields(f.data); setPlayers(p.data) }
  }, [supabase])
  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id) }, [load])

  const loadDetail = useCallback(async (matchId: string) => {
    const { data, error } = await supabase.from('match_events').select('*').eq('match_id', matchId).order('minute_snapshot', { ascending: true })
    if (error) setMessage(error.message)
    else setDetailEvents(data)
  }, [supabase])

  async function openDetail(matchId: string) {
    if (detailId === matchId) { setDetailId(null); return }
    setDetailId(matchId)
    await loadDetail(matchId)
  }

  async function create(formData: FormData) {
    const scheduled = String(formData.get('scheduledAt') ?? '')
    const { error } = await supabase.from('matches').insert({
      opponent_id: String(formData.get('opponentId')),
      field_id: String(formData.get('fieldId')),
      scheduled_at: new Date(scheduled).toISOString(),
      is_home: formData.get('isHome') === 'on',
      notes: String(formData.get('notes') ?? '').trim() || null,
    })
    setMessage(error ? error.message : 'Partida cadastrada.')
    if (!error) await load()
  }

  async function start(id: string) {
    const { error } = await supabase.rpc('start_match', { p_match_id: id })
    setMessage(error ? error.code === '23505' ? 'Já existe uma partida ao vivo.' : error.message : 'Partida iniciada.')
    if (!error) { await load(); onLive() }
  }

  const detailMatch = detailId ? matches.find((match) => match.id === detailId) : null
  const canRegister = Boolean(opponents.length && fields.length)

  return <><ManagerHeading eyebrow="TEMPORADA 2026" title="PARTIDAS" text="Agende jogos, inicie o relógio e cadastre resultados passados." />
    <div className="segmented" role="tablist" aria-label="Tipo de cadastro">
      <button role="tab" aria-selected={mode === 'scheduled'} className={mode === 'scheduled' ? 'active' : ''} onClick={() => setMode('scheduled')}>AGENDADA</button>
      <button role="tab" aria-selected={mode === 'finished'} className={mode === 'finished' ? 'active' : ''} onClick={() => setMode('finished')}>JÁ REALIZADA</button>
    </div>
    {mode === 'scheduled' ? <form className="manager-form match-form" action={create}>
      <label>Adversário<select name="opponentId" required><option value="">Selecione</option>{opponents.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Campo<select name="fieldId" required><option value="">Selecione</option>{fields.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Data e hora<input name="scheduledAt" type="datetime-local" required /></label>
      <label className="check-label"><input name="isHome" type="checkbox" defaultChecked /> Mandante</label>
      <label>Observações<input name="notes" maxLength={500} /></label>
      <button disabled={!canRegister}><CalendarDays /> CADASTRAR PARTIDA</button>
    </form> : <HistoricalMatchEditor opponents={opponents.map((item) => ({ id: item.id, name: item.name }))} fields={fields.map((item) => ({ id: item.id, name: item.name }))} onSuccess={load} />}
    {!canRegister ? <p className="manager-message">Cadastre ao menos um adversário e um campo primeiro.</p> : null}
    <Message value={message} />
    <div className="resource-table">{matches.map((match) => <div className={`resource-row ${match.status === 'live' ? 'live-row' : ''}`} key={match.id}><span>{match.status === 'live' ? '● AO VIVO' : match.status === 'finished' ? 'ENCERRADO' : 'AGENDADO'}</span><strong>{match.opponents?.name}</strong><small>{new Date(match.scheduled_at).toLocaleString('pt-BR')} · {match.fields?.name}</small>{match.status === 'scheduled' ? <button onClick={() => start(match.id)}>INICIAR</button> : match.status === 'live' ? <button onClick={onLive}>CONSOLE</button> : <button className={detailId === match.id ? 'active' : ''} onClick={() => openDetail(match.id)}>DETALHES</button>}</div>)}</div>
    {detailMatch && detailMatch.score_unidos !== null && detailMatch.score_opponent !== null ? <section className="detail-panel"><div className="detail-panel-head"><h2>{detailMatch.opponents?.name} · {detailMatch.score_unidos} × {detailMatch.score_opponent}</h2><small>Detalhe os gols desta partida (opcional).</small></div><HistoricalMatchEvents match={{ id: detailMatch.id, scoreUnidos: detailMatch.score_unidos, scoreOpponent: detailMatch.score_opponent }} players={players} events={detailEvents} onChange={() => loadDetail(detailMatch.id)} /></section> : null}
  </>
}

export function RealLiveConsole({ onGames }: { onGames: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [match, setMatch] = useState<Match | null>(null)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [kind, setKind] = useState<'unidos' | 'opponent' | 'own'>('unidos')
  const [scorer, setScorer] = useState('')
  const [assist, setAssist] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const [m, p] = await Promise.all([
      supabase.from('matches').select('*, opponents(name), fields(name)').eq('status', 'live').maybeSingle(),
      supabase.from('players').select('*').eq('is_active', true).order('shirt_number'),
    ])
    if (m.error || p.error) { setMessage(m.error?.message ?? p.error?.message ?? ''); return }
    setMatch(m.data); setPlayers(p.data)
    if (m.data) {
      const e = await supabase.from('match_events').select('*').eq('match_id', m.data.id).is('deleted_at', null).order('occurred_at', { ascending: false })
      if (e.error) setMessage(e.error.message)
      else setEvents(e.data)
    } else setEvents([])
  }, [supabase])
  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id) }, [load])
  useEffect(() => {
    if (!match) return
    const channel = supabase.channel(`admin-live:${match.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${match.id}` }, () => void load())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${match.id}` }, () => void load())
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [load, match, supabase])

  const score = events.reduce((value, event) => { value[event.beneficiary === 'unidos' ? 'unidos' : 'opponent'] += 1; return value }, { unidos: 0, opponent: 0 })
  const byId = new Map(players.map((player) => [player.id, player]))

  async function addGoal() {
    if (!match) return
    if (kind === 'unidos' && !scorer) { setMessage('Selecione quem marcou.'); return }
    const own = kind === 'own'
    const { error } = await supabase.from('match_events').insert({
      match_id: match.id,
      beneficiary: kind === 'unidos' ? 'unidos' : 'opponent',
      is_own_goal: own,
      scorer_player_id: own || kind === 'opponent' ? null : scorer,
      assist_player_id: own || kind === 'opponent' || !assist ? null : assist,
      minute_snapshot: 0,
      client_event_id: crypto.randomUUID(),
    })
    setMessage(error ? error.message : 'Gol publicado em tempo real.')
    if (!error) { setScorer(''); setAssist(''); await load() }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('match_events').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    setMessage(error ? error.message : 'Gol removido.')
    if (!error) await load()
  }

  async function finish() {
    if (!match || !window.confirm('Encerrar a partida? O relógio será congelado.')) return
    const { error } = await supabase.rpc('finish_match', { p_match_id: match.id })
    setMessage(error ? error.message : 'Partida encerrada.')
    if (!error) await load()
  }

  if (!match) return <div className="live-empty"><Radio /><h1>NENHUM JOGO AO VIVO</h1><p>Inicie uma partida cadastrada para abrir o console.</p><button onClick={onGames}>IR PARA PARTIDAS</button></div>

  return <div className="real-console">
    <div className="console-heading"><button className="back-link" onClick={onGames}>← Partidas</button><span><i /> AO VIVO · {match.started_at && <ClockValue startedAt={match.started_at} />}</span></div>
    <section className="console-score"><div><strong>UNIDOS DO RR</strong></div><span>{score.unidos}<b>×</b>{score.opponent}</span><div><Shield /><strong>{match.opponents?.name}</strong></div></section>
    <section className="live-entry">
      <div className="kind-control"><button className={kind === 'unidos' ? 'active' : ''} onClick={() => setKind('unidos')}>GOL UNIDOS</button><button className={kind === 'opponent' ? 'active' : ''} onClick={() => setKind('opponent')}>GOL ADVERSÁRIO</button><button className={kind === 'own' ? 'active' : ''} onClick={() => setKind('own')}>GOL CONTRA</button></div>
      {kind === 'unidos' && <div className="goal-selects"><label>Autor<select value={scorer} onChange={(event) => { setScorer(event.target.value); if (assist === event.target.value) setAssist('') }}><option value="">Selecione</option>{players.map((item) => <option value={item.id} key={item.id}>#{item.shirt_number} · {item.nickname || item.name}</option>)}</select></label><label>Assistência<select value={assist} onChange={(event) => setAssist(event.target.value)}><option value="">Sem assistência</option>{players.filter((item) => item.id !== scorer).map((item) => <option value={item.id} key={item.id}>#{item.shirt_number} · {item.nickname || item.name}</option>)}</select></label></div>}
      <button className="confirm-goal" onClick={addGoal}><Goal /> PUBLICAR GOL</button>
    </section>
    <Message value={message} />
    <section className="timeline"><div className="timeline-head"><h2>EVENTOS DA PARTIDA</h2><span>{events.length} gols</span></div>{events.map((event) => { const author = event.scorer_player_id ? byId.get(event.scorer_player_id) : null; const helper = event.assist_player_id ? byId.get(event.assist_player_id) : null; return <article key={event.id}><span className={event.beneficiary === 'unidos' ? 'event-dot us' : 'event-dot'}><Goal /></span><div><strong>{event.is_own_goal ? 'Gol contra' : event.beneficiary === 'opponent' ? `Gol · ${match.opponents?.name}` : `Gol · ${author?.nickname || author?.name}`}</strong><small>{helper ? `Assistência: ${helper.nickname || helper.name}` : 'Sem assistência'}</small></div><time>{event.minute_snapshot}&apos;</time><button aria-label="Remover gol" onClick={() => remove(event.id)}><Trash2 /></button></article> })}</section>
    <button className="finish-game" onClick={finish}>ENCERRAR PARTIDA</button>
  </div>
}


export function AdminDashboard({ onLive, onGames, onRoster, onCatalog }: { onLive: () => void; onGames: () => void; onRoster: () => void; onCatalog: () => void }) {
  const supabase = useMemo(() => createClient(), [])
  const [live, setLive] = useState<Match | null>(null)
  const [next, setNext] = useState<Match | null>(null)
  const [events, setEvents] = useState<MatchEvent[]>([])

  const load = useCallback(async () => {
    const [liveResult, nextResult] = await Promise.all([
      supabase.from('matches').select('*, opponents(name), fields(name)').eq('status', 'live').maybeSingle(),
      supabase.from('matches').select('*, opponents(name), fields(name)').eq('status', 'scheduled').order('scheduled_at').limit(1).maybeSingle(),
    ])
    setLive(liveResult.data)
    setNext(nextResult.data)
    if (liveResult.data) {
      const result = await supabase.from('match_events').select('*').eq('match_id', liveResult.data.id).is('deleted_at', null)
      setEvents(result.data ?? [])
    } else setEvents([])
  }, [supabase])
  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id) }, [load])

  const score = events.reduce((value, event) => {
    value[event.beneficiary === 'unidos' ? 'unidos' : 'opponent'] += 1
    return value
  }, { unidos: 0, opponent: 0 })

  return <><div className="page-heading"><div><span className="admin-eyebrow">UNIDOS DO RR</span><h1>VISÃO GERAL</h1><p>Acompanhe o time e opere a próxima partida.</p></div><button className="primary-action" onClick={onGames}><Plus /> NOVA PARTIDA</button></div>
    {live ? <section className="dashboard-live"><div className="dash-live-head"><span><i /> PARTIDA EM ANDAMENTO</span><strong>{live.started_at && <ClockValue startedAt={live.started_at} />}</strong></div><div className="dash-score"><div><strong>UNIDOS DO RR</strong></div><span>{score.unidos}<b>×</b>{score.opponent}</span><div><Shield /><strong>{live.opponents?.name}</strong></div></div><div className="dash-live-foot"><span><MapPin /> {live.fields?.name}</span><button onClick={onLive}><Radio /> ABRIR CONSOLE AO VIVO</button></div></section> : <section className="dashboard-empty"><Radio /><div><strong>NENHUM JOGO AO VIVO</strong><p>Inicie uma partida para publicar o placar em tempo real.</p></div><button onClick={onGames}>VER PARTIDAS</button></section>}
    <div className="admin-grid"><section><div className="panel-title"><div><small>PRÓXIMA PARTIDA</small><h2>{next ? new Date(next.scheduled_at).toLocaleDateString('pt-BR') : 'AGENDA LIVRE'}</h2></div><CalendarDays /></div><div className="next-game">{next ? <><div><b>{new Date(next.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</b><span>{next.fields?.name}</span></div><strong>UNIDOS DO RR <i>×</i> {next.opponents?.name}</strong></> : <p>Cadastre a próxima partida.</p>}</div></section><section><div className="panel-title"><div><small>ATALHOS</small><h2>GERENCIAR</h2></div></div><div className="quick-links"><button onClick={onRoster}><UserPlus /> Cadastrar atleta</button><button onClick={onGames}><CalendarDays /> Cadastrar partida</button><button onClick={onCatalog}><Shield /> Adversários e campos</button></div></section></div>
  </>
}

function ClockValue({ startedAt }: { startedAt: string }) {
  const [value, setValue] = useState('0:00')
  useEffect(() => {
    const tick = () => setValue(formatMatchClock(startedAt, null))
    tick(); const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])
  return <span suppressHydrationWarning>{value}</span>
}

function ManagerHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="page-heading"><div><span className="admin-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div></div>
}

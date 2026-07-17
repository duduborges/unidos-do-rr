'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ChevronRight, CircleDot, Clock3, Goal, House, LogOut, MapPin, Menu, MoreHorizontal, Pencil, Plus, Radio, RotateCcw, Settings, Shield, Trash2, UserPlus, Users, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { demoData } from '@/features/public-site/demo-data'
import { formatMatchClock } from '@/features/matches/domain'
import './admin.css'

type View = 'inicio' | 'jogos' | 'elenco' | 'mais' | 'ao-vivo'
type GoalKind = 'unidos' | 'opponent' | 'own'
type Event = { id: string; beneficiary: 'unidos' | 'opponent'; label: string; detail: string; minute: number }

function Clock({ startedAt }: { startedAt: string }) {
  const [value, setValue] = useState('38:12')
  useEffect(() => {
    const id = window.setInterval(() => setValue(formatMatchClock(startedAt, null)), 1000)
    return () => window.clearInterval(id)
  }, [startedAt])
  return <span suppressHydrationWarning>{value}</span>
}

export function AdminApp() {
  const [view, setView] = useState<View>('inicio')
  const [sheet, setSheet] = useState<GoalKind | null>(null)
  const [scorer, setScorer] = useState('')
  const [assist, setAssist] = useState('')
  const [notice, setNotice] = useState('')
  const [events, setEvents] = useState<Event[]>([
    { id: 'e3', beneficiary: 'opponent', label: 'Gol · Muito Paia FC', detail: 'Gol do adversário', minute: 31 },
    { id: 'e2', beneficiary: 'unidos', label: 'Gol · Teteu #10', detail: 'Assistência: Rafa #7', minute: 24 },
    { id: 'e1', beneficiary: 'unidos', label: 'Gol · Rafa #7', detail: 'Sem assistência', minute: 12 },
  ])
  const score = useMemo(() => events.reduce((value, event) => {
    value[event.beneficiary] += 1
    return value
  }, { unidos: 0, opponent: 0 }), [events])

  function addGoal() {
    if (sheet === 'unidos' && !scorer) return setNotice('Selecione quem marcou.')
    const player = demoData.players.find((item) => item.id === scorer)
    const assister = demoData.players.find((item) => item.id === assist)
    const beneficiary = sheet === 'opponent' ? 'opponent' : sheet === 'own' ? 'opponent' : 'unidos'
    const label = sheet === 'opponent' ? 'Gol · Muito Paia FC' : sheet === 'own' ? 'Gol contra · Unidos do RR' : `Gol · ${player?.nickname} #${player?.number}`
    setEvents([{ id: crypto.randomUUID(), beneficiary, label, detail: assister ? `Assistência: ${assister.nickname} #${assister.number}` : sheet === 'own' ? 'Gol contra' : 'Sem assistência', minute: 39 }, ...events])
    setNotice('Gol registrado e publicado.')
    setScorer(''); setAssist(''); setSheet(null)
  }

  return <div className="admin-app">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand"><Image src="/brand/unidos-logo.png" alt="" width={50} height={58} /><span><strong>UNIDOS DO RR</strong><small>ADMINISTRAÇÃO</small></span></Link>
      <nav>{[
        ['inicio', House, 'Início'], ['jogos', CalendarDays, 'Jogos'], ['elenco', Users, 'Elenco'], ['mais', Menu, 'Cadastros'],
      ].map(([id, Icon, label]) => <button key={String(id)} className={view === id ? 'active' : ''} onClick={() => setView(id as View)}><Icon size={19} /> {String(label)}</button>)}</nav>
      <div className="side-live"><span><i /> JOGO AO VIVO</span><strong>Unidos  {score.unidos} × {score.opponent}  Muito Paia</strong><button onClick={() => setView('ao-vivo')}>ABRIR CONSOLE <ChevronRight size={16} /></button></div>
      <Link href="/admin/login" className="logout"><LogOut size={18} /> Sair</Link>
    </aside>

    <div className="admin-main">
      <header className="admin-topbar"><div><small>UNIDOS DO RR</small><strong>{view === 'ao-vivo' ? 'Console ao vivo' : view === 'inicio' ? 'Visão geral' : view === 'jogos' ? 'Partidas' : view === 'elenco' ? 'Elenco' : 'Cadastros'}</strong></div><div className="admin-avatar">RR</div></header>
      <main className="admin-content">
        {view === 'inicio' && <Dashboard score={score} onConsole={() => setView('ao-vivo')} onView={setView} />}
        {view === 'ao-vivo' && <LiveConsole score={score} events={events} setEvents={setEvents} onGoal={setSheet} startedAt={demoData.liveMatch.startedAt} />}
        {view === 'jogos' && <GamesView onConsole={() => setView('ao-vivo')} />}
        {view === 'elenco' && <RosterView />}
        {view === 'mais' && <ResourcesView />}
      </main>
    </div>

    <nav className="admin-bottom">{[
      ['inicio', House, 'Início'], ['jogos', CalendarDays, 'Jogos'], ['elenco', Users, 'Elenco'], ['mais', Menu, 'Mais'],
    ].map(([id, Icon, label]) => <button key={String(id)} className={view === id ? 'active' : ''} onClick={() => setView(id as View)}><Icon size={21} /><span>{String(label)}</span></button>)}</nav>

    {sheet && <div className="goal-overlay" role="dialog" aria-modal="true" aria-label="Adicionar gol"><div className="goal-sheet">
      <div className="sheet-head"><div><small>NOVO EVENTO</small><h2>{sheet === 'unidos' ? 'Gol do Unidos' : sheet === 'opponent' ? 'Gol do adversário' : 'Gol contra'}</h2></div><button onClick={() => setSheet(null)} aria-label="Fechar"><X /></button></div>
      {sheet === 'unidos' && <><label>QUEM MARCOU?</label><div className="player-options">{demoData.players.filter((p) => p.position !== 'Goleiro').map((p) => <button className={scorer === p.id ? 'selected' : ''} onClick={() => { setScorer(p.id); if (assist === p.id) setAssist('') }} key={p.id}><b>{p.number}</b><span>{p.nickname}<small>{p.position}</small></span></button>)}</div>
      <label>ASSISTÊNCIA <span>OPCIONAL</span></label><select value={assist} onChange={(event) => setAssist(event.target.value)}><option value="">Sem assistência</option>{demoData.players.filter((p) => p.id !== scorer).map((p) => <option key={p.id} value={p.id}>{p.number} · {p.nickname}</option>)}</select></>}
      {sheet !== 'unidos' && <div className="sheet-confirm"><Shield /><p>{sheet === 'opponent' ? 'O gol será somado ao placar do Muito Paia FC.' : 'O gol contra será somado ao adversário e não contará nas estatísticas individuais.'}</p></div>}
      {notice && <p className="form-notice" role="status">{notice}</p>}
      <button className="confirm-goal" onClick={addGoal}><Goal /> CONFIRMAR GOL</button>
    </div></div>}
    <div className="sr-status" aria-live="polite">{notice}</div>
  </div>
}

function Dashboard({ score, onConsole, onView }: { score: { unidos: number; opponent: number }; onConsole: () => void; onView: (v: View) => void }) {
  return <><div className="page-heading"><div><span className="admin-eyebrow">SEXTA, 17 DE JULHO</span><h1>BOA NOITE.</h1><p>Acompanhe o que está acontecendo com o time.</p></div><button className="primary-action" onClick={() => onView('jogos')}><Plus size={18} /> NOVA PARTIDA</button></div>
    <section className="dashboard-live"><div className="dash-live-head"><span><i /> PARTIDA EM ANDAMENTO</span><strong><Clock3 size={17} /><Clock startedAt={demoData.liveMatch.startedAt} /></strong></div><div className="dash-score"><div><Image src="/brand/unidos-logo.png" alt="" width={58} height={66} /><strong>UNIDOS DO RR</strong></div><span>{score.unidos}<b>×</b>{score.opponent}</span><div><Shield /><strong>MUITO PAIA FC</strong></div></div><div className="dash-live-foot"><span><MapPin size={15} /> Arena Rio Vermelho</span><button onClick={onConsole}><Radio size={17} /> ABRIR CONSOLE AO VIVO</button></div></section>
    <div className="admin-grid"><section><div className="panel-title"><div><small>PRÓXIMA PARTIDA</small><h2>SÁBADO, 25 JUL</h2></div><CalendarDays /></div><div className="next-game"><div><b>20:00</b><span>ARENA RIO VERMELHO</span></div><strong>UNIDOS DO RR <i>×</i> RESENHA FC</strong></div></section><section><div className="panel-title"><div><small>ATALHOS</small><h2>GERENCIAR</h2></div></div><div className="quick-links"><button onClick={() => onView('elenco')}><UserPlus /> Cadastrar atleta <ChevronRight /></button><button onClick={() => onView('jogos')}><CalendarDays /> Cadastrar partida <ChevronRight /></button><button onClick={() => onView('mais')}><Shield /> Adversários e campos <ChevronRight /></button></div></section></div>
  </>
}

function LiveConsole({ score, events, setEvents, onGoal, startedAt }: { score: { unidos: number; opponent: number }; events: Event[]; setEvents: (v: Event[]) => void; onGoal: (v: GoalKind) => void; startedAt: string }) {
  return <div className="console-wrap"><div className="console-heading"><button className="back-link" onClick={() => history.back()}>← Voltar</button><span><i /> AO VIVO · <Clock startedAt={startedAt} /></span></div>
    <section className="console-score"><div><Image src="/brand/unidos-logo.png" alt="" width={66} height={75} /><strong>UNIDOS DO RR</strong></div><span>{score.unidos}<b>×</b>{score.opponent}</span><div><Shield /><strong>MUITO PAIA FC</strong></div></section>
    <div className="goal-actions"><button className="main-goal" onClick={() => onGoal('unidos')}><Goal /> GOL DO UNIDOS</button><button onClick={() => onGoal('opponent')}><Shield /> GOL ADVERSÁRIO</button><button onClick={() => onGoal('own')}><RotateCcw /> GOL CONTRA</button></div>
    <section className="timeline"><div className="timeline-head"><h2>EVENTOS DA PARTIDA</h2><span>{events.length} gols</span></div>{events.map((event) => <article key={event.id}><span className={event.beneficiary === 'unidos' ? 'event-dot us' : 'event-dot'}><Goal /></span><div><strong>{event.label}</strong><small>{event.detail}</small></div><time>{event.minute}&apos;</time><button aria-label="Editar evento"><Pencil /></button><button aria-label="Remover evento" onClick={() => setEvents(events.filter((item) => item.id !== event.id))}><Trash2 /></button></article>)}</section>
    <button className="finish-game">ENCERRAR PARTIDA</button>
  </div>
}

function GamesView({ onConsole }: { onConsole: () => void }) {
  return <><div className="page-heading"><div><span className="admin-eyebrow">TEMPORADA 2026</span><h1>PARTIDAS</h1><p>Agende jogos e acompanhe o histórico.</p></div><button className="primary-action"><Plus /> NOVA PARTIDA</button></div><div className="resource-table"><div className="resource-row live-row"><span><i /> AO VIVO</span><strong>Muito Paia FC</strong><small>Hoje · Arena Rio Vermelho</small><button onClick={onConsole}>Abrir console</button></div>{demoData.matches.map((m) => <div className="resource-row" key={m.date}><span className={m.result === 'V' ? 'tag-win' : 'tag-loss'}>{m.result === 'V' ? 'VITÓRIA' : 'DERROTA'}</span><strong>{m.opponent}</strong><small>{m.date} · {m.field}</small><b>{m.us} × {m.them}</b></div>)}</div></>
}

function RosterView() {
  return <><div className="page-heading"><div><span className="admin-eyebrow">CADASTRO</span><h1>ELENCO</h1><p>Gerencie atletas e informações esportivas.</p></div><button className="primary-action"><UserPlus /> NOVO ATLETA</button></div><div className="admin-roster">{demoData.players.map((p) => <article key={p.id}><div className="mini-number">{p.number}</div><div><strong>{p.name}</strong><small>{p.position} · #{p.number}</small></div><span>{p.goals} G · {p.assists} A</span><button aria-label={`Editar ${p.name}`}><Pencil /></button><button aria-label={`Mais opções de ${p.name}`}><MoreHorizontal /></button></article>)}</div></>
}

function ResourcesView() {
  return <><div className="page-heading"><div><span className="admin-eyebrow">CONFIGURAÇÃO</span><h1>CADASTROS</h1><p>Dados usados nas partidas e no site público.</p></div></div><div className="resource-cards">{[
    [Shield, 'Adversários', '4 cadastrados', 'Muito Paia FC definido como rival'],
    [MapPin, 'Campos', '3 cadastrados', 'Arena Rio Vermelho como principal'],
    [CircleDot, 'Rivalidade', 'Nosso clássico', 'Edite título e descrição'],
    [Settings, 'Clube e estatísticas', 'Site público', 'Bio, Instagram e ajustes'],
  ].map(([Icon, title, count, text]) => <button key={String(title)}><Icon /><span><strong>{String(title)}</strong><small>{String(count)} · {String(text)}</small></span><ChevronRight /></button>)}</div></>
}

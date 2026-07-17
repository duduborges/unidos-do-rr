import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, Goal, MapPin, Shield } from 'lucide-react'
import type { MatchDetail as MatchDetailData, MatchDetailEvent, MatchNavigation } from './match-detail-query'
import './match-detail.css'

const INSTAGRAM_URL = 'https://www.instagram.com/unidosdorr/'

const longDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' })

function statusLabel(status: MatchDetailData['status']) {
  if (status === 'live') return 'AO VIVO'
  if (status === 'finished') return 'ENCERRADA'
  return 'AGENDADA'
}

function playerLabel(player: { nickname: string | null; name: string } | null) {
  if (!player) return null
  return player.nickname || player.name
}

function eventTitle(event: MatchDetailEvent, opponent: string) {
  if (event.isOwnGoal) return 'Gol contra'
  if (event.beneficiary === 'opponent') return `Gol · ${opponent}`
  const scorer = playerLabel(event.scorer)
  return scorer ? `Gol · ${scorer}` : 'Gol do Unidos'
}

function NavCard({ match, direction }: { match: MatchNavigation; direction: 'previous' | 'next' }) {
  return (
    <Link href={`/jogos/${match.id}`} className={`detail-nav-card ${direction}`}>
      {direction === 'previous' ? <ArrowLeft size={18} /> : null}
      <span>
        <small>{direction === 'previous' ? 'PARTIDA ANTERIOR' : 'PRÓXIMA PARTIDA'}</small>
        <strong>{match.opponent}</strong>
        <em>{shortDate.format(new Date(match.date)).replace('.', '').toUpperCase()}</em>
      </span>
      {direction === 'next' ? <ArrowRight size={18} /> : null}
    </Link>
  )
}

export function MatchDetail({ data }: { data: MatchDetailData }) {
  const detailedGoals = data.events.filter((event) => event.type === 'goal').length
  const totalGoals = data.score.unidos + data.score.opponent
  const partiallyDetailed = detailedGoals > 0 && detailedGoals < totalGoals

  return (
    <div className="detail-shell">
      <header className="detail-topbar">
        <Link href="/" className="brand-lockup" aria-label="Unidos do RR - inicio">
          <Image src="/brand/unidos-logo.png" alt="Escudo Unidos do RR" width={46} height={52} />
          <span><strong>UNIDOS DO RR</strong><small>RIO VERMELHO · FUT7</small></span>
        </Link>
        <Link href="/#jogos" className="detail-back"><ArrowLeft size={16} /> VOLTAR</Link>
      </header>

      <main className="detail-main">
        <section className="detail-hero">
          <span className="detail-status">{statusLabel(data.status)}</span>
          <div className="detail-scoreboard" aria-label={`Unidos do RR ${data.score.unidos} a ${data.score.opponent} ${data.opponent}`}>
            <div className="detail-team">
              <Image src="/brand/unidos-logo.png" alt="" width={64} height={72} />
              <strong>UNIDOS DO RR</strong>
            </div>
            <div className="detail-score"><span>{data.score.unidos}</span><b>×</b><span>{data.score.opponent}</span></div>
            <div className="detail-team away">
              <div className="detail-crest"><Shield /></div>
              <strong>{data.opponent}</strong>
            </div>
          </div>
          <p className="detail-date">{longDate.format(new Date(data.scheduledAt))}</p>
          <div className="detail-place">
            <MapPin size={16} />
            <span>{data.field}{data.address ? ` · ${data.address}` : ''}</span>
            {data.mapsUrl ? <a href={data.mapsUrl} target="_blank" rel="noreferrer">VER NO MAPA</a> : null}
          </div>
        </section>

        <section className="detail-timeline-band">
          <div className="detail-section-head">
            <h2>LINHA DO TEMPO</h2>
            <span>{detailedGoals} de {totalGoals} gols detalhados</span>
          </div>
          {partiallyDetailed ? <p className="detail-note">Nem todos os gols desta partida foram detalhados. O placar oficial é {data.score.unidos} × {data.score.opponent}.</p> : null}
          {data.events.length ? (
            <ul className="detail-timeline" aria-label="Eventos da partida">
              {data.events.map((event) => {
                const assist = playerLabel(event.assist)
                return (
                  <li key={event.id} className={event.beneficiary === 'unidos' ? 'us' : ''}>
                    <span className="detail-minute">{event.minute}&apos;</span>
                    <span className="detail-dot"><Goal size={15} /></span>
                    <div>
                      <strong>{eventTitle(event, data.opponent)}</strong>
                      <small>{assist ? `Assistência: ${assist}` : 'Sem assistência'}</small>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : <p className="detail-empty">Sem lances detalhados para esta partida.</p>}
        </section>

        {(data.previous || data.next) ? (
          <nav className="detail-nav" aria-label="Navegação entre partidas">
            {data.previous ? <NavCard match={data.previous} direction="previous" /> : <span />}
            {data.next ? <NavCard match={data.next} direction="next" /> : <span />}
          </nav>
        ) : null}

        <section className="detail-cta">
          <div><span>AGENDA ABERTA</span><h2>QUER JOGAR CONTRA O RR?</h2></div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"><Camera size={18} /> CHAMAR NO INSTAGRAM</a>
        </section>
      </main>
    </div>
  )
}

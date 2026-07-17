'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Camera, ExternalLink, MapPin, Menu, Radio, Shield, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatMatchClock } from '@/features/matches/domain'
import type { HomeData } from './demo-data'
import { RealtimeRefresh } from './realtime-refresh'
import { SeasonRecord } from './season-record'
import { MatchHistory } from './match-history'
import { KitCarousel } from './kit-carousel'
import { MotionReveal } from './motion-reveal'
import './home.css'

function LiveClock({ startedAt }: { startedAt: string }) {
  const [clock, setClock] = useState('0:00')
  useEffect(() => {
    const tick = () => setClock(formatMatchClock(startedAt, null))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])
  return <span suppressHydrationWarning>{clock}</span>
}

export function HomePage({ data }: { data: HomeData }) {
  const live = data.liveMatch
  const matchCount = data.record.wins + data.record.draws + data.record.losses
  return <div className="site-shell">
    {live && <RealtimeRefresh matchId={live.id} />}
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label="Unidos do RR - inicio">
        <Image src="/brand/unidos-logo.png" alt="Escudo Unidos do RR" width={56} height={64} priority />
        <span><strong>UNIDOS DO RR</strong><small>RIO VERMELHO · FUT7</small></span>
      </Link>
      <nav aria-label="Navegacao principal"><a href="#jogos">Jogos</a><a href="#elenco">Elenco</a><a href="#classico">Classico</a><a href="#uniformes">Uniformes</a></nav>
      {live && <a className="live-pill" href="#ao-vivo"><Radio size={15} /> AO VIVO</a>}
      <button className="mobile-menu" aria-label="Abrir menu"><Menu /></button>
    </header>
    <main>
      <section className="match-hero" id="ao-vivo">
        <div className="hero-watermark">RR</div>
        {live ? <div className="hero-copy">
          <span className="eyebrow live"><i /> PARTIDA EM ANDAMENTO</span>
          <h1 className="hero-kicker">O BAIRRO JOGA JUNTO</h1>
          <div className="scoreboard" aria-label={'Unidos do RR '+live.score.unidos+' a '+live.score.opponent+' '+live.opponent}>
            <div className="team home"><Image src="/brand/unidos-logo.png" alt="" width={88} height={100} /><strong>UNIDOS<br />DO RR</strong></div>
            <div className="score"><span>{live.score.unidos}</span><b>×</b><span>{live.score.opponent}</span></div>
            <div className="team away"><div className="opponent-crest"><Shield /></div><strong>{live.opponent}</strong></div>
          </div>
          <div className="match-meta"><span className="clock"><LiveClock startedAt={live.startedAt} /></span><span><MapPin size={16} /> {live.field}</span></div>
        </div> : <div className="hero-copy institutional-hero">
          <span className="eyebrow">RIO VERMELHO · FLORIANÓPOLIS</span>
          <Image src="/brand/unidos-logo.png" alt="" width={154} height={176} priority />
          <h1>UNIDOS PELO BAIRRO.</h1>
          <p>Fut7, amizade e a força do Red River em campo.</p>
        </div>}
      </section>
      <SeasonRecord played={matchCount} wins={data.record.wins} draws={data.record.draws} losses={data.record.losses} />
      <section className="about-band section-pad">
        <div className="section-inner about-grid">
          <div><span className="eyebrow">NOSSA HISTÓRIA</span><h2>UNIDOS PELO BAIRRO.</h2><p>{data.settings.about}</p></div>
          <div className="location-panel"><MapPin /><div><small>NOSSA CASA</small><strong>RIO VERMELHO</strong><p>{data.settings.locality}</p><a href={data.settings.mapsUrl} target="_blank" rel="noreferrer">VER NO MAPA <ExternalLink size={14} /></a></div></div>
        </div>
      </section>
      <section className="matches-band section-pad" id="jogos">
        <div className="section-inner"><div className="section-title"><div><span className="eyebrow">TEMPORADA 2026</span><h2>ÚLTIMOS JOGOS</h2></div><Trophy /></div>
          <MotionReveal><MatchHistory matches={data.matches} /></MotionReveal>
        </div>
      </section>
      <section className="roster-band section-pad" id="elenco"><div className="section-inner"><span className="eyebrow">QUEM DEFENDE O RR</span><h2>NOSSO ELENCO</h2>{data.players.length ? <div className="roster-grid">{data.players.map((player) => <article className="player-card" key={player.id}><span className="player-number">{String(player.number).padStart(2, '0')}</span><div className="player-avatar">{player.number}</div><div><small>{player.position}</small><h3>{player.nickname}</h3><p>{player.name}</p></div><dl><div><dt>GOLS</dt><dd>{player.goals}</dd></div><div><dt>ASSIST.</dt><dd>{player.assists}</dd></div></dl></article>)}</div> : <p className="empty-band">O elenco está sendo atualizado.</p>}</div></section>
      <section className="rivalry-band section-pad" id="classico"><div className="section-inner rivalry-grid"><div><span className="eyebrow red">NOSSO CLÁSSICO</span><h2>{data.rivalry.title}</h2><p>{data.rivalry.description}</p></div><div className="versus"><Image src="/brand/unidos-logo.png" alt="Unidos do RR" width={124} height={142} /><span>VS</span><div className="large-opponent"><Shield /><strong>{data.rivalry.opponent}</strong></div></div></div></section>
      <section className="kits-band section-pad" id="uniformes"><div className="section-inner"><span className="eyebrow">MANTO DO RR</span><h2>NOSSOS UNIFORMES</h2><KitCarousel /></div></section>
      <section className="friendly-band"><div><span className="eyebrow">AGENDA ABERTA</span><h2>QUER JOGAR<br />CONTRA O RR?</h2><p>Organize seu time e chama a gente na DM.</p></div><a href={data.settings.instagramUrl} target="_blank" rel="noreferrer"><Camera /> MARCAR AMISTOSO <ExternalLink size={18} /></a></section>
    </main>
    <footer><div className="brand-lockup"><Image src="/brand/unidos-logo.png" alt="" width={42} height={48} /><span><strong>UNIDOS DO RR</strong><small>UNIDOS PELO BAIRRO.</small></span></div><p>{data.settings.locality}</p><a href={data.settings.instagramUrl} target="_blank" rel="noreferrer"><Camera size={18} /> @UNIDOSDORR</a></footer>
  </div>
}

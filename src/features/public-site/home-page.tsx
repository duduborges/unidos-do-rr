'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Camera, ExternalLink, MapPin, Menu, Radio, Shield, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatMatchClock } from '@/features/matches/domain'
import { demoData } from './demo-data'
import './home.css'

function LiveClock({ startedAt }: { startedAt: string }) {
  const [clock, setClock] = useState('38:12')
  useEffect(() => {
    const tick = () => setClock(formatMatchClock(startedAt, null))
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [startedAt])
  return <span>{clock}</span>
}

export function HomePage() {
  const data = demoData
  return <div className="site-shell">
    <header className="site-header">
      <Link href="/" className="brand-lockup" aria-label="Unidos do RR - inicio">
        <Image src="/brand/unidos-logo.png" alt="Escudo Unidos do RR" width={56} height={64} priority />
        <span><strong>UNIDOS DO RR</strong><small>RIO VERMELHO · FUT7</small></span>
      </Link>
      <nav aria-label="Navegacao principal"><a href="#jogos">Jogos</a><a href="#elenco">Elenco</a><a href="#classico">Classico</a><a href="#uniformes">Uniformes</a></nav>
      <a className="live-pill" href="#ao-vivo"><Radio size={15} /> AO VIVO</a>
      <button className="mobile-menu" aria-label="Abrir menu"><Menu /></button>
    </header>
    <main>
      <section className="match-hero" id="ao-vivo">
        <div className="hero-watermark">RR</div>
        <div className="hero-copy">
          <span className="eyebrow live"><i /> PARTIDA EM ANDAMENTO</span>
          <h1 className="hero-kicker">O BAIRRO JOGA JUNTO</h1>
          <div className="scoreboard" aria-label="Unidos do RR 2 a 1 Muito Paia FC">
            <div className="team home"><Image src="/brand/unidos-logo.png" alt="" width={88} height={100} /><strong>UNIDOS<br />DO RR</strong></div>
            <div className="score"><span>{data.liveMatch.score.unidos}</span><b>×</b><span>{data.liveMatch.score.opponent}</span></div>
            <div className="team away"><div className="opponent-crest"><Shield /></div><strong>MUITO<br />PAIA FC</strong></div>
          </div>
          <div className="match-meta"><span className="clock"><LiveClock startedAt={data.liveMatch.startedAt} /></span><span><MapPin size={16} /> {data.liveMatch.field}</span></div>
        </div>
      </section>
      <section className="record-band" aria-label="Visao geral da temporada">
        <div><span>VISÃO GERAL</span><strong>4</strong><small>PARTIDAS</small></div>
        <div className="record-item win"><strong>{data.record.wins}</strong><small>VITÓRIAS</small></div>
        <div className="record-item draw"><strong>{data.record.draws}</strong><small>EMPATES</small></div>
        <div className="record-item loss"><strong>{data.record.losses}</strong><small>DERROTAS</small></div>
      </section>
      <section className="about-band section-pad">
        <div className="section-inner about-grid">
          <div><span className="eyebrow">NOSSA HISTÓRIA</span><h2>UNIDOS PELO BAIRRO.</h2><p>Do Rio Vermelho para o campo. Somos um time de Fut7 criado entre amigos, movido pela comunidade e pela vontade de competir. Em cada partida levamos o orgulho do norte da ilha.</p></div>
          <div className="location-panel"><MapPin /><div><small>NOSSA CASA</small><strong>RIO VERMELHO</strong><p>Florianópolis · Santa Catarina</p><a href="https://maps.google.com/?q=Rio+Vermelho+Florianopolis" target="_blank" rel="noreferrer">VER NO MAPA <ExternalLink size={14} /></a></div></div>
        </div>
      </section>
      <section className="matches-band section-pad" id="jogos">
        <div className="section-inner"><div className="section-title"><div><span className="eyebrow">TEMPORADA 2026</span><h2>ÚLTIMOS JOGOS</h2></div><Trophy /></div>
          <div className="match-list">{data.matches.map((match) => <article className="match-row" key={`${match.date}-${match.opponent}`}><time>{match.date}</time><div><strong>UNIDOS DO RR</strong><small>{match.field}</small></div><div className="row-score"><b>{match.us}</b><span>×</span><b>{match.them}</b></div><strong className="opponent-name">{match.opponent}</strong><span className={`result result-${match.result.toLowerCase()}`}>{match.result}</span></article>)}</div>
        </div>
      </section>
      <section className="roster-band section-pad" id="elenco"><div className="section-inner"><span className="eyebrow">QUEM DEFENDE O RR</span><h2>NOSSO ELENCO</h2><div className="roster-grid">{data.players.map((player) => <article className="player-card" key={player.id}><span className="player-number">{String(player.number).padStart(2, '0')}</span><div className="player-avatar">{player.number}</div><div><small>{player.position}</small><h3>{player.nickname}</h3><p>{player.name}</p></div><dl><div><dt>GOLS</dt><dd>{player.goals}</dd></div><div><dt>ASSIST.</dt><dd>{player.assists}</dd></div></dl></article>)}</div></div></section>
      <section className="rivalry-band section-pad" id="classico"><div className="section-inner rivalry-grid"><div><span className="eyebrow red">NOSSO CLÁSSICO</span><h2>RIVALIDADE<br />DO BAIRRO</h2><p>Quando Unidos do RR e Muito Paia FC entram em campo, não existe amistoso. É o confronto que movimenta a resenha e decide quem manda no bairro.</p></div><div className="versus"><Image src="/brand/unidos-logo.png" alt="Unidos do RR" width={124} height={142} /><span>VS</span><div className="large-opponent"><Shield /><strong>MUITO<br />PAIA FC</strong></div></div></div></section>
      <section className="kits-band section-pad" id="uniformes"><div className="section-inner"><span className="eyebrow">MANTO DO RR</span><h2>NOSSOS UNIFORMES</h2><div className="kits-layout"><div className="kit-image"><Image src="/brand/unidos-kits.png" alt="Uniformes home e away do Unidos do RR para jogadores e goleiros" fill sizes="(max-width: 800px) 100vw, 65vw" /></div><div className="kit-legend"><div><i className="swatch navy" /><span><strong>JOGADOR · HOME</strong><small>Azul-marinho, vermelho e branco</small></span></div><div><i className="swatch white" /><span><strong>JOGADOR · AWAY</strong><small>Branco, azul-marinho e vermelho</small></span></div><div><i className="swatch yellow" /><span><strong>GOLEIRO · HOME</strong><small>Amarelo, azul-marinho e vermelho</small></span></div><div><i className="swatch purple" /><span><strong>GOLEIRO · AWAY</strong><small>Roxo, vermelho e branco</small></span></div></div></div></div></section>
      <section className="friendly-band"><div><span className="eyebrow">AGENDA ABERTA</span><h2>QUER JOGAR<br />CONTRA O RR?</h2><p>Organize seu time e chama a gente na DM.</p></div><a href="https://www.instagram.com/unidosdorr/" target="_blank" rel="noreferrer"><Camera /> MARCAR AMISTOSO <ExternalLink size={18} /></a></section>
    </main>
    <footer><div className="brand-lockup"><Image src="/brand/unidos-logo.png" alt="" width={42} height={48} /><span><strong>UNIDOS DO RR</strong><small>UNIDOS PELO BAIRRO.</small></span></div><p>Rio Vermelho · Florianópolis, SC</p><a href="https://www.instagram.com/unidosdorr/" target="_blank" rel="noreferrer"><Camera size={18} /> @UNIDOSDORR</a></footer>
  </div>
}

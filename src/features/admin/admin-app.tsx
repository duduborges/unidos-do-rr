'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ChevronRight, House, LogOut, Menu, Users } from 'lucide-react'
import { useState } from 'react'
import { AdminDashboard, CatalogManager, MatchManager, PlayerManager, RealLiveConsole } from './resource-managers'
import { SettingsManager } from './settings-manager'
import { logoutAction } from './login-actions'
import './admin.css'

type View = 'inicio' | 'jogos' | 'elenco' | 'mais' | 'ao-vivo'

const navigation = [
  ['inicio', House, 'Início'],
  ['jogos', CalendarDays, 'Jogos'],
  ['elenco', Users, 'Elenco'],
  ['mais', Menu, 'Cadastros'],
] as const

export function AdminApp() {
  const [view, setView] = useState<View>('inicio')
  const title = view === 'ao-vivo' ? 'Console ao vivo' : view === 'inicio' ? 'Visão geral' : view === 'jogos' ? 'Partidas' : view === 'elenco' ? 'Elenco' : 'Cadastros'

  return <div className="admin-app">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand"><Image src="/brand/unidos-logo.png" alt="" width={50} height={58} /><span><strong>UNIDOS DO RR</strong><small>ADMINISTRAÇÃO</small></span></Link>
      <nav>{navigation.map(([id, Icon, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}><Icon size={19} /> {label}</button>)}</nav>
      <div className="side-live"><span>OPERAÇÃO DE JOGO</span><strong>Placar e eventos em tempo real</strong><button onClick={() => setView('ao-vivo')}>ABRIR CONSOLE <ChevronRight size={16} /></button></div>
      <form action={logoutAction}><button className="logout"><LogOut size={18} /> Sair</button></form>
    </aside>

    <div className="admin-main">
      <header className="admin-topbar"><div><small>UNIDOS DO RR</small><strong>{title}</strong></div><div className="admin-avatar">RR</div></header>
      <main className="admin-content">
        {view === 'inicio' && <AdminDashboard onLive={() => setView('ao-vivo')} onGames={() => setView('jogos')} onRoster={() => setView('elenco')} onCatalog={() => setView('mais')} />}
        {view === 'ao-vivo' && <RealLiveConsole onGames={() => setView('jogos')} />}
        {view === 'jogos' && <MatchManager onLive={() => setView('ao-vivo')} />}
        {view === 'elenco' && <PlayerManager />}
        {view === 'mais' && <><CatalogManager /><SettingsManager /></>}
      </main>
    </div>

    <nav className="admin-bottom">{navigation.map(([id, Icon, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}><Icon size={21} /><span>{label === 'Cadastros' ? 'Mais' : label}</span></button>)}</nav>
  </div>
}

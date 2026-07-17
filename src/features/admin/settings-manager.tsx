'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Player = Database['public']['Tables']['players']['Row']
type ClubSettings = Database['public']['Tables']['club_settings']['Row']

export function SettingsManager() {
  const supabase = useMemo(() => createClient(), [])
  const [settings, setSettings] = useState<ClubSettings | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [scope, setScope] = useState<'club' | 'player'>('club')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([
      supabase.from('club_settings').select('*').eq('id', true).single(),
      supabase.from('players').select('*').eq('is_active', true).order('shirt_number'),
    ])
    if (s.error || p.error) setMessage(s.error?.message ?? p.error?.message ?? '')
    else { setSettings(s.data); setPlayers(p.data) }
  }, [supabase])
  useEffect(() => { const id = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(id) }, [load])

  async function saveSettings(formData: FormData) {
    const instagram = String(formData.get('instagramUrl') ?? '')
    if (!instagram.includes('instagram.com/')) { setMessage('Informe uma URL válida do Instagram.'); return }
    const { error } = await supabase.from('club_settings').update({
      bio: String(formData.get('bio') ?? '').trim(),
      about_text: String(formData.get('about') ?? '').trim(),
      locality: String(formData.get('locality') ?? '').trim(),
      instagram_url: instagram,
    }).eq('id', true)
    setMessage(error ? error.message : 'Dados públicos atualizados.')
    if (!error) await load()
  }

  async function addAdjustment(formData: FormData) {
    const metric = String(formData.get('metric'))
    const playerId = String(formData.get('playerId') ?? '') || null
    const delta = Number(formData.get('delta'))
    const reason = String(formData.get('reason') ?? '').trim()
    if (!delta || reason.length < 4) { setMessage('Informe valor diferente de zero e motivo com ao menos 4 caracteres.'); return }
    if (scope === 'player' && !playerId) { setMessage('Selecione o atleta.'); return }
    const { error } = await supabase.from('stat_adjustments').insert({
      scope,
      player_id: scope === 'player' ? playerId : null,
      metric,
      delta,
      reason,
    })
    setMessage(error ? error.message : 'Ajuste registrado no histórico.')
  }

  if (!settings) return null
  return <section className="settings-manager">
    <div className="settings-title"><Settings /><div><small>SITE PÚBLICO E CORREÇÕES</small><h2>CLUBE E ESTATÍSTICAS</h2></div></div>
    <div className="manager-columns">
      <form className="manager-form stacked" action={saveSettings}>
        <h3>DADOS PÚBLICOS</h3>
        <label>Frase do clube<input name="bio" defaultValue={settings.bio} required /></label>
        <label>Sobre nós<textarea name="about" defaultValue={settings.about_text} minLength={10} required /></label>
        <label>Localidade<input name="locality" defaultValue={settings.locality} required /></label>
        <label>Instagram<input name="instagramUrl" type="url" defaultValue={settings.instagram_url} required /></label>
        <button>SALVAR DADOS DO CLUBE</button>
      </form>
      <form className="manager-form stacked" action={addAdjustment}>
        <h3>CORRIGIR ESTATÍSTICA</h3>
        <label>Escopo<select value={scope} onChange={(event) => setScope(event.target.value as 'club' | 'player')}><option value="club">Clube</option><option value="player">Atleta</option></select></label>
        {scope === 'player' && <label>Atleta<select name="playerId" required><option value="">Selecione</option>{players.map((player) => <option key={player.id} value={player.id}>#{player.shirt_number} · {player.nickname || player.name}</option>)}</select></label>}
        <label>Métrica<select name="metric" required>{scope === 'club' ? <><option value="wins">Vitórias</option><option value="draws">Empates</option><option value="losses">Derrotas</option></> : <><option value="goals">Gols</option><option value="assists">Assistências</option></>}</select></label>
        <label>Ajuste<input name="delta" type="number" step={1} placeholder="+1 ou -1" required /></label>
        <label>Motivo<input name="reason" minLength={4} maxLength={200} required /></label>
        <button>REGISTRAR AJUSTE</button>
      </form>
    </div>
    {message && <p className="manager-message" role="status">{message}</p>}
  </section>
}

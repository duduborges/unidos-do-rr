'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RealtimeRefresh({ matchId }: { matchId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let timeout: number | undefined
    let connected = false
    const refresh = () => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => router.refresh(), 150)
    }
    const channel = supabase
      .channel(`public-live:${matchId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${matchId}` }, refresh)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (connected) refresh()
          connected = true
        }
      })

    return () => {
      window.clearTimeout(timeout)
      void supabase.removeChannel(channel)
    }
  }, [matchId, router])

  return null
}

import { useEffect, useState } from 'react'
import type { VPSPlan } from '@/lib/types'
import { updateFX } from '@/lib/types'

interface DataState {
  vps: VPSPlan[]
  lastRun: string | null
  loading: boolean
  error: string | null
}

export function useVPSData(): DataState {
  const [state, setState] = useState<DataState>({
    vps: [],
    lastRun: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Fetch FX rates silently (best-effort)
        fetch('/data/fx.json')
          .then(r => r.ok ? r.json() : null)
          .then(fx => {
            if (fx?.rates?.USD) updateFX(fx.rates.USD, fx.rates.EUR ?? fx.rates.USD * 1.09)
          })
          .catch(() => { /* fallback to hardcoded defaults */ })

        const [vpsRes, summaryRes] = await Promise.all([
          fetch('/data/vps/all.json'),
          fetch('/data/summary.json'),
        ])
        if (!vpsRes.ok || !summaryRes.ok) throw new Error('Gagal memuat data')
        const vps: VPSPlan[] = await vpsRes.json()
        const summary = await summaryRes.json()
        if (!cancelled) {
          setState({
            vps,
            lastRun: summary.last_run ?? null,
            loading: false,
            error: null,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setState(s => ({ ...s, loading: false, error: (err as Error).message }))
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return state
}

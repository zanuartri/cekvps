import { useState, useMemo } from 'react'
import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, PROVIDER_NAMES } from '@/lib/types'
import { buildAffiliateUrl, isAffiliate } from '@/lib/site'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface DeployCostProps {
  vps: VPSPlan[]
}

export default function DeployCost({ vps }: DeployCostProps) {
  const { currency } = useCurrency()
  const [selProvider, setSelProvider] = useState('')
  const [selPlan, setSelPlan] = useState('')
  const providers = useMemo(() => [...new Set(vps.map(p => p.provider))], [vps])
  const plans = useMemo(() => vps.filter(p => p.provider === selProvider), [vps, selProvider])

  const selectedVPS = useMemo(
    () => vps.find(p => p.provider === selProvider && p.plan === selPlan),
    [vps, selProvider, selPlan]
  )

  const vpsPrice = selectedVPS
    ? convertPrice(selectedVPS.price_monthly, selectedVPS.currency as any, currency)
    : 0

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <Select value={selProvider} onValueChange={v => { setSelProvider(v); setSelPlan('') }}>
            <SelectTrigger><SelectValue placeholder="Pilih provider" /></SelectTrigger>
            <SelectContent>
              {providers.map(p => (
                <SelectItem key={p} value={p}>{PROVIDER_NAMES[p] || p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Plan</label>
          <Select value={selPlan} onValueChange={setSelPlan} disabled={!selProvider}>
            <SelectTrigger>
              <SelectValue placeholder={selProvider ? 'Pilih plan' : 'Pilih provider dulu'} />
            </SelectTrigger>
            <SelectContent>
              {plans.map(p => (
                <SelectItem key={p.plan} value={p.plan}>
                  {p.plan} — {fmtPrice(convertPrice(p.price_monthly, p.currency as any, currency), currency)}/bln
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedVPS ? (
        <div className="mt-6 rounded-xl border bg-gradient-to-br from-primary/[0.04] to-violet-500/[0.04] p-5">
          <div className="grid grid-cols-3 gap-3">
            <Cell label="VPS / bln" value={fmtPrice(vpsPrice, currency)} />
            <Cell label="Setup fee" value="Gratis" accent="text-emerald-600" />
            <Cell label="Total bulan ini" value={fmtPrice(vpsPrice, currency)} accent="text-primary" highlight />
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {selectedVPS.plan} · {selectedVPS.vcpu} vCPU · {selectedVPS.ram_gb} GB RAM · {selectedVPS.storage_gb} GB {selectedVPS.storage_type}
            </p>
            <a
              href={buildAffiliateUrl(selectedVPS.provider, selectedVPS.url)}
              target="_blank"
              rel={isAffiliate(selectedVPS.provider) ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              Deploy sekarang ↗
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
          Pilih provider & plan untuk lihat estimasi biaya.
        </div>
      )}
    </div>
  )
}

function Cell({ label, value, accent, highlight }: { label: string; value: string; accent?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border bg-card p-3 ${highlight ? 'border-primary/30' : ''}`}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-mono text-lg font-bold tabular-nums ${accent ?? 'text-foreground'}`}>{value}</div>
    </div>
  )
}

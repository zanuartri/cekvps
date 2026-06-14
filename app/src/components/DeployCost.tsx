import { useState, useMemo } from 'react'
import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, PROVIDER_NAMES } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          💰 Total Deploy Cost
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Estimasi biaya bulan pertama: VPS (1 bulan). Domain menyusul.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider VPS</label>
            <Select value={selProvider} onValueChange={v => { setSelProvider(v); setSelPlan('') }}>
              <SelectTrigger>
                <SelectValue placeholder="— Pilih Provider —" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(p => (
                  <SelectItem key={p} value={p}>
                    {PROVIDER_NAMES[p] || p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan VPS</label>
            <Select
              value={selPlan}
              onValueChange={setSelPlan}
              disabled={!selProvider}
            >
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
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">📋 Ringkasan Biaya</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-xs text-muted-foreground mb-1">VPS (1 bln)</div>
                <div className="text-xl font-bold">{fmtPrice(vpsPrice, currency)}</div>
              </div>
              <div className="bg-card rounded-lg p-4 border">
                <div className="text-xs text-muted-foreground mb-1">Setup Fee</div>
                <div className="text-xl font-bold text-emerald-600">Gratis</div>
              </div>
              <div className="bg-card rounded-lg p-4 border border-primary/20 bg-primary/[0.02]">
                <div className="text-xs text-muted-foreground mb-1">Total Bulan Ini</div>
                <div className="text-xl font-bold text-primary">{fmtPrice(vpsPrice, currency)}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {selectedVPS.plan} — {selectedVPS.vcpu} vCPU, {selectedVPS.ram_gb} GB RAM, {selectedVPS.storage_gb} GB {selectedVPS.storage_type}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Pilih VPS untuk lihat estimasi biaya
          </div>
        )}
      </CardContent>
    </Card>
  )
}

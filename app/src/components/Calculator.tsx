import { useState, useMemo } from 'react'
import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, fmtStorage } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

interface CalculatorProps {
  vps: VPSPlan[]
}

export default function Calculator({ vps }: CalculatorProps) {
  const { currency } = useCurrency()
  const [ram, setRam] = useState(2)
  const [cpu, setCpu] = useState(2)

  const matches = useMemo(() => {
    return vps
      .filter(p => p.ram_gb >= ram && p.vcpu >= cpu)
      .sort((a, b) => {
        const pa = convertPrice(a.price_monthly, a.currency as any, currency)
        const pb = convertPrice(b.price_monthly, b.currency as any, currency)
        return pa - pb
      })
      .slice(0, 6)
  }, [vps, ram, cpu, currency])

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          🧮 "Can I Run This?"
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Masukkan kebutuhan RAM & CPU, kami kasih rekomendasi VPS termurah yang bisa menjalankan app kamu.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">RAM</label>
              <span className="text-lg font-bold tabular-nums text-primary font-mono">{ram} GB</span>
            </div>
            <Slider
              value={[ram]}
              onValueChange={([v]) => setRam(v)}
              min={0.5}
              max={64}
              step={0.5}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">CPU Cores</label>
              <span className="text-lg font-bold tabular-nums text-primary font-mono">{cpu} Core</span>
            </div>
            <Slider
              value={[cpu]}
              onValueChange={([v]) => setCpu(v)}
              min={1}
              max={32}
              step={1}
            />
          </div>
        </div>

        {matches.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">🏆 Rekomendasi Termurah</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matches.map(p => (
                <Card key={`${p.provider}-${p.plan}`} className="bg-card/50 border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm capitalize">{p.provider.replace('_', ' ')}</span>
                      <span className="font-bold text-primary">
                        {fmtPrice(convertPrice(p.price_monthly, p.currency as any, currency), currency)}
                        <span className="text-xs text-muted-foreground font-normal">/bln</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.plan}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">🧠 {p.vcpu} vCPU</Badge>
                      <Badge variant="secondary" className="text-xs">💾 {fmtStorage(p.ram_gb)}</Badge>
                      <Badge variant="secondary" className="text-xs">📀 {fmtStorage(p.storage_gb)}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada VPS yang memenuhi spesifikasi tersebut.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { useState, useMemo, type ReactNode } from 'react'
import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, fmtStorage, PROVIDER_NAMES } from '@/lib/types'
import { buildAffiliateUrl, isAffiliate } from '@/lib/site'
import { Slider } from '@/components/ui/slider'
import ProviderLogo from '@/components/ProviderLogo'

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
      .sort((a, b) =>
        convertPrice(a.price_monthly, a.currency as any, currency) -
        convertPrice(b.price_monthly, b.currency as any, currency)
      )
      .slice(0, 6)
  }, [vps, ram, cpu, currency])

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Control label="RAM minimum" value={`${ram} GB`}>
          <Slider value={[ram]} onValueChange={([v]) => setRam(v)} min={0} max={64} step={2} />
        </Control>
        <Control label="CPU minimum" value={`${cpu} core`}>
          <Slider value={[cpu]} onValueChange={([v]) => setCpu(v)} min={1} max={32} step={1} />
        </Control>
      </div>

      <div className="mt-8 border-t pt-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {matches.length > 0 ? 'Rekomendasi termurah' : 'Hasil'}
        </p>
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((p, i) => {
              const price = convertPrice(p.price_monthly, p.currency as any, currency)
              const name = PROVIDER_NAMES[p.provider] || p.provider
              const outUrl = buildAffiliateUrl(p.provider, p.url)
              return (
                <a
                  key={`${p.provider}-${p.plan}`}
                  href={outUrl}
                  target="_blank"
                  rel={isAffiliate(p.provider) ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
                  className="group relative flex flex-col gap-2 rounded-lg border bg-secondary/40 p-4 transition-all hover:border-primary/50 hover:bg-secondary/70"
                >
                  {i === 0 && (
                    <span className="absolute -top-2 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                      Termurah
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <ProviderLogo provider={p.provider} size={28} rounded="rounded-lg" />
                    <span className="truncate text-sm font-semibold">{name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.plan}</p>
                  <div className="flex flex-wrap gap-1 font-mono text-[11px] text-muted-foreground">
                    <span>{p.vcpu} vCPU</span>·<span>{fmtStorage(p.ram_gb)}</span>·<span>{fmtStorage(p.storage_gb)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-base font-bold tabular-nums">{fmtPrice(price, currency)}<span className="text-xs font-normal text-muted-foreground">/bln</span></span>
                    <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Lihat ↗</span>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            Tidak ada VPS yang memenuhi spesifikasi itu. Coba turunkan RAM/CPU.
          </div>
        )}
      </div>
    </div>
  )
}

function Control({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="font-mono text-base font-bold tabular-nums text-primary">{value}</span>
      </div>
      {children}
    </div>
  )
}

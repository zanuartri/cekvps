import { useMemo, type ReactNode } from 'react'
import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, fmtStorage, fmtBandwidth, PROVIDER_NAMES, PROVIDER_COLORS } from '@/lib/types'
import { buildAffiliateUrl, isAffiliate } from '@/lib/site'

interface ProviderCardProps {
  provider: string
  plans: VPSPlan[]
}

function ProviderCard({ provider, plans }: ProviderCardProps) {
  const { currency } = useCurrency()
  const gradient = PROVIDER_COLORS[provider] || 'from-slate-500 to-slate-700'
  const name = PROVIDER_NAMES[provider] || provider
  const partner = isAffiliate(provider)

  const sorted = useMemo(
    () => [...plans].sort((a, b) =>
      convertPrice(a.price_monthly, a.currency as any, currency) -
      convertPrice(b.price_monthly, b.currency as any, currency)
    ),
    [plans, currency]
  )
  const cheapest = sorted[0]
  const cheapestPrice = cheapest
    ? convertPrice(cheapest.price_monthly, cheapest.currency as any, currency)
    : 0

  return (
    <div className="group flex flex-col rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30">
      {/* header */}
      <div className="flex items-center gap-3 p-5 pb-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm`}>
          {name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold text-foreground">{name}</h3>
            {partner && (
              <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                Partner
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Mulai <span className="font-medium text-foreground">{fmtPrice(cheapestPrice, currency)}</span>/bln
          </p>
        </div>
      </div>

      {/* plans */}
      <div className="flex flex-col divide-y border-t">
        {sorted.map(p => {
          const price = convertPrice(p.price_monthly, p.currency as any, currency)
          const outUrl = buildAffiliateUrl(p.provider, p.url)
          return (
            <div key={p.plan} className="px-5 py-3.5 transition-colors hover:bg-accent/40">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{p.plan}</span>
                <div className="text-right">
                  <div className="font-mono text-base font-bold tabular-nums text-foreground">
                    {fmtPrice(price, currency)}
                  </div>
                  <div className="text-[11px] text-muted-foreground -mt-0.5">/bln</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Spec>{p.vcpu} vCPU</Spec>
                <Spec>{fmtStorage(p.ram_gb)} RAM</Spec>
                <Spec>{fmtStorage(p.storage_gb)} {p.storage_type}</Spec>
                <Spec>{fmtBandwidth(p.bandwidth_tb)}</Spec>
              </div>
              {outUrl && (
                <a
                  href={outUrl}
                  target="_blank"
                  rel={partner ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:gap-1.5 transition-all"
                >
                  Deploy di {name}
                  <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Spec({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-secondary-foreground">
      {children}
    </span>
  )
}

interface VPSGridProps {
  vps: VPSPlan[]
  filter: string | null
}

export default function VPSGrid({ vps, filter }: VPSGridProps) {
  const filtered = filter ? vps.filter(p => p.provider === filter) : vps

  const groups: Record<string, VPSPlan[]> = {}
  filtered.forEach(p => {
    (groups[p.provider] ??= []).push(p)
  })

  if (!Object.keys(groups).length) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
        <p className="text-3xl mb-2">🗂️</p>
        <p className="text-sm">Belum ada data VPS untuk filter ini.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(groups).map(([provider, plans]) => (
        <ProviderCard key={provider} provider={provider} plans={plans} />
      ))}
    </div>
  )
}

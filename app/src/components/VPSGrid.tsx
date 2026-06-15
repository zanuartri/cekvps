import { useMemo } from 'react'
import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, fmtStorage, PROVIDER_NAMES, providerMeta } from '@/lib/types'
import type { Region, PaymentMethod } from '@/lib/types'
import { buildAffiliateUrl, isAffiliate } from '@/lib/site'
import ProviderLogo from '@/components/ProviderLogo'

export type SortKey = 'price-asc' | 'price-desc' | 'ram-desc' | 'cpu-desc' | 'value'

interface VPSGridProps {
  vps: VPSPlan[]
  filter: string | null
  query: string
  sort: SortKey
  region: Region | 'all'
  payment: PaymentMethod | 'all'
}

export default function VPSGrid({ vps, filter, query = '', sort = 'price-asc', region = 'all', payment = 'all' }: VPSGridProps) {
  const { currency } = useCurrency()

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const priceOf = (p: VPSPlan) => convertPrice(p.price_monthly, p.currency as any, currency)

    const filtered = vps.filter(p => {
      if (filter && p.provider !== filter) return false
      const meta = providerMeta(p.provider)
      if (region !== 'all' && meta.region !== region) return false
      if (payment !== 'all' && !meta.payments.includes(payment)) return false
      if (!q) return true
      const hay = `${PROVIDER_NAMES[p.provider] || p.provider} ${p.plan} ${p.vcpu}vcpu ${p.ram_gb}gb ${p.storage_gb} ${p.storage_type}`.toLowerCase()
      return hay.includes(q)
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'price-desc': return priceOf(b) - priceOf(a)
        case 'ram-desc': return b.ram_gb - a.ram_gb || priceOf(a) - priceOf(b)
        case 'cpu-desc': return b.vcpu - a.vcpu || priceOf(a) - priceOf(b)
        case 'value': return priceOf(a) / a.ram_gb - priceOf(b) / b.ram_gb
        default: return priceOf(a) - priceOf(b)
      }
    })
    return sorted
  }, [vps, filter, query, sort, region, payment, currency])

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
        <p className="mb-2 text-3xl">🔍</p>
        <p className="text-sm">Nggak ada VPS yang cocok. Coba ubah pencarian atau filter.</p>
      </div>
    )
  }

  const cheapest = rows.reduce((min, p) =>
    convertPrice(p.price_monthly, p.currency as any, currency) <
    convertPrice(min.price_monthly, min.currency as any, currency) ? p : min
  )

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      {/* header (desktop) */}
      <div className="hidden grid-cols-[1.4fr_1.6fr_15rem] items-center gap-4 border-b bg-secondary/40 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
        <span>Provider / plan</span>
        <span>Spesifikasi</span>
        <span className="text-right">Harga / bln</span>
      </div>

      <div className="divide-y">
        {rows.map(p => {
          const price = convertPrice(p.price_monthly, p.currency as any, currency)
          const name = PROVIDER_NAMES[p.provider] || p.provider
          const partner = isAffiliate(p.provider)
          const outUrl = buildAffiliateUrl(p.provider, p.url)
          const isCheapest = p === cheapest
          const meta = providerMeta(p.provider)

          return (
            <div
              key={`${p.provider}-${p.plan}`}
              className="grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40 sm:grid-cols-[1.4fr_1.6fr_15rem] sm:items-center sm:gap-4 sm:px-5"
            >
              {/* provider / plan */}
              <div className="flex items-center gap-3">
                <ProviderLogo provider={p.provider} size={38} className="shadow-sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{name}</span>
                    {meta.region === 'local' && (
                      <span className="shrink-0 rounded-full bg-sky-400/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-sky-300">Lokal</span>
                    )}
                    {isCheapest && (
                      <span className="shrink-0 rounded-full bg-emerald-400/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Termurah</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{p.plan}</span>
                </div>
              </div>

              {/* specs — fixed-width columns so vCPU/RAM/Storage line up across rows */}
              <div className="grid grid-cols-[3rem_4.5rem_1fr] items-center gap-x-4 sm:grid-cols-[3.5rem_5rem_1fr] sm:gap-x-6">
                <Stat label="vCPU" value={String(p.vcpu)} />
                <Stat label="RAM" value={fmtStorage(p.ram_gb)} />
                <Stat label="Storage" value={`${fmtStorage(p.storage_gb)} ${p.storage_type}`} />
              </div>

              {/* price + deploy */}
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  {p.discount_pct && p.price_original ? (
                    <div className="flex items-center justify-end gap-1.5 leading-none">
                      <span className="rounded bg-rose-400/15 px-1 py-px text-[10px] font-bold tabular-nums text-rose-300">−{p.discount_pct}%</span>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground line-through">
                        {fmtPrice(convertPrice(p.price_original, p.currency as any, currency), currency)}
                      </span>
                    </div>
                  ) : null}
                  <div>
                    <span className="font-mono text-base font-bold tabular-nums">{fmtPrice(price, currency)}</span>
                    <span className="text-xs text-muted-foreground">/bln</span>
                  </div>
                  {p.price_annual_monthly && p.price_annual_monthly < p.price_monthly ? (
                    <div className="text-[10px] text-muted-foreground">
                      {fmtPrice(convertPrice(p.price_annual_monthly, p.currency as any, currency), currency)}/bln jika tahunan
                    </div>
                  ) : null}
                </div>
                {outUrl && (
                  <a
                    href={outUrl}
                    target="_blank"
                    rel={partner ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-primary hover:text-primary-foreground"
                  >
                    Lihat <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 whitespace-nowrap text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}

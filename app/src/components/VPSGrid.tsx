import { useMemo, type ReactNode } from 'react'
import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, fmtStorage, fmtBandwidth, PROVIDER_NAMES, PAYMENT_LABELS, providerMeta } from '@/lib/types'
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
      <div className="hidden grid-cols-[1.4fr_1.6fr_auto] items-center gap-4 border-b bg-secondary/40 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
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
              className="grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40 sm:grid-cols-[1.4fr_1.6fr_auto] sm:items-center sm:gap-4 sm:px-5"
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
                    {partner && (
                      <span className="shrink-0 rounded-full bg-amber-400/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-300">Partner</span>
                    )}
                    {isCheapest && (
                      <span className="shrink-0 rounded-full bg-emerald-400/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Termurah</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{p.plan}</span>
                </div>
              </div>

              {/* specs */}
              <div>
                <div className="flex flex-wrap gap-1.5">
                  <Spec>{p.vcpu} vCPU</Spec>
                  <Spec>{fmtStorage(p.ram_gb)} RAM</Spec>
                  <Spec>{fmtStorage(p.storage_gb)} {p.storage_type}</Spec>
                  <InfoTip label="Kuota transfer data keluar/masuk per bulan. Unlimited = tidak dibatasi, biasanya tetap kena fair-use policy.">
                    <Spec>{p.bandwidth_tb === null ? 'Transfer unlimited' : `Transfer ${fmtBandwidth(p.bandwidth_tb)}`}</Spec>
                  </InfoTip>
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  Bayar: {meta.payments.map(m => PAYMENT_LABELS[m]).join(' · ')}
                </div>
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

function Spec({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-secondary-foreground">
      {children}
    </span>
  )
}

/** Custom tooltip (hover/focus) — styled to match the dark theme, no native title. */
function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex" tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-lg border bg-popover px-2.5 py-1.5 text-left font-sans text-[11px] font-normal normal-case leading-snug tracking-normal text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus/tip:translate-y-0 group-focus/tip:opacity-100"
      >
        {label}
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r bg-popover" />
      </span>
    </span>
  )
}

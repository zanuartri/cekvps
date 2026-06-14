import type { VPSPlan } from '@/lib/types'
import { useCurrency } from '@/context/CurrencyContext'
import { convertPrice, fmtPrice, fmtStorage, fmtBandwidth, PROVIDER_NAMES, PROVIDER_COLORS } from '@/lib/types'
import { buildAffiliateUrl, isAffiliate } from '@/lib/site'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VPSCardProps {
  provider: string
  plans: VPSPlan[]
}

function ProviderCard({ provider, plans }: VPSCardProps) {
  const { currency } = useCurrency()
  const gradient = PROVIDER_COLORS[provider] || 'from-slate-600 to-slate-800'
  const name = PROVIDER_NAMES[provider] || provider
  const partner = isAffiliate(provider)

  const sorted = [...plans].sort((a, b) => a.price_monthly - b.price_monthly)
  const firstCurrency = sorted[0]?.currency

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className={`bg-gradient-to-r ${gradient} text-white p-5`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{name}</h3>
          <div className="flex items-center gap-1.5">
            {partner && (
              <Badge variant="secondary" className="bg-white/25 text-white border-0 text-[10px] uppercase tracking-wide">
                ⭐ Partner
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
              {firstCurrency}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border">
        {sorted.map(p => {
          const price = convertPrice(p.price_monthly, p.currency as any, currency)
          const outUrl = buildAffiliateUrl(p.provider, p.url)
          return (
            <div key={p.plan} className="px-5 py-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{p.plan}</span>
                <span className="text-lg font-bold tabular-nums text-primary">
                  {fmtPrice(price, currency)}
                  <span className="text-xs text-muted-foreground font-normal ml-0.5">/bln</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <SpecBadge label={`🧠 ${p.vcpu} vCPU`} />
                <SpecBadge label={`💾 ${fmtStorage(p.ram_gb)}`} />
                <SpecBadge label={`📀 ${fmtStorage(p.storage_gb)} ${p.storage_type || ''}`} />
                <SpecBadge label={`🌐 ${fmtBandwidth(p.bandwidth_tb)}`} />
              </div>
              {outUrl && (
                <a
                  href={outUrl}
                  target="_blank"
                  rel={partner ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-2"
                >
                  Lihat di {name} →
                </a>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function SpecBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
      {label}
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
    if (!groups[p.provider]) groups[p.provider] = []
    groups[p.provider].push(p)
  })

  if (!Object.keys(groups).length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">😕 Belum ada data VPS</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(groups).map(([provider, plans]) => (
        <ProviderCard key={provider} provider={provider} plans={plans} />
      ))}
    </div>
  )
}

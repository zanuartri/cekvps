import { useState } from 'react'
import { CurrencyProvider, useCurrency } from '@/context/CurrencyContext'
import { useVPSData } from '@/hooks/useVPSData'
import { timeAgo, PROVIDER_NAMES } from '@/lib/types'
import Hero from '@/components/Hero'
import CurrencyToggle from '@/components/CurrencyToggle'
import VPSGrid from '@/components/VPSGrid'
import Calculator from '@/components/Calculator'
import DeployCost from '@/components/DeployCost'
import FAQ from '@/components/FAQ'
import Support from '@/components/Support'
import { Button } from '@/components/ui/button'
import { SITE, SAWERIA_URL, AFFILIATE_DISCLOSURE } from '@/lib/site'

function AppContent() {
  const { vps, lastRun, loading, error } = useVPSData()
  const { currency } = useCurrency()
  const [filter, setFilter] = useState<string | null>(null)

  const providers = [...new Set(vps.map(p => p.provider))]
  const vpsCount = filter ? vps.filter(p => p.provider === filter).length : vps.length
  const providerCount = filter ? 1 : providers.length

  return (
    <div className="min-h-screen bg-background">
      <Hero lastRun={lastRun} />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm font-medium overflow-x-auto">
            {['all', ...providers].map(p => (
              <Button
                key={p}
                variant={filter === (p === 'all' ? null : p) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(p === 'all' ? null : p)}
                className="whitespace-nowrap"
              >
                {p === 'all' ? 'Semua' : PROVIDER_NAMES[p] || p}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <CurrencyToggle />
            {lastRun && (
              <span className="hidden lg:block text-xs text-muted-foreground">
                {timeAgo(lastRun)}
              </span>
            )}
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">
                ☕ Dukung
              </a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Stats bar */}
        {!loading && !error && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{providerCount} provider</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{vpsCount} plan</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Mata uang: {currency}</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full" />
              <p className="text-sm">Memuat data VPS...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <p className="text-destructive font-medium">Gagal memuat data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        )}

        {/* VPS Section */}
        {!loading && !error && (
          <section id="vps">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🖥️</span>
              <h2 className="text-2xl font-bold">VPS Price Comparison</h2>
            </div>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Harga per bulan. Bandingkan spesifikasi dan cari yang paling cocok buat kebutuhanmu.
            </p>
            <VPSGrid vps={vps} filter={filter} />
          </section>
        )}

        {/* Calculator Section */}
        {!loading && !error && vps.length > 0 && (
          <section id="calculator">
            <Calculator vps={vps} />
          </section>
        )}

        {/* Deploy Cost Section */}
        {!loading && !error && vps.length > 0 && (
          <section id="deploy-cost">
            <DeployCost vps={vps} />
          </section>
        )}

        {/* Support / Donation */}
        {!loading && !error && <Support />}

        {/* FAQ */}
        {!loading && !error && <FAQ />}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="font-semibold text-foreground mb-2">🖥️ {SITE.name}</p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {SITE.tagline}. Gratis, tanpa iklan, dibuat untuk developer Indonesia 🚀
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2 text-sm">Navigasi</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><a href="#vps" className="hover:text-foreground">Bandingkan VPS</a></li>
                <li><a href="#calculator" className="hover:text-foreground">Kalkulator Spek</a></li>
                <li><a href="#deploy-cost" className="hover:text-foreground">Estimasi Biaya</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2 text-sm">Terhubung</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>
                  <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                    ☕ Dukung via Saweria
                  </a>
                </li>
                {SITE.social.github && (
                  <li><a href={SITE.social.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</a></li>
                )}
                {SITE.social.email && (
                  <li><a href={`mailto:${SITE.social.email}`} className="hover:text-foreground">{SITE.social.email}</a></li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t text-xs text-muted-foreground space-y-2">
            <p className="leading-relaxed">{AFFILIATE_DISCLOSURE}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-1">
              <p>© {new Date().getFullYear()} {SITE.name}. Harga bisa berubah sewaktu-waktu — cek ulang di provider.</p>
              {lastRun && (
                <p>
                  Update terakhir:{' '}
                  {new Date(lastRun).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  )
}

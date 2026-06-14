import { useState } from 'react'
import { CurrencyProvider, useCurrency } from '@/context/CurrencyContext'
import { useVPSData } from '@/hooks/useVPSData'
import { timeAgo, PROVIDER_NAMES } from '@/lib/types'
import Hero from '@/components/Hero'
import CurrencyToggle from '@/components/CurrencyToggle'
import VPSGrid from '@/components/VPSGrid'
import Calculator from '@/components/Calculator'
import DeployCost from '@/components/DeployCost'
import { Button } from '@/components/ui/button'

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
              <span className="hidden sm:block text-xs text-muted-foreground">
                {timeAgo(lastRun)}
              </span>
            )}
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
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">🖥️ CekVPS</p>
          <p>Harga bisa berubah sewaktu-waktu.</p>
          {lastRun && (
            <p className="mt-1">
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
          <p className="mt-3">Dibuat untuk vibe coder Indonesia 🚀</p>
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

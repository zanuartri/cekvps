import { useState } from 'react'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { useVPSData } from '@/hooks/useVPSData'
import { PROVIDER_NAMES } from '@/lib/types'
import Hero from '@/components/Hero'
import CurrencyToggle from '@/components/CurrencyToggle'
import VPSGrid from '@/components/VPSGrid'
import Calculator from '@/components/Calculator'
import DeployCost from '@/components/DeployCost'
import FAQ from '@/components/FAQ'
import Support from '@/components/Support'
import { Button } from '@/components/ui/button'
import { SITE, SAWERIA_URL, AFFILIATE_DISCLOSURE } from '@/lib/site'

const NAV_LINKS = [
  { href: '#vps', label: 'Bandingkan' },
  { href: '#calculator', label: 'Kalkulator' },
  { href: '#faq', label: 'FAQ' },
]

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-7 max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

function AppContent() {
  const { vps, lastRun, loading, error } = useVPSData()
  const [filter, setFilter] = useState<string | null>(null)

  const providers = [...new Set(vps.map(p => p.provider))]

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 h-14">
          <a href="#top" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-sm text-white shadow-sm">C</span>
            <span>CekVPS</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CurrencyToggle />
            <Button asChild size="sm" className="font-medium">
              <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">☕ Dukung</a>
            </Button>
          </div>
        </div>
      </nav>

      <div id="top" />
      <Hero lastRun={lastRun} providerCount={providers.length} planCount={vps.length} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 space-y-20 sm:space-y-24">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm">Memuat data VPS…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 py-14 text-center">
            <p className="font-medium text-destructive">Gagal memuat data</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Comparison */}
            <section id="vps" className="scroll-mt-20">
              <SectionHeading
                eyebrow="Komparasi"
                title="Harga VPS dalam satu halaman"
                desc="Harga per bulan dari provider lokal & global. Klik plan untuk deploy langsung di provider."
              />
              {/* filter chips */}
              <div className="mb-6 flex flex-wrap gap-2">
                {['all', ...providers].map(p => {
                  const active = filter === (p === 'all' ? null : p)
                  return (
                    <button
                      key={p}
                      onClick={() => setFilter(p === 'all' ? null : p)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {p === 'all' ? 'Semua' : PROVIDER_NAMES[p] || p}
                    </button>
                  )
                })}
              </div>
              <VPSGrid vps={vps} filter={filter} />
            </section>

            {/* Calculator */}
            {vps.length > 0 && (
              <section id="calculator" className="scroll-mt-20">
                <SectionHeading
                  eyebrow="Tools"
                  title="Bisa jalanin app-ku gak?"
                  desc="Geser kebutuhan RAM & CPU, kami carikan VPS termurah yang sanggup menjalankannya."
                />
                <Calculator vps={vps} />
              </section>
            )}

            {/* Deploy cost */}
            {vps.length > 0 && (
              <section id="deploy-cost" className="scroll-mt-20">
                <SectionHeading
                  eyebrow="Tools"
                  title="Estimasi biaya deploy"
                  desc="Pilih provider & plan untuk lihat estimasi biaya bulan pertama."
                />
                <DeployCost vps={vps} />
              </section>
            )}

            {/* Support */}
            <section id="dukung" className="scroll-mt-20">
              <Support />
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-20">
              <SectionHeading
                eyebrow="Bantuan"
                title="Pertanyaan umum"
                desc="Soal data, harga, dan cara kerja CekVPS."
              />
              <FAQ />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-2">
              <a href="#top" className="flex items-center gap-2 font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-sm text-white">C</span>
                CekVPS
              </a>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {SITE.tagline}. Gratis, tanpa iklan, dibuat untuk engineer Indonesia.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Navigasi</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {NAV_LINKS.map(l => (
                  <li key={l.href}><a href={l.href} className="transition-colors hover:text-foreground">{l.label}</a></li>
                ))}
                <li><a href="#deploy-cost" className="transition-colors hover:text-foreground">Estimasi biaya</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Terhubung</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">☕ Saweria</a></li>
                {SITE.social.github && <li><a href={SITE.social.github} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">GitHub</a></li>}
                {SITE.social.email && <li><a href={`mailto:${SITE.social.email}`} className="transition-colors hover:text-foreground">Email</a></li>}
              </ul>
            </div>
          </div>

          <div className="mt-10 space-y-3 border-t pt-6 text-xs text-muted-foreground">
            <p className="leading-relaxed">{AFFILIATE_DISCLOSURE}</p>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} {SITE.name}. Harga bisa berubah — cek ulang di provider.</p>
              {lastRun && (
                <p>
                  Update terakhir:{' '}
                  {new Date(lastRun).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
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

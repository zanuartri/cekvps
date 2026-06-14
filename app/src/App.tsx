import { useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { useVPSData } from '@/hooks/useVPSData'
import { PROVIDER_NAMES, REGION_LABELS } from '@/lib/types'
import type { Region, PaymentMethod } from '@/lib/types'
import Hero from '@/components/Hero'
import CurrencyToggle from '@/components/CurrencyToggle'
import VPSGrid, { type SortKey } from '@/components/VPSGrid'
import Calculator from '@/components/Calculator'
import DeployCost from '@/components/DeployCost'
import FAQ from '@/components/FAQ'
import Support from '@/components/Support'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SITE, SAWERIA_URL, AFFILIATE_DISCLOSURE } from '@/lib/site'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'price-asc', label: 'Termurah' },
  { value: 'price-desc', label: 'Termahal' },
  { value: 'ram-desc', label: 'RAM terbanyak' },
  { value: 'cpu-desc', label: 'vCPU terbanyak' },
  { value: 'value', label: 'Best value (harga/GB RAM)' },
]

const PAYMENT_OPTIONS: { value: PaymentMethod | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua metode' },
  { value: 'qris', label: 'QRIS' },
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'ewallet', label: 'E-wallet' },
  { value: 'cc', label: 'Kartu Kredit' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Crypto' },
]


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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function AppContent() {
  const { vps, lastRun, loading, error } = useVPSData()
  const [filter, setFilter] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('price-asc')
  const [region, setRegion] = useState<Region | 'all'>('all')
  const [payment, setPayment] = useState<PaymentMethod | 'all'>('all')

  const providers = [...new Set(vps.map(p => p.provider))]

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 h-16">
          <a href="#top" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-sm text-white shadow-sm shadow-primary/30">C</span>
            <span className="text-[15px]">CekVPS</span>
          </a>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <CurrencyToggle />
            <Button asChild size="sm" className="h-9 font-semibold shadow-sm shadow-primary/20">
              <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">☕ Dukung</a>
            </Button>
          </div>
        </div>
      </nav>

      <div id="top" />
      <Hero vps={vps} lastRun={lastRun} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 space-y-20 sm:space-y-24">
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
                eyebrow="Bandingkan"
                title="Semua VPS dalam satu daftar"
                desc="Cari, urutkan, lalu buka langsung ke provider. Harga per bulan dari provider lokal dan global."
              />

              {/* search + sort toolbar */}
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Cari provider, plan, atau spek… (mis. '8gb', 'contabo')"
                    className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
                  <SelectTrigger className="h-10 sm:w-56">
                    <span className="text-muted-foreground">Urutkan:&nbsp;</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* filters: provider + payment dropdowns, region toggle — one tidy row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Select value={filter ?? 'all'} onValueChange={v => setFilter(v === 'all' ? null : v)}>
                  <SelectTrigger className="h-8 w-auto gap-1 rounded-full text-xs">
                    <span className="text-muted-foreground">Provider:&nbsp;</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua provider</SelectItem>
                    {providers.map(p => (
                      <SelectItem key={p} value={p}>{PROVIDER_NAMES[p] || p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={payment} onValueChange={v => setPayment(v as PaymentMethod | 'all')}>
                  <SelectTrigger className="h-8 w-auto gap-1 rounded-full text-xs">
                    <span className="text-muted-foreground">Bayar:&nbsp;</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

                {(['local', 'global'] as Region[]).map(r => {
                  const active = region === r
                  return (
                    <Chip key={r} active={active} onClick={() => setRegion(active ? 'all' : r)}>
                      {REGION_LABELS[r]}
                    </Chip>
                  )
                })}
              </div>

              <VPSGrid vps={vps} filter={filter} query={query} sort={sort} region={region} payment={payment} />
            </section>

            {/* Calculator */}
            {vps.length > 0 && (
              <section id="calculator" className="scroll-mt-20">
                <SectionHeading
                  eyebrow="Kalkulator"
                  title="Bisa jalanin app-ku gak?"
                  desc="Geser kebutuhan RAM dan CPU, kami carikan VPS termurah yang sanggup menjalankannya."
                />
                <Calculator vps={vps} />
              </section>
            )}

            {/* Deploy cost */}
            {vps.length > 0 && (
              <section id="deploy-cost" className="scroll-mt-20">
                <SectionHeading
                  eyebrow="Estimasi Biaya"
                  title="Estimasi biaya bulan pertama"
                  desc="Pilih provider dan plan untuk lihat estimasi biaya bulan pertama."
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
                eyebrow="FAQ"
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
              <p>© {new Date().getFullYear()} {SITE.name}. Harga bisa berubah, cek ulang di provider.</p>
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

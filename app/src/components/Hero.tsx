import { Button } from '@/components/ui/button'
import { SAWERIA_URL } from '@/lib/site'
import { timeAgo } from '@/lib/types'

interface HeroProps {
  lastRun: string | null
  providerCount: number
  planCount: number
}

export default function Hero({ lastRun, providerCount, planCount }: HeroProps) {
  return (
    <header className="relative overflow-hidden border-b bg-background">
      {/* backdrop */}
      <div className="absolute inset-0 bg-grid" aria-hidden />
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[820px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, oklch(0.6 0.22 277 / 0.22), transparent)' }}
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Harga live{lastRun ? ` · update ${timeAgo(lastRun)}` : ''}
        </span>

        <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground text-balance">
          Cari VPS yang pas,{' '}
          <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            tanpa drama.
          </span>
        </h1>

        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
          Bandingkan harga VPS dari provider lokal & global dalam satu halaman.
          Hitung spesifikasi yang kamu butuh, langsung deploy. Dibuat buat engineer
          yang males ngecek 10 tab.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="font-semibold shadow-sm shadow-primary/20">
            <a href="#vps">Bandingkan harga →</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-medium">
            <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">
              ☕ Dukung proyek
            </a>
          </Button>
        </div>

        {/* stat strip */}
        <dl className="mt-14 grid grid-cols-3 gap-px max-w-lg mx-auto overflow-hidden rounded-2xl border bg-border shadow-sm">
          <Stat value={String(providerCount)} label="provider" />
          <Stat value={String(planCount)} label="plan VPS" />
          <Stat value="Gratis" label="& tanpa iklan" />
        </dl>
      </div>
    </header>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card px-4 py-5">
      <dt className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">{value}</dt>
      <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
    </div>
  )
}

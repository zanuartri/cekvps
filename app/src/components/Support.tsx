import { Button } from '@/components/ui/button'
import { SAWERIA_URL } from '@/lib/site'

export default function Support() {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-8 sm:p-12 text-center shadow-sm">
      <div
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, oklch(0.6 0.22 277 / 0.18), transparent)' }}
        aria-hidden
      />
      <div className="relative">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-2xl">☕</span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Dukung CekVPS</h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
          CekVPS gratis dan tanpa iklan. Kalau tools ini ngebantu kamu pilih VPS,
          traktir kopi seikhlasnya lewat Saweria — semua dipakai buat bayar server &
          rutin update harga. 🙏
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Button asChild size="lg" className="font-semibold shadow-sm shadow-primary/20">
            <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">💛 Dukung via Saweria</a>
          </Button>
          <span className="text-xs text-muted-foreground">Sukarela · sekali atau berkala · mulai Rp1.000</span>
        </div>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { SAWERIA_URL } from '@/lib/site'

export default function Support() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-8 sm:p-12 text-center text-primary-foreground">
      <div
        className="absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, #ffffff, transparent)' }}
        aria-hidden
      />
      <div className="relative">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">☕</span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Dukung CekVPS</h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-primary-foreground/85">
          CekVPS gratis dan tanpa iklan. Kalau tools ini ngebantu kamu pilih VPS,
          traktir kopi seikhlasnya lewat Saweria. Semua dipakai buat bayar server
          dan update harga rutin. 🙏
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <Button asChild size="lg" className="bg-white font-semibold text-primary hover:bg-white/90">
            <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">💛 Dukung via Saweria</a>
          </Button>
          <span className="text-xs text-primary-foreground/70">Sukarela · sekali atau berkala · mulai Rp1.000</span>
        </div>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { SAWERIA_URL } from '@/lib/site'

export default function Support() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-8 sm:p-12 text-primary-foreground">
      <div
        className="absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, #ffffff, transparent)' }}
        aria-hidden
      />
      <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto] sm:gap-12">
        {/* left: copy */}
        <div className="text-center sm:text-left">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">☕</span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Traktir kopi ☕</h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-primary-foreground/85 sm:mx-0">
            CekVPS gratis dan tanpa iklan. Kalau tools ini ngebantu kamu pilih VPS,
            traktir kopi seikhlasnya lewat Saweria. Semua dipakai buat bayar server
            dan update harga rutin. 🙏
          </p>
          <div className="mt-6 flex flex-col items-center gap-2 sm:items-start">
            <Button asChild size="lg" className="bg-white font-semibold text-primary hover:bg-white/90">
              <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">☕ Traktir kopi via Saweria</a>
            </Button>
            <span className="text-xs text-primary-foreground/70">Sukarela · sekali atau berkala · mulai Rp1.000</span>
          </div>
        </div>

        {/* right: scan-to-pay from phone (QRIS-friendly); hidden on mobile */}
        <div className="hidden shrink-0 flex-col items-center gap-3 sm:flex">
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <img
              src="/saweria-qr.svg"
              alt="QR ke halaman Saweria zanuartri"
              width="176"
              height="176"
              className="block h-44 w-44"
            />
          </div>
          <span className="text-xs text-primary-foreground/70">Scan buat traktir dari HP</span>
        </div>
      </div>
    </div>
  )
}

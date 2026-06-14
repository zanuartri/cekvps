import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SAWERIA_URL, AFFILIATE_DISCLOSURE } from '@/lib/site'

export default function Support() {
  return (
    <section id="dukung">
      <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-primary to-accent/80 text-white">
        <CardContent className="p-8 sm:p-10 text-center space-y-5">
          <div className="text-4xl">☕</div>
          <h2 className="text-2xl font-bold">Dukung CekVPS</h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
            CekVPS gratis dan tanpa iklan. Kalau tools ini ngebantu kamu pilih VPS,
            traktir kopi seikhlasnya lewat Saweria — semua dipakai buat bayar server &
            rutin update harga. 🙏
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">
                💛 Dukung via Saweria
              </a>
            </Button>
            <span className="text-xs text-primary-foreground/70">
              Sukarela • sekali atau berkala • mulai dari Rp1.000
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-primary-foreground/60 max-w-2xl mx-auto pt-2">
            {AFFILIATE_DISCLOSURE}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

import { Badge } from '@/components/ui/badge'

interface HeroProps {
  lastRun: string | null
}

export default function Hero({ lastRun }: HeroProps) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent/80 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl sm:text-4xl">🖥️</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Cek<span className="text-accent-foreground/80">VPS</span>
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed">
          Bandingkan harga VPS dari provider Indonesia & global. Hitung biaya
          deploy app pertamamu — biar gak bingung pas pertama kali.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/20 border-0">
            🎯 Bocah PKL & Mahasiswa
          </Badge>
          <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/20 border-0">
            🇮🇩 Harga Rupiah & Global
          </Badge>
          <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/20 border-0">
            ⚡ Update {lastRun ? 'mingguan' : '—'}
          </Badge>
        </div>
      </div>
    </header>
  )
}

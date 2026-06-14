import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { VPSPlan } from '@/lib/types'
import { timeAgo } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { SAWERIA_URL } from '@/lib/site'
import ProviderLogo from '@/components/ProviderLogo'

interface HeroProps {
  vps: VPSPlan[]
  lastRun: string | null
}

const EASE = [0.22, 1, 0.36, 1] as const

export default function Hero({ vps, lastRun }: HeroProps) {
  const reduce = useReducedMotion()
  const providers = useMemo(() => [...new Set(vps.map(p => p.provider))], [vps])

  return (
    <header className="relative overflow-hidden border-b bg-background">
      <div className="absolute inset-0 bg-grid" aria-hidden />
      <div
        className="absolute -top-32 -right-20 h-[420px] w-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, oklch(0.6 0.22 277 / 0.18), transparent)' }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-8">
        {/* left: copy */}
        <motion.div
          className="text-center lg:text-left"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {providers.length} provider · {vps.length} plan
            {lastRun ? ` · update ${timeAgo(lastRun)}` : ''}
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Cari VPS termurah,{' '}
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              tanpa buka banyak tab.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground leading-relaxed text-pretty lg:mx-0">
            Bandingkan harga VPS lokal & global dalam satu daftar. Sortir, cari, deploy.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button asChild size="lg" className="font-semibold shadow-sm shadow-primary/20">
              <a href="#vps">Lihat daftar VPS ↓</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-medium">
              <a href={SAWERIA_URL} target="_blank" rel="noopener noreferrer">☕ Dukung</a>
            </Button>
          </div>

          {/* trust strip — avatar stack */}
          <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2.5">
              {providers.slice(0, 7).map(p => (
                <ProviderLogo
                  key={p}
                  provider={p}
                  size={32}
                  rounded="rounded-full"
                  className="ring-2 ring-background"
                />
              ))}
              {providers.length > 7 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-muted-foreground ring-2 ring-background">
                  +{providers.length - 7}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{providers.length} provider lokal & global</span>
          </div>
        </motion.div>

        {/* right: decorative network art */}
        <div className="hidden lg:flex justify-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="w-full lg:scale-110"
          >
            <NetworkArt reduce={!!reduce} />
          </motion.div>
        </div>
      </div>
    </header>
  )
}

const HUB = { x: 210, y: 190 }
const R = 142
// hexagon of satellite nodes around the hub
const NODES = [-90, -30, 30, 90, 150, 210].map((deg, i) => {
  const a = (deg * Math.PI) / 180
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#6366f1', '#0ea5e9', '#a855f7']
  const r = i % 2 === 0 ? 13 : 10
  return { x: HUB.x + R * Math.cos(a), y: HUB.y + R * Math.sin(a), c: colors[i], r }
})

function Glyph({ x, y, kind }: { x: number; y: number; kind: number }) {
  // tiny decorative icon inside a node (server / globe / stack)
  const s = 'white'
  if (kind === 0) return <g stroke={s} strokeWidth={1.4} fill="none" opacity={0.95}><circle cx={x} cy={y} r={4.6} /><line x1={x - 4.6} y1={y} x2={x + 4.6} y2={y} /><path d={`M${x} ${y - 4.6} Q${x + 3} ${y} ${x} ${y + 4.6} Q${x - 3} ${y} ${x} ${y - 4.6}`} /></g>
  if (kind === 1) return <g stroke={s} strokeWidth={1.4} fill="none" opacity={0.95}><rect x={x - 4.5} y={y - 4.5} width={9} height={4} rx={1} /><rect x={x - 4.5} y={y + 0.5} width={9} height={4} rx={1} /></g>
  return <g stroke={s} strokeWidth={1.4} fill="none" opacity={0.95}><path d={`M${x - 4.5} ${y} L${x} ${y - 4} L${x + 4.5} ${y} L${x} ${y + 4} Z`} /></g>
}

function NetworkArt({ reduce }: { reduce: boolean }) {
  return (
    <svg viewBox="28 28 364 324" className="h-auto w-full" role="img" aria-label="Jaringan VPS">
      <defs>
        <linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="haze" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ambient haze */}
      <circle cx={HUB.x} cy={HUB.y} r={150} fill="url(#haze)" />

      {/* rotating dashed orbit rings */}
      {[88, 142].map((r, i) => (
        <motion.circle
          key={`o-${i}`}
          cx={HUB.x} cy={HUB.y} r={r}
          fill="none" stroke="#a78bfa" strokeOpacity={0.28}
          strokeWidth={1} strokeDasharray={i === 0 ? '2 8' : '3 11'}
          initial={reduce ? false : { rotate: 0 }}
          animate={reduce ? undefined : { rotate: i === 0 ? 360 : -360 }}
          transition={{ duration: i === 0 ? 38 : 55, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
        />
      ))}

      {/* connecting lines with flowing dashes */}
      {NODES.map((n, i) => (
        <motion.line
          key={`l-${i}`}
          x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y}
          stroke="url(#lineGrad)" strokeWidth={2}
          strokeDasharray="3 9" strokeLinecap="round"
          initial={reduce ? false : { strokeDashoffset: 0 }}
          animate={reduce ? undefined : { strokeDashoffset: -48 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* data packets travelling node -> hub */}
      {!reduce && NODES.map((n, i) => (
        <motion.circle
          key={`pk-${i}`}
          r={2.6} fill="#c4b5fd"
          initial={{ cx: n.x, cy: n.y, opacity: 0 }}
          animate={{ cx: [n.x, HUB.x], cy: [n.y, HUB.y], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeIn', delay: i * 0.45 }}
        />
      ))}

      {/* pulse rings from hub */}
      {!reduce && [0, 1.3].map((delay, i) => (
        <motion.circle
          key={`p-${i}`}
          cx={HUB.x} cy={HUB.y} r={44}
          fill="none" stroke="#7c3aed" strokeWidth={1.5}
          initial={{ scale: 1, opacity: 0.45 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay }}
          style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
        />
      ))}

      {/* satellite nodes */}
      {NODES.map((n, i) => (
        <g key={`n-${i}`}>
          <circle cx={n.x} cy={n.y} r={n.r + 9} fill={n.c} opacity={0.16} filter="url(#soft)" />
          <motion.g
            initial={reduce ? false : { scale: 0.86, opacity: 0.85 }}
            animate={reduce ? undefined : { scale: [0.86, 1.08, 0.86], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.c} />
            <Glyph x={n.x} y={n.y} kind={i % 3} />
          </motion.g>
        </g>
      ))}

      {/* ambient particles */}
      {!reduce && [[40, 60], [380, 90], [56, 320], [372, 300]].map(([px, py], i) => (
        <motion.circle
          key={`d-${i}`}
          cx={px} cy={py} r={2} fill="#a78bfa"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -6, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}

      {/* hub */}
      <circle cx={HUB.x} cy={HUB.y} r={54} fill="url(#hubGrad)" opacity={0.18} filter="url(#soft)" />
      <circle cx={HUB.x} cy={HUB.y} r={42} fill="url(#hubGrad)" />
      <circle cx={HUB.x} cy={HUB.y} r={42} fill="none" stroke="white" strokeOpacity={0.25} strokeWidth={1} />
      {/* server glyph */}
      <g stroke="white" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.96}>
        <rect x={HUB.x - 18} y={HUB.y - 17} width={36} height={14} rx={3.5} />
        <rect x={HUB.x - 18} y={HUB.y + 3} width={36} height={14} rx={3.5} />
      </g>
      <g fill="#c4b5fd">
        <circle cx={HUB.x - 11} cy={HUB.y - 10} r={1.8} />
        <circle cx={HUB.x - 11} cy={HUB.y + 10} r={1.8} />
      </g>
    </svg>
  )
}
